const GALLERY_USAGE_COMMAND = 'pnpm run build-gallery-usage'

import { manifest as generatedManifest } from './generated-manifest.g'
import { ManifestSchema, type Manifest } from './manifest.schema'

let cachedManifest: Manifest | null = null

export function readManifest(): Manifest {
  if (cachedManifest) {
    return cachedManifest
  }

  try {
    cachedManifest = ManifestSchema.parse(generatedManifest)
    return cachedManifest
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(
      [
        `Gallery manifest validation failed: ${message}`,
        `Run \`${GALLERY_USAGE_COMMAND}\` to regenerate src/components/gallery/generated-manifest.ts.`,
      ].join(' '),
    )
  }
}

export function resetManifestCache(): void {
  cachedManifest = null
}
