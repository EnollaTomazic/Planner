import path from 'node:path'
import fg from 'fast-glob'
import { fileURLToPath } from 'node:url'
import { Project } from 'ts-morph'
import ts from 'typescript'

type Mode = 'apply' | 'dry-run' | 'report'

type AliasRoot = {
  alias: string
  roots: string[]
}

type CliOptions = {
  dryRun: boolean
  report: boolean
  paths: string[]
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

const DEFAULT_GLOBS = [
  'src/**/*.{ts,tsx,js,jsx}',
  'packages/**/*.{ts,tsx,js,jsx}',
  'app/**/*.{ts,tsx,js,jsx}',
  'tests/**/*.{ts,tsx,js,jsx}',
  'storybook/**/*.{ts,tsx,js,jsx}',
  'server/**/*.{ts,tsx,js,jsx}',
  'playwright.config.ts',
  'vitest.config.ts'
]

const ALIAS_ROOTS: AliasRoot[] = [
  { alias: '@ui', roots: ['packages/ui/src'] },
  { alias: '@features', roots: ['packages/features/src'] },
  { alias: '@core', roots: ['packages/core/src'] },
  { alias: '@api', roots: ['packages/api/src'] }
]

const ALLOWED_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mts',
  '.cts',
  '.mjs',
  '.cjs'
])

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { dryRun: false, report: false, paths: [] }
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '--dry-run' || value === '--dry') {
      options.dryRun = true
      continue
    }
    if (value === '--report') {
      options.report = true
      continue
    }
    if (value === '--paths') {
      const collected: string[] = []
      for (let offset = index + 1; offset < argv.length; offset += 1) {
        const candidate = argv[offset]
        if (candidate.startsWith('--')) {
          break
        }
        collected.push(candidate)
        index = offset
      }
      options.paths = collected
    }
  }
  return options
}

function posixRelative(from: string, to: string) {
  const relative = path.relative(from, to)
  return relative.split(path.sep).join('/')
}

function stripExtension(filePath: string) {
  const ext = path.extname(filePath)
  if (ext.length === 0) return filePath
  return ALLOWED_EXTENSIONS.has(ext) ? filePath.slice(0, -ext.length) : filePath
}

function normalizeSpecifier(resolvedPath: string, aliasRoot: string, alias: string) {
  const relativePath = posixRelative(aliasRoot, resolvedPath)
  const withoutExt = stripExtension(relativePath)
  if (withoutExt === 'index') return alias
  const withoutIndex = withoutExt.endsWith('/index') ? withoutExt.slice(0, -('/index'.length)) : withoutExt
  return `${alias}/${withoutIndex}`
}

function resolveSpecifier(
  moduleSpecifier: string,
  sourceFilePath: string,
  compilerOptions: ts.CompilerOptions,
  aliasRoots: AliasRoot[]
) {
  const protectedAliases = ['@ui', '@features', '@core', '@api']
  if (protectedAliases.some(prefix => moduleSpecifier === prefix || moduleSpecifier.startsWith(`${prefix}/`))) {
    return null
  }
  const resolution = ts.resolveModuleName(moduleSpecifier, sourceFilePath, compilerOptions, ts.sys)
  const resolvedPath = resolution.resolvedModule?.resolvedFileName
  if (!resolvedPath) return null
  const normalizedPath = path.normalize(resolvedPath)
  const aliasMatch = aliasRoots.find(entry => entry.roots.some(root => normalizedPath.startsWith(root)))
  if (!aliasMatch) return null
  const rootPath = aliasMatch.roots.find(root => normalizedPath.startsWith(root))
  if (!rootPath) return null
  return normalizeSpecifier(normalizedPath, rootPath, aliasMatch.alias)
}

function main() {
  const argv = process.argv.slice(2)
  const cli = parseArgs(argv)
  const mode: Mode = cli.report ? 'report' : cli.dryRun ? 'dry-run' : 'apply'

  const searchPaths = cli.paths.length > 0 ? cli.paths : DEFAULT_GLOBS
  const absoluteRoots = ALIAS_ROOTS.map(entry => ({
    alias: entry.alias,
    roots: entry.roots.map(root => path.normalize(path.resolve(repoRoot, root)))
  }))

  const globbedFiles = fg.sync(searchPaths, {
    cwd: repoRoot,
    absolute: true,
    ignore: ['**/node_modules/**', '**/.next/**', '**/storybook-static/**', '**/out/**']
  })

  const project = new Project({
    tsConfigFilePath: path.resolve(repoRoot, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true
  })
  project.addSourceFilesAtPaths(globbedFiles)
  const compilerOptions = project.getCompilerOptions()

  const stats = { files: 0, rewrittenFiles: 0, specifiers: 0 }

  for (const sourceFile of project.getSourceFiles()) {
    stats.files += 1
    const sourcePath = sourceFile.getFilePath()
    const replacements: string[] = []
    const modules = [
      ...sourceFile.getImportDeclarations().map(declaration => ({
        get: () => declaration.getModuleSpecifierValue(),
        set: (next: string) => declaration.setModuleSpecifier(next)
      })),
      ...sourceFile
        .getExportDeclarations()
        .filter(declaration => declaration.getModuleSpecifierValue())
        .map(declaration => ({
          get: () => declaration.getModuleSpecifierValue() ?? '',
          set: (next: string) => declaration.setModuleSpecifier(next)
        }))
    ]

    for (const moduleRef of modules) {
      const current = moduleRef.get()
      if (!current) continue
      const next = resolveSpecifier(current, sourcePath, compilerOptions, absoluteRoots)
      if (next && next !== current) {
        if (mode === 'apply') {
          moduleRef.set(next)
        }
        stats.specifiers += 1
        replacements.push(`${current} -> ${next}`)
      }
    }

    if (replacements.length > 0 && mode !== 'apply') {
      console.log(`(${mode}) ${posixRelative(repoRoot, sourcePath)}`)
      for (const replacement of replacements) {
        console.log(`  ${replacement}`)
      }
    }

    if (mode === 'apply' && replacements.length > 0) {
      stats.rewrittenFiles += 1
    }
  }

  if (mode === 'apply') {
    project.saveSync()
  }

  console.log(`Processed ${stats.files} files. Updated ${stats.rewrittenFiles} files and ${stats.specifiers} specifiers in ${mode} mode.`)
}

main()
