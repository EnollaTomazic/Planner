import * as React from "react";

import {
  galleryPayload,
  galleryPreviewModules,
  type GalleryPreviewModuleManifest,
} from "./generated-manifest";
import type {
  GalleryEntryKind,
  GalleryPreviewRenderer,
  GallerySection,
  GallerySectionId,
} from "./registry";

type GalleryModuleExport = {
  readonly default: GallerySection | readonly GallerySection[];
};

const previewModuleIndex = new Map<string, GalleryPreviewModuleManifest>();

for (const manifest of galleryPreviewModules) {
  for (const previewId of manifest.previewIds) {
    previewModuleIndex.set(previewId, manifest);
  }
}

const modulePreviewCache = new WeakMap<
  GalleryPreviewModuleManifest,
  Map<string, GalleryPreviewRenderer>
>();

const moduleLoadCache = new WeakMap<
  GalleryPreviewModuleManifest,
  Promise<Map<string, GalleryPreviewRenderer>>
>();

const previewComponentCache = new Map<
  string,
  React.LazyExoticComponent<React.ComponentType>
>();

const previewRendererCache = new Map<string, GalleryPreviewRenderer>();

const normalizeSections = (
  exported: GalleryModuleExport["default"],
): readonly GallerySection[] => {
  return (Array.isArray(exported) ? exported : [exported]) as readonly GallerySection[];
};

const collectModulePreviews = (
  sections: readonly GallerySection[],
): Map<string, GalleryPreviewRenderer> => {
  const map = new Map<string, GalleryPreviewRenderer>();
  for (const section of sections) {
    for (const entry of section.entries) {
      map.set(entry.preview.id, entry.preview.render);
      if (entry.states) {
        for (const state of entry.states) {
          map.set(state.preview.id, state.preview.render);
        }
      }
    }
  }
  return map;
};

const loadModulePreviews = (
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

const getLazyPreviewComponent = (
  id: string,
  manifest: GalleryPreviewModuleManifest,
) => {
  let component = previewComponentCache.get(id);
  if (component) {
    return component;
  }

  component = React.lazy(async () => {
    const previews = await loadModulePreviews(manifest);
    const render = previews.get(id);
    if (!render) {
      throw new Error(`Gallery preview \"${id}\" not found in module`);
    }
    const PreviewComponent: React.FC = () =>
      React.createElement(React.Fragment, undefined, render());
    PreviewComponent.displayName = `GalleryPreview(${id})`;
    return { default: PreviewComponent };
  });

  previewComponentCache.set(id, component);
  return component;
};

export { galleryPayload };

export const getGalleryPreviewRenderer = (
  id: string,
): GalleryPreviewRenderer | null => {
  const cached = previewRendererCache.get(id);
  if (cached) {
    return cached;
  }

  const manifest = previewModuleIndex.get(id);
  if (!manifest) {
    return null;
  }

  const LazyComponent = getLazyPreviewComponent(id, manifest);
  const renderer: GalleryPreviewRenderer = () =>
    React.createElement(LazyComponent);

  previewRendererCache.set(id, renderer);
  return renderer;
};

export const getGalleryEntriesByKind = (
  kind: GalleryEntryKind,
) => galleryPayload.byKind[kind];

export const getGallerySection = (id: GallerySectionId) =>
  galleryPayload.sections.find((section) => section.id === id) ?? null;
