declare module './generated-manifest.g' {
  import type {
    GalleryPreviewModuleManifest,
    GalleryPreviewRoute,
    Manifest,
  } from './manifest.schema'
  import type { GalleryRegistryPayload } from './registry'

  export const galleryPayload: GalleryRegistryPayload
  export const galleryPreviewModules: Readonly<
    Record<string, GalleryPreviewModuleManifest>
  >
  export const galleryPreviewRoutes: readonly GalleryPreviewRoute[]
  export const manifest: Manifest
  export default manifest
}

declare module './usage.json' {
  interface GalleryUsageStateEntry {
    readonly routes: readonly string[]
  }

  interface GalleryUsageEntry {
    readonly routes: readonly string[]
    readonly states?: Readonly<Record<string, GalleryUsageStateEntry>>
  }

  const usage: Readonly<Record<string, GalleryUsageEntry>>
  export default usage
}
