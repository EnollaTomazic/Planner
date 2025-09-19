"use server";

import path from "node:path";
import { pathToFileURL } from "node:url";
import fg from "fast-glob";
import {
  createGalleryRegistry,
  type GalleryEntryKind,
  type GalleryRegistry,
  type GallerySection,
  type GallerySerializableEntry,
} from "./registry";

interface GalleryModule {
  default: GallerySection | GallerySection[];
}

const GALLERY_GLOB = "src/components/**/**/*.gallery.{ts,tsx}";

export const loadGalleryRegistry = async (): Promise<GalleryRegistry> => {
  const files = await fg(GALLERY_GLOB, { absolute: true });
  const sections: GallerySection[] = [];

  for (const file of files) {
    const moduleUrl = pathToFileURL(path.resolve(file)).href;
    const mod = (await import(moduleUrl)) as GalleryModule;
    const moduleSections = Array.isArray(mod.default)
      ? mod.default
      : [mod.default];
    sections.push(...moduleSections);
  }

  return createGalleryRegistry(sections);
};

export interface GalleryLoaderSlices {
  payload: GalleryRegistry["payload"];
  primitives: readonly GallerySerializableEntry[];
  components: readonly GallerySerializableEntry[];
  complex: readonly GallerySerializableEntry[];
  tokens: readonly GallerySerializableEntry[];
}

export const loadGallerySlices = async (): Promise<GalleryLoaderSlices> => {
  const registry = await loadGalleryRegistry();
  const { payload } = registry;
  return {
    payload,
    primitives: payload.byKind.primitive,
    components: payload.byKind.component,
    complex: payload.byKind.complex,
    tokens: payload.byKind.token,
  };
};

export const loadGalleryByKind = async (
  kind: GalleryEntryKind,
): Promise<readonly GallerySerializableEntry[]> => {
  const registry = await loadGalleryRegistry();
  return registry.payload.byKind[kind];
};
