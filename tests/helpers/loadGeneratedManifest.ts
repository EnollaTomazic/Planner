import fs from 'node:fs'
import path from 'node:path'

import type { GalleryModuleExport } from '@/components/gallery/manifest.schema'
import {
  ManifestSchema,
  type Manifest,
} from '@/components/gallery/manifest.schema'

const MANIFEST_RUNTIME_PATH = path.resolve(
  process.cwd(),
  'src/components/gallery/generated-manifest.runtime.json',
)

const GALLERY_USAGE_COMMAND = 'pnpm run build-gallery-usage'

const RUNTIME_MANIFEST_ERROR_MESSAGE =
  `Failed to load generated gallery manifest runtime payload. Run \`${GALLERY_USAGE_COMMAND}\` to regenerate src/components/gallery/generated-manifest.runtime.json.`

interface RuntimePreviewModuleManifest {
  readonly previewIds: unknown
}

interface RuntimeManifestFile {
  readonly galleryPayload?: unknown
  readonly galleryPreviewRoutes?: unknown
  readonly galleryPreviewModules?: Record<string, RuntimePreviewModuleManifest>
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isStringArray = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

const createStubLoader = () =>
  async (): Promise<GalleryModuleExport> =>
    ({ default: [] } as unknown as GalleryModuleExport)

let cachedManifest: Manifest | null = null

function readRuntimeManifest(): RuntimeManifestFile {
  let contents: string

  try {
    contents = fs.readFileSync(MANIFEST_RUNTIME_PATH, 'utf-8')
  } catch (error) {
    throw new Error(RUNTIME_MANIFEST_ERROR_MESSAGE)
  }

  try {
    const parsed = JSON.parse(contents)
    if (!isRecord(parsed)) {
      throw new Error('Runtime manifest is not an object')
    }

    return parsed as RuntimeManifestFile
  } catch (error) {
    throw new Error(RUNTIME_MANIFEST_ERROR_MESSAGE)
  }
}

function buildPreviewModuleManifests(
  rawModules: RuntimeManifestFile['galleryPreviewModules'],
): Manifest['galleryPreviewModules'] {
  if (!isRecord(rawModules)) {
    throw new Error(RUNTIME_MANIFEST_ERROR_MESSAGE)
  }

  const stubLoader = createStubLoader()
  const entries = Object.entries(rawModules).map(([importPath, value]) => {
    if (!isRecord(value)) {
      throw new Error(RUNTIME_MANIFEST_ERROR_MESSAGE)
    }

    const { previewIds } = value
    if (!isStringArray(previewIds)) {
      throw new Error(RUNTIME_MANIFEST_ERROR_MESSAGE)
    }

    return [
      importPath,
      {
        loader: stubLoader,
        previewIds: Object.freeze([...previewIds]),
      },
    ] as const
  })

  return Object.freeze(Object.fromEntries(entries)) as Manifest['galleryPreviewModules']
}

function parseRuntimeManifest(raw: RuntimeManifestFile): Manifest {
  const manifestCandidate = {
    galleryPayload: raw.galleryPayload,
    galleryPreviewRoutes: raw.galleryPreviewRoutes,
    galleryPreviewModules: buildPreviewModuleManifests(
      raw.galleryPreviewModules,
    ),
  }

  return ManifestSchema.parse(manifestCandidate)
}

export function loadGeneratedManifest(): Manifest {
  if (cachedManifest) {
    return cachedManifest
  }

  const runtimeManifest = readRuntimeManifest()
  const manifest = parseRuntimeManifest(runtimeManifest)
  cachedManifest = manifest
  return manifest
}

export function resetGeneratedManifestCache(): void {
  cachedManifest = null
}

export const generatedManifest = loadGeneratedManifest()

export const rawJsonManifestErrorMessage = RUNTIME_MANIFEST_ERROR_MESSAGE
