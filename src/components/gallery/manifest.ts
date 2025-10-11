import generatedManifest from './generated-manifest.g'
import { ManifestSchema, type Manifest } from './manifest.schema'

const manifestSource = generatedManifest

export const manifest: Manifest =
  process.env.NODE_ENV !== 'production'
    ? ManifestSchema.parse(manifestSource)
    : (manifestSource as Manifest)

export const { galleryPayload, galleryPreviewModules, galleryPreviewRoutes } =
  manifest
