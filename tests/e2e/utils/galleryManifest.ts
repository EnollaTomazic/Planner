import { createRequire } from "node:module";
import type {
  GalleryAxis,
  GalleryPreviewAxisParam,
  GalleryPreviewRoute,
  GalleryRegistryPayload,
} from "@/components/gallery/registry";

interface ManifestShape {
  readonly galleryPayload: GalleryRegistryPayload;
  readonly galleryPreviewRoutes: readonly GalleryPreviewRoute[];
}

const require = createRequire(import.meta.url);
const manifest = require(
  "../../../src/components/gallery/generated-manifest.runtime.json",
) as ManifestShape;

const { galleryPayload, galleryPreviewRoutes } = manifest;

const stateOwnerIndex = new Map<string, string>();
for (const route of galleryPreviewRoutes) {
  if (!route.stateId || stateOwnerIndex.has(route.stateId)) {
    continue;
  }
  stateOwnerIndex.set(route.stateId, route.entryId);
}

function getEntryAxes(entryId: string): readonly GalleryAxis[] {
  for (const section of galleryPayload.sections) {
    const entry = section.entries.find((candidate) => candidate.id === entryId);
    if (entry) {
      return entry.axes ?? [];
    }
  }
  return [];
}

function normalizeAxisSlug(value: string | null | undefined) {
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
}

function resolveEntryId(entryId: string, stateId: string | null | undefined) {
  if (!stateId) {
    return entryId;
  }
  return stateOwnerIndex.get(stateId) ?? entryId;
}

function getAxisParamsForEntry(
  entryId: string,
): GalleryPreviewAxisParam[] {
  const params: GalleryPreviewAxisParam[] = [];
  const keySet = new Set<string>();

  for (const axis of getEntryAxes(entryId)) {
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

  return params;
}

export function getManifestPreviewRoutes(): readonly GalleryPreviewRoute[] {
  return galleryPreviewRoutes;
}

export function getManifestPreviewAxisParams(
  entryId: string,
  stateId: string | null = null,
): GalleryPreviewAxisParam[] {
  return getAxisParamsForEntry(resolveEntryId(entryId, stateId));
}
