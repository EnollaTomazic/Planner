import {
  createGalleryRegistry,
  type GalleryEntryKind,
  type GalleryPreviewRenderer,
  type GallerySection,
  type GallerySectionId,
} from "./registry";

interface GalleryModule {
  default: GallerySection | GallerySection[];
}

const galleryModules = import.meta.glob<GalleryModule>(
  "../**/*.gallery.{ts,tsx}",
  { eager: true },
);

const collectedSections: GallerySection[] = [];

for (const mod of Object.values(galleryModules)) {
  const sections = Array.isArray(mod.default) ? mod.default : [mod.default];
  collectedSections.push(...sections);
}

const registry = createGalleryRegistry(collectedSections);

export const galleryPayload = registry.payload;

export const getGalleryPreviewRenderer = (
  id: string,
): GalleryPreviewRenderer | null => {
  return registry.previews.get(id) ?? null;
};

export const getGalleryEntriesByKind = (
  kind: GalleryEntryKind,
) => registry.payload.byKind[kind];

export const getGallerySection = (id: GallerySectionId) =>
  registry.payload.sections.find((section) => section.id === id) ?? null;
