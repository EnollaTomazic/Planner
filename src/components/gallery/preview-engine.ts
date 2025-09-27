import {
  galleryPayload,
  galleryPreviewModules,
  galleryPreviewRoutes,
  type GalleryPreviewModuleManifest,
} from "./generated-manifest";
import type {
  GalleryPreviewRenderer,
  GalleryPreviewRoute,
  GallerySection,
} from "./registry";

export { galleryPayload, galleryPreviewModules, galleryPreviewRoutes };
export type { GalleryPreviewModuleManifest, GalleryPreviewRenderer, GalleryPreviewRoute };

export type GalleryModuleExport = {
  readonly default: unknown;
};

const previewModuleIndex = new Map<string, GalleryPreviewModuleManifest>();
for (const manifest of galleryPreviewModules) {
  for (const previewId of manifest.previewIds) {
    previewModuleIndex.set(previewId, manifest);
  }
}

const previewRouteIndex = new Map<string, GalleryPreviewRoute>();
for (const route of galleryPreviewRoutes) {
  previewRouteIndex.set(route.slug, route);
}

const modulePreviewCache = new WeakMap<
  GalleryPreviewModuleManifest,
  Map<string, GalleryPreviewRenderer>
>();

const moduleLoadCache = new WeakMap<
  GalleryPreviewModuleManifest,
  Promise<Map<string, GalleryPreviewRenderer>>
>();

const isGallerySection = (value: unknown): value is GallerySection => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as { entries?: unknown };
  return Array.isArray(candidate.entries);
};

const normalizeSections = (
  exported: GalleryModuleExport["default"],
): readonly GallerySection[] => {
  if (Array.isArray(exported)) {
    return exported.filter(isGallerySection);
  }

  if (isGallerySection(exported)) {
    return [exported];
  }

  return [];
};

const collectModulePreviews = (
  sections: readonly GallerySection[],
): Map<string, GalleryPreviewRenderer> => {
  const map = new Map<string, GalleryPreviewRenderer>();
  for (const section of sections) {
    if (!Array.isArray(section.entries)) {
      continue;
    }

    for (const entry of section.entries) {
      const preview = entry?.preview;
      if (preview && typeof preview.id === "string" && typeof preview.render === "function") {
        map.set(preview.id, preview.render);
      }

      if (!Array.isArray(entry?.states)) {
        continue;
      }

      for (const state of entry.states) {
        const statePreview = state?.preview;
        if (
          statePreview &&
          typeof statePreview.id === "string" &&
          typeof statePreview.render === "function"
        ) {
          map.set(statePreview.id, statePreview.render);
        }
      }
    }
  }
  return map;
};

export const loadModulePreviews = (
  manifest: GalleryPreviewModuleManifest,
): Promise<Map<string, GalleryPreviewRenderer>> => {
  const cached = modulePreviewCache.get(manifest);
  if (cached) {
    return Promise.resolve(cached);
  }

  const pending = moduleLoadCache.get(manifest);
  if (pending) {
    return pending;
  }

  const promise = manifest
    .loader()
    .then((module: GalleryModuleExport) => {
      const sections = normalizeSections(module.default);
      const previews = collectModulePreviews(sections);
      modulePreviewCache.set(manifest, previews);
      return previews;
    })
    .catch((error) => {
      modulePreviewCache.delete(manifest);
      moduleLoadCache.delete(manifest);
      throw error;
    });

  moduleLoadCache.set(manifest, promise);
  return promise;
};

export const getPreviewManifest = (id: string) => previewModuleIndex.get(id) ?? null;
export const getPreviewRoute = (slug: string) => previewRouteIndex.get(slug) ?? null;
export const getAllPreviewRoutes = () => galleryPreviewRoutes;
