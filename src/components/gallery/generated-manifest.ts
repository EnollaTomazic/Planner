// Auto-generated placeholder for gallery manifest
// Do not edit directly without syncing with gallery scripts.
import type {
  GalleryPreviewRoute,
  GalleryRegistryPayload,
  GallerySection,
  GallerySerializableEntry,
} from "./registry";

interface GalleryModuleExport {
  readonly default: GallerySection | readonly GallerySection[];
}

export interface GalleryPreviewModuleManifest {
  readonly loader: () => Promise<GalleryModuleExport>;
  readonly previewIds: readonly string[];
}

export const galleryPayload = {
  sections: [] as GallerySection[],
  byKind: {
    primitive: [] as GallerySerializableEntry[],
    component: [] as GallerySerializableEntry[],
    complex: [] as GallerySerializableEntry[],
    token: [] as GallerySerializableEntry[],
  },
} satisfies GalleryRegistryPayload;

const galleryPreviewRoutesData = [] as const;

export const galleryPreviewRoutes =
  galleryPreviewRoutesData as unknown as readonly GalleryPreviewRoute[];

export const galleryPreviewModules =
  [] as unknown as readonly GalleryPreviewModuleManifest[];

export default galleryPreviewModules;
