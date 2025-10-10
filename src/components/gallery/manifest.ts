import {
  galleryPayload as generatedGalleryPayload,
  galleryPreviewModules as generatedGalleryPreviewModules,
  galleryPreviewRoutes as generatedGalleryPreviewRoutes,
} from './generated-manifest'
import { ManifestSchema, type Manifest } from './manifest.schema'

const manifestSource = {
  galleryPayload: generatedGalleryPayload,
  galleryPreviewModules: generatedGalleryPreviewModules,
  galleryPreviewRoutes: generatedGalleryPreviewRoutes,
}

let manifest: Manifest

if (process.env.NODE_ENV !== 'production') {
  try {
    manifest = ManifestSchema.parse(manifestSource)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Gallery manifest validation failed: ${message}`)
  }
} else {
  manifest = manifestSource as Manifest
}

export const { galleryPayload, galleryPreviewModules, galleryPreviewRoutes } = manifest

export default manifest
