import * as React from "react";

import {
  galleryPayload,
  getAllPreviewRoutes,
  getPreviewAxisParams,
  getPreviewAxes,
  getPreviewAxisSummary,
  getPreviewEntry,
  getPreviewManifest,
  getPreviewRoute,
  getPreviewState,
} from "./preview-engine";
import PreviewRendererClient from "./PreviewRendererClient";
import type {
  GalleryEntryKind,
  GalleryPreviewRenderer,
  GallerySectionId,
} from "./registry";

const previewRendererCache = new Map<string, GalleryPreviewRenderer>();

export { galleryPayload };

export const getGalleryPreviewRenderer = (
  id: string,
): GalleryPreviewRenderer | null => {
  if (!getPreviewManifest(id)) {
    return null;
  }

  const cached = previewRendererCache.get(id);
  if (cached) {
    return cached;
  }

  const renderer: GalleryPreviewRenderer = () =>
    React.createElement(PreviewRendererClient, { previewId: id });

  previewRendererCache.set(id, renderer);
  return renderer;
};

export const getGalleryEntriesByKind = (
  kind: GalleryEntryKind,
) => galleryPayload.byKind[kind];

export const getGallerySection = (id: GallerySectionId) =>
  galleryPayload.sections.find((section) => section.id === id) ?? null;

export const getGalleryPreviewRoute = getPreviewRoute;

export const getGalleryPreviewRoutes = () => getAllPreviewRoutes();
export const getGalleryPreviewEntry = getPreviewEntry;
export const getGalleryPreviewState = getPreviewState;
export const getGalleryPreviewAxes = getPreviewAxes;
export const getGalleryPreviewAxisSummary = getPreviewAxisSummary;
export const getGalleryPreviewAxisParams = getPreviewAxisParams;
