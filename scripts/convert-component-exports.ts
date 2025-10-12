import { Project, Node } from 'ts-morph'
import path from 'node:path'

const nextAppRouterFileNames = new Set([
  'page.tsx',
  'layout.tsx',
  'template.tsx',
  'default.tsx',
  'error.tsx',
  'not-found.tsx',
  'loading.tsx',
  'route.ts',
  'head.tsx',
  'icon.tsx',
])

const project = new Project({ tsConfigFilePath: 'tsconfig.json' })

const exportNameByPath = new Map<string, string>()

const deriveExportName = (filePath: string): string => {
  const baseName = path.basename(filePath).replace(/\.(tsx?|jsx?)$/u, '')
  const segments = baseName
    .split(/[^A-Za-z0-9]+/u)
    .filter(Boolean)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
  let candidate = segments.length > 0 ? segments.join('') : 'Component'
  if (!/^[A-Za-z_]/u.test(candidate)) {
    candidate = `Component${candidate}`
  }
  return candidate
}

const ensureNamedExport = (filePath: string, exportName: string) => {
  const file = project.getSourceFileOrThrow(filePath)
  const alreadyExported = file
    .getExportSymbols()
    .some((symbol) => symbol.getName() === exportName)

  if (!alreadyExported) {
    file.addExportDeclaration({ namedExports: [{ name: exportName }] })
  }
}

const componentFiles = project.getSourceFiles('src/components/**/*.{ts,tsx}')

for (const file of componentFiles) {
  if (nextAppRouterFileNames.has(file.getBaseName())) {
    continue
  }

  const filePath = file.getFilePath()
  const defaultSymbol = file.getDefaultExportSymbol()
  if (!defaultSymbol) {
    continue
  }

  let finalExportName: string | undefined

  for (const declaration of defaultSymbol.getDeclarations()) {
    if (Node.isFunctionDeclaration(declaration) || Node.isClassDeclaration(declaration)) {
      let name = declaration.getName()
      if (!name) {
        name = deriveExportName(filePath)
        if ('setName' in declaration) {
          ;(declaration as { setName(next: string): void }).setName(name)
        }
      }
      declaration.setIsDefaultExport(false)
      declaration.setIsExported(true)
      finalExportName = name
      continue
    }

    if (Node.isExportAssignment(declaration)) {
      const expression = declaration.getExpression()
      if (Node.isIdentifier(expression)) {
        const exportName = expression.getText()
        ensureNamedExport(filePath, exportName)
        declaration.remove()
        finalExportName = exportName
        continue
      }

      const exportName = deriveExportName(filePath)
      const initializerText = expression.getText()
      declaration.replaceWithText(`export const ${exportName} = ${initializerText}`)
      finalExportName = exportName
      continue
    }

    if (Node.isVariableDeclaration(declaration)) {
      const variableStatement = declaration.getVariableStatement()
      const name = declaration.getName()
      variableStatement?.setIsDefaultExport(false)
      variableStatement?.setIsExported(true)
      finalExportName = name
      continue
    }
  }

  if (!finalExportName) {
    finalExportName = deriveExportName(filePath)
  }

  exportNameByPath.set(filePath, finalExportName)
}

console.log(`Processed ${componentFiles.length} component files.`)

const allSourceFiles = project.getSourceFiles([
  '{app,src,server,tests,storybook,lib,scripts,docs,types}/**/*.{ts,tsx}',
])

console.log(`Updating imports across ${allSourceFiles.length} source files.`)

for (const file of allSourceFiles) {
  for (const importDecl of file.getImportDeclarations()) {
    const moduleSource = importDecl.getModuleSpecifierSourceFile()
    if (!moduleSource) {
      continue
    }
    const modulePath = moduleSource.getFilePath()
    const exportName = exportNameByPath.get(modulePath)
    if (!exportName) {
      continue
    }

    const defaultImport = importDecl.getDefaultImport()
    if (!defaultImport) {
      continue
    }

    const localName = defaultImport.getText()
    importDecl.removeDefaultImport()

    const namedImports = importDecl.getNamedImports()
    const hasMatchingNamedImport = namedImports.some((namedImport) => {
      const importedName = namedImport.getName()
      const aliasNode = namedImport.getAliasNode()
      if (localName === exportName) {
        return importedName === exportName && !aliasNode
      }
      return importedName === exportName && aliasNode?.getText() === localName
    })

    if (!hasMatchingNamedImport) {
      if (localName === exportName) {
        importDecl.addNamedImport({ name: exportName })
      } else {
        importDecl.addNamedImport({ name: exportName, alias: localName })
      }
    }

    if (importDecl.getNamedImports().length === 0 && !importDecl.getNamespaceImport()) {
      importDecl.remove()
    }
  }

  for (const exportDecl of file.getExportDeclarations()) {
    const moduleSource = exportDecl.getModuleSpecifierSourceFile()
    if (!moduleSource) {
      continue
    }
    const modulePath = moduleSource.getFilePath()
    const exportName = exportNameByPath.get(modulePath)
    if (!exportName) {
      continue
    }

    for (const namedExport of exportDecl.getNamedExports()) {
      if (namedExport.getName() !== 'default') {
        continue
      }

      namedExport.setName(exportName)
    }
  }
}

let updatedFileCount = 0
for (const file of project.getSourceFiles()) {
  if (!file.isSaved()) {
    await file.save()
    updatedFileCount += 1
  }
}

console.log(`Saved ${updatedFileCount} files.`)
