"use server";

import path from "node:path";
import { pathToFileURL } from "node:url";
import fg from "fast-glob";
import {
  createGalleryRegistry,
  type GalleryEntryKind,
  type GalleryRegistry,
  type GallerySection,
  type GallerySectionId,
  type GallerySerializableEntry,
  formatGallerySectionLabel,
} from "./registry";
import {
  GALLERY_SECTION_GROUPS,
  type GalleryHeroCopy,
  type GallerySectionGroupKey,
  type GallerySectionMeta,
} from "./metadata";

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

export interface GalleryNavigationSection {
  id: GallerySectionId;
  label: string;
  copy: GalleryHeroCopy;
  groupId: GallerySectionGroupKey;
}

export interface GalleryNavigationGroup {
  id: GallerySectionGroupKey;
  label: string;
  copy: GalleryHeroCopy;
  sections: readonly GalleryNavigationSection[];
}

export interface GalleryNavigationData {
  groups: readonly GalleryNavigationGroup[];
}

const formatSectionLabel = (section: GallerySectionMeta): string => {
  if (section.label) {
    return section.label;
  }
  return formatGallerySectionLabel(section.id);
};

export const loadGalleryNavigation = async (): Promise<GalleryNavigationData> => {
  const registry = await loadGalleryRegistry();
  const availableSections = new Set(
    registry.payload.sections.map((section) => section.id),
  );

  const groups: GalleryNavigationGroup[] = GALLERY_SECTION_GROUPS.map(
    (group) => {
      const sections: GalleryNavigationSection[] = group.sections
        .filter((section) => availableSections.has(section.id))
        .map((section) => ({
          id: section.id,
          label: formatSectionLabel(section),
          copy: section.copy,
          groupId: group.id,
        }));

      return {
        id: group.id,
        label: group.label,
        copy: group.copy,
        sections,
      } satisfies GalleryNavigationGroup;
    },
  );

  return { groups } satisfies GalleryNavigationData;
};

export type { GalleryHeroCopy, GallerySectionGroupKey } from "./metadata";
