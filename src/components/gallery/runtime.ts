import modules from "./generated-manifest";
import {
  createGalleryRegistry,
  type GalleryEntryKind,
  type GalleryPreviewRenderer,
  type GallerySection,
  type GallerySectionId,
} from "./registry";

const collectedSections: GallerySection[] = [];

for (const mod of modules) {
  const moduleSections = Array.isArray(mod) ? mod : [mod];
  collectedSections.push(...moduleSections);
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
