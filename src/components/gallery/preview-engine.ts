import {
  galleryPayload,
  galleryPreviewModules,
  galleryPreviewRoutes,
  type GalleryPreviewModuleManifest,
} from "./generated-manifest";
import {
  findGalleryEntry,
  findGalleryState,
  getGalleryPreviewAxesFromPayload,
  type GalleryAxis,
  type GalleryPreviewAxisParam,
  type GalleryPreviewRenderer,
  type GalleryPreviewRoute,
  type GalleryRegistryEntryRef,
  type GalleryRegistryStateRef,
  type GallerySection,
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

const stateOwnerIndex = new Map<string, string>();
for (const section of galleryPayload.sections) {
  for (const entry of section.entries) {
    const entryStates =
      "states" in entry && Array.isArray(entry.states) ? entry.states : [];
    for (const state of entryStates) {
      if (!stateOwnerIndex.has(state.id)) {
        stateOwnerIndex.set(state.id, entry.id);
      }
    }
  }
}

const entryLookupCache = new Map<string, GalleryRegistryEntryRef | null>();
const stateLookupCache = new Map<string, GalleryRegistryStateRef | null>();
const entryAxisCache = new Map<string, readonly GalleryAxis[]>();
const previewAxisCache = new Map<string, readonly GalleryAxis[]>();
const axisSummaryCache = new Map<string, string>();
const axisParamsCache = new Map<string, readonly GalleryPreviewAxisParam[]>();

const getEntryLookup = (entryId: string): GalleryRegistryEntryRef | null => {
  if (!entryLookupCache.has(entryId)) {
    entryLookupCache.set(entryId, findGalleryEntry(galleryPayload, entryId));
  }
  return entryLookupCache.get(entryId) ?? null;
};

const getStateLookup = (stateId: string): GalleryRegistryStateRef | null => {
  if (!stateLookupCache.has(stateId)) {
    const entryHint = stateOwnerIndex.get(stateId) ?? null;
    stateLookupCache.set(
      stateId,
      findGalleryState(galleryPayload, stateId, entryHint),
    );
  }
  return stateLookupCache.get(stateId) ?? null;
};

const resolveEntryIdForState = (
  entryId: string,
  stateId: string | null,
): string => {
  if (!stateId) {
    return entryId;
  }
  return stateOwnerIndex.get(stateId) ?? entryId;
};

const getCachedEntryAxes = (entryId: string): readonly GalleryAxis[] => {
  const cached = entryAxisCache.get(entryId);
  if (cached) {
    return cached;
  }
  const axes = getGalleryPreviewAxesFromPayload(galleryPayload, entryId, null);
  entryAxisCache.set(entryId, axes);
  return axes;
};

const getPreviewAxesForTarget = (
  entryId: string,
  stateId: string | null,
): readonly GalleryAxis[] => {
  const key = stateId ? `${entryId}:${stateId}` : entryId;
  const cached = previewAxisCache.get(key);
  if (cached) {
    return cached;
  }

  const axes = getGalleryPreviewAxesFromPayload(galleryPayload, entryId, stateId);
  previewAxisCache.set(key, axes);
  return axes;
};

const normalizeAxisSlug = (value: string | null | undefined): string => {
  if (!value) {
    return "";
  }
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/gu, "-")
    .replace(/[\s_]+/gu, "-")
    .replace(/-+/gu, "-")
    .replace(/^-+|-+$/gu, "");
};

const getAxisParamsForEntry = (
  entryId: string,
): readonly GalleryPreviewAxisParam[] => {
  if (axisParamsCache.has(entryId)) {
    return axisParamsCache.get(entryId)!;
  }

  const params: GalleryPreviewAxisParam[] = [];
  const keySet = new Set<string>();

  for (const axis of getCachedEntryAxes(entryId)) {
    if (axis.type !== "variant" && axis.type !== "state") {
      continue;
    }

    const baseKey =
      normalizeAxisSlug(axis.id) ||
      normalizeAxisSlug(axis.label) ||
      axis.type;

    if (!baseKey) {
      continue;
    }

    const key = `axis-${baseKey}`;
    if (keySet.has(key)) {
      continue;
    }
    keySet.add(key);

    const seenValues = new Set<string>();
    const options = axis.values
      .map((option, index) => {
        const normalized = normalizeAxisSlug(option.value);
        let value = normalized || `value-${index + 1}`;
        while (seenValues.has(value)) {
          value = `${value}-${index + 1}`;
        }
        seenValues.add(value);
        return {
          value,
          label: option.value,
        } satisfies GalleryPreviewAxisParam["options"][number];
      })
      .filter((option) => option.label || option.value);

    if (options.length === 0) {
      continue;
    }

    params.push({
      key,
      label: axis.label,
      type: axis.type,
      options,
    });
  }

  axisParamsCache.set(entryId, params);
  return params;
};

const formatAxisSummary = (axes: readonly GalleryAxis[]): string =>
  axes
    .filter((axis) => axis.values.length > 0)
    .map(
      (axis) =>
        `${axis.label}: ${axis.values
          .map((option) => option.value)
          .join(", ")}`,
    )
    .join(" · ");

const getAxisSummaryForEntry = (entryId: string): string => {
  if (axisSummaryCache.has(entryId)) {
    return axisSummaryCache.get(entryId)!;
  }
  const summary = formatAxisSummary(getCachedEntryAxes(entryId));
  axisSummaryCache.set(entryId, summary);
  return summary;
};

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
export const getPreviewEntry = (entryId: string) => getEntryLookup(entryId);
export const getPreviewState = (
  entryId: string,
  stateId: string | null = null,
) => {
  if (!stateId) {
    return null;
  }
  const lookup = getStateLookup(stateId);
  if (!lookup) {
    return null;
  }
  if (lookup.entry.id !== entryId) {
    return lookup;
  }
  return lookup;
};
export const getPreviewAxes = (
  entryId: string,
  stateId: string | null = null,
) => getPreviewAxesForTarget(resolveEntryIdForState(entryId, stateId), stateId);
export const getPreviewAxisSummary = (
  entryId: string,
  stateId: string | null = null,
) => getAxisSummaryForEntry(resolveEntryIdForState(entryId, stateId));
export const getPreviewAxisParams = (
  entryId: string,
  stateId: string | null = null,
) => getAxisParamsForEntry(resolveEntryIdForState(entryId, stateId));
