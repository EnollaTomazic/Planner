const path = require('node:path')
const ts = require('typescript')

const ALIAS_ROOTS = [
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

const repoRoot = path.resolve(__dirname, '..', '..')
const protectedAliases = ['@ui', '@features', '@core', '@api']

const configPath = ts.findConfigFile(repoRoot, ts.sys.fileExists, 'tsconfig.json')
const parsedConfig = configPath
  ? ts.parseJsonConfigFileContent(ts.readConfigFile(configPath, ts.sys.readFile).config, ts.sys, path.dirname(configPath))
  : { options: {} }
const compilerOptions = parsedConfig.options

const absoluteRoots = ALIAS_ROOTS.map(entry => ({
  alias: entry.alias,
  roots: entry.roots.map(root => path.normalize(path.resolve(repoRoot, root)))
}))

function posixRelative(from, to) {
  return path.relative(from, to).split(path.sep).join('/')
}

function stripExtension(filePath) {
  const ext = path.extname(filePath)
  if (ext.length === 0) return filePath
  return ALLOWED_EXTENSIONS.has(ext) ? filePath.slice(0, -ext.length) : filePath
}

function normalizeSpecifier(resolvedPath, aliasRoot, alias) {
  const relativePath = posixRelative(aliasRoot, resolvedPath)
  const withoutExt = stripExtension(relativePath)
  if (withoutExt === 'index') return alias
  const withoutIndex = withoutExt.endsWith('/index') ? withoutExt.slice(0, -('/index'.length)) : withoutExt
  return `${alias}/${withoutIndex}`
}

function resolveSpecifier(moduleSpecifier, importerPath) {
  if (protectedAliases.some(prefix => moduleSpecifier === prefix || moduleSpecifier.startsWith(`${prefix}/`))) {
    return null
  }
  const resolution = ts.resolveModuleName(moduleSpecifier, importerPath, compilerOptions, ts.sys)
  const resolvedPath = resolution.resolvedModule?.resolvedFileName
  if (!resolvedPath) return null
  const normalizedPath = path.normalize(resolvedPath)
  const aliasMatch = absoluteRoots.find(entry => entry.roots.some(root => normalizedPath.startsWith(root)))
  if (!aliasMatch) return null
  const rootPath = aliasMatch.roots.find(root => normalizedPath.startsWith(root))
  if (!rootPath) return null
  return normalizeSpecifier(normalizedPath, rootPath, aliasMatch.alias)
}

function transformer(file, api, options) {
  const j = api.jscodeshift
  const importerPath = path.resolve(repoRoot, file.path)
  let changed = false
  const replacements = []

  const updateModuleSpecifier = nodePath => {
    const literal = nodePath.value.source
    if (!literal || typeof literal.value !== 'string') return
    const current = literal.value
    const next = resolveSpecifier(current, importerPath)
    if (next && next !== current) {
      if (options.report || options['report-only']) {
        replacements.push(`${current} -> ${next}`)
        return
      }
      literal.value = next
      changed = true
    }
  }

  const root = j(file.source)
  root.find(j.ImportDeclaration).forEach(updateModuleSpecifier)
  root
    .find(j.ExportNamedDeclaration)
    .filter(pathItem => Boolean(pathItem.value.source))
    .forEach(updateModuleSpecifier)
  root
    .find(j.ExportAllDeclaration)
    .filter(pathItem => Boolean(pathItem.value.source))
    .forEach(updateModuleSpecifier)

  if ((options.report || options['report-only']) && replacements.length > 0) {
    console.log(`(report) ${posixRelative(repoRoot, importerPath)}`)
    replacements.forEach(replacement => console.log(`  ${replacement}`))
  }

  if (!changed) return null
  return root.toSource({ quote: 'single', trailingComma: true })
}

module.exports = transformer
module.exports.parser = 'tsx'
