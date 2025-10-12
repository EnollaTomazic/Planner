import { readManifest } from './manifest-loader'

const manifest = readManifest()

export const {
  galleryPayload,
  galleryPreviewModules,
  galleryPreviewRoutes,
} = manifest

export { manifest, readManifest }
