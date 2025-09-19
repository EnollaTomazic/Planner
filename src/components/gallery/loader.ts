import modules from "./generated-manifest";
import tokens from "../../../tokens/tokens.js";
import {
  createGalleryRegistry,
  type GalleryEntryKind,
  type GalleryRegistry,
  type GallerySection,
  type GallerySerializableEntry,
  type GalleryRelatedSurface,
  formatGallerySectionLabel,
} from "./registry";
import usage from "./usage.json";
import {
  GALLERY_SECTION_GROUPS,
  type GallerySectionMeta,
} from "./metadata";
import type {
  GalleryLoaderSlices,
  GalleryNavigationData,
  GalleryNavigationGroup,
  GalleryNavigationSection,
} from "./types";
import {
  buildDesignTokenGroups,
  type DesignTokenGroup,
} from "@/lib/design-token-registry";

const DESIGN_TOKEN_GROUPS = buildDesignTokenGroups(tokens);

type GalleryUsageMap = Record<string, readonly string[]>;

const usageMap = usage as GalleryUsageMap;

const mergeUsageIntoSections = (
  sections: readonly GallerySection[],
  surfacesByEntry: GalleryUsageMap,
): GallerySection[] => {
  return sections.map((section) => {
    let changed = false;
    const entries = section.entries.map((entry) => {
      const routes = surfacesByEntry[entry.id];
      if (!routes || routes.length === 0) {
        return entry;
      }
      const existingSurfaces = entry.related?.surfaces ?? [];
      const mergedSurfaces = mergeSurfaces(existingSurfaces, routes);
      if (mergedSurfaces === existingSurfaces) {
        return entry;
      }
      changed = true;
      return {
        ...entry,
        related: {
          ...entry.related,
          surfaces: mergedSurfaces,
        },
      };
    });
    if (!changed) {
      return section;
    }
    return {
      ...section,
      entries,
    } satisfies GallerySection;
  });
};

const mergeSurfaces = (
  existingSurfaces: readonly GalleryRelatedSurface[],
  routes: readonly string[],
): readonly GalleryRelatedSurface[] => {
  const map = new Map<string, GalleryRelatedSurface>();
  for (const surface of existingSurfaces) {
    map.set(surface.id, surface);
  }
  for (const route of routes) {
    if (!map.has(route)) {
      map.set(route, { id: route });
    }
  }
  const next = Array.from(map.values()).sort((a, b) => a.id.localeCompare(b.id));
  if (next.length === existingSurfaces.length) {
    let matches = true;
    for (let index = 0; index < next.length; index += 1) {
      if (next[index]?.id !== existingSurfaces[index]?.id) {
        matches = false;
        break;
      }
    }
    if (matches) {
      return existingSurfaces;
    }
  }
  return next;
};

const loadGallerySections = (): GallerySection[] => {
  const sections: GallerySection[] = [];

  for (const mod of modules) {
    const moduleSections = Array.isArray(mod) ? mod : [mod];
    sections.push(...moduleSections);
  }

  return sections;
};

export const loadGalleryRegistry = async (): Promise<GalleryRegistry> => {
  const sections = loadGallerySections();

  const enrichedSections = mergeUsageIntoSections(sections, usageMap);

  return createGalleryRegistry(enrichedSections);
};

export const loadGallerySlices = async (): Promise<GalleryLoaderSlices> => {
  const registry = await loadGalleryRegistry();
  const { payload } = registry;
  return {
    payload,
    primitives: payload.byKind.primitive,
    components: payload.byKind.component,
    complex: payload.byKind.complex,
    tokens: DESIGN_TOKEN_GROUPS,
  };
};

export const loadDesignTokenGroups = async (): Promise<
  readonly DesignTokenGroup[]
> => DESIGN_TOKEN_GROUPS;

export const loadGalleryByKind = async (
  kind: GalleryEntryKind,
): Promise<readonly GallerySerializableEntry[]> => {
  const registry = await loadGalleryRegistry();
  return registry.payload.byKind[kind];
};

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

export type {
  GalleryLoaderSlices,
  GalleryNavigationData,
  GalleryNavigationGroup,
  GalleryNavigationSection,
} from "./types";
export type { GalleryHeroCopy, GallerySectionGroupKey } from "./metadata";
export type { DesignTokenGroup } from "@/lib/design-token-registry";
