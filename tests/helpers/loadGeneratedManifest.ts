import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'

import { ManifestSchema, type Manifest } from '@/components/gallery/manifest.schema'

const MANIFEST_PATH = path.resolve(
  process.cwd(),
  'src/components/gallery/generated-manifest.ts',
)

const GALLERY_USAGE_COMMAND = 'pnpm run build-gallery-usage'

const RAW_JSON_ERROR_MESSAGE =
  `Gallery manifest payload appears to contain raw JSON. Run \`${GALLERY_USAGE_COMMAND}\` to regenerate src/components/gallery/generated-manifest.ts.`

const leadingCommentPattern = /^(?:\uFEFF)?\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*/u

type GeneratedManifest = Manifest

export function loadGeneratedManifest(): Manifest {
  const source = fs.readFileSync(MANIFEST_PATH, 'utf-8')
  const sanitized = source.replace(leadingCommentPattern, '').trimStart()

  try {
    JSON.parse(sanitized) as GeneratedManifest
    throw new Error(RAW_JSON_ERROR_MESSAGE)
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      throw error
    }
  }

  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: MANIFEST_PATH,
    reportDiagnostics: true,
  })

  const diagnostics = transpiled.diagnostics ?? []
  if (diagnostics.length > 0) {
    const message = diagnostics
      .map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      )
      .join('\n')

    throw new Error(`Failed to transpile gallery manifest payload: ${message}`)
  }

  const exportsValue: Record<string, unknown> = {}
  const moduleValue: { exports: Record<string, unknown> } = {
    exports: exportsValue,
  }

  try {
    vm.runInNewContext(transpiled.outputText, { exports: exportsValue, module: moduleValue }, {
      filename: MANIFEST_PATH,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to evaluate gallery manifest payload: ${message}`)
  }

  const candidate = {
    galleryPayload: moduleValue.exports.galleryPayload,
    galleryPreviewRoutes: moduleValue.exports.galleryPreviewRoutes,
    galleryPreviewModules: moduleValue.exports.galleryPreviewModules,
  }

  return ManifestSchema.parse(candidate)
}

export const generatedManifest = loadGeneratedManifest()

export const rawJsonManifestErrorMessage = RAW_JSON_ERROR_MESSAGE
