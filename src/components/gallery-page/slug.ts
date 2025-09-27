import { galleryPayload, GALLERY_SECTION_IDS } from "@/components/gallery";
import {
  GALLERY_SECTION_GROUPS,
  type GallerySectionGroupKey,
} from "@/components/gallery/metadata";
import type {
  GallerySectionId,
  GallerySerializableEntry,
} from "@/components/gallery/registry";

function normalizeSlug(value: string | null | undefined): string {
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

const DEFAULT_VIEW: GallerySectionGroupKey =
  GALLERY_SECTION_GROUPS[0]?.id ?? "primitives";

const SECTION_SLUG_TO_ID = new Map<string, GallerySectionId>();
for (const id of GALLERY_SECTION_IDS) {
  const normalized = normalizeSlug(id);
  if (normalized) {
    SECTION_SLUG_TO_ID.set(normalized, id);
  }
}

const SECTION_TO_GROUP = new Map<GallerySectionId, GallerySectionGroupKey>();
for (const group of GALLERY_SECTION_GROUPS) {
  for (const section of group.sections) {
    if (!SECTION_TO_GROUP.has(section.id)) {
      SECTION_TO_GROUP.set(section.id, group.id);
    }
    const normalized = normalizeSlug(section.id);
    if (normalized) {
      SECTION_SLUG_TO_ID.set(normalized, section.id);
    }
  }
}

const GROUP_SLUG_TO_ID = new Map<string, GallerySectionGroupKey>();
for (const group of GALLERY_SECTION_GROUPS) {
  const normalized = normalizeSlug(group.id);
  if (normalized) {
    GROUP_SLUG_TO_ID.set(normalized, group.id);
  }
}

const VIEW_ALIAS = new Map<string, GallerySectionGroupKey>([
  ["colors", "tokens"],
  ["styles", "tokens"],
  ["elements", "primitives"],
  ["complex", "layouts"],
]);

interface EntryMetadata {
  slug: string;
  section: GallerySectionId;
  view: GallerySectionGroupKey | undefined;
  name: string;
  keywords: Set<string>;
}

const entrySlugMap = new Map<string, EntryMetadata>();
const directEntrySlugs = new Set<string>();
const aliasEntrySlugs = new Set<string>();
const entryMetadataList: EntryMetadata[] = [];

function addKeyword(set: Set<string>, value: string | null | undefined) {
  const normalized = normalizeSlug(value);
  if (!normalized) {
    return;
  }
  set.add(normalized);
  const parts = normalized.split("-");
  for (const part of parts) {
    if (part) {
      set.add(part);
    }
  }
}

function registerDirectSlug(slug: string, metadata: EntryMetadata) {
  if (!slug) {
    return;
  }
  entrySlugMap.set(slug, metadata);
  directEntrySlugs.add(slug);
}

function registerAliasSlug(slug: string, metadata: EntryMetadata) {
  if (!slug) {
    return;
  }
  if (entrySlugMap.has(slug)) {
    return;
  }
  if (SECTION_SLUG_TO_ID.has(slug)) {
    return;
  }
  entrySlugMap.set(slug, metadata);
  aliasEntrySlugs.add(slug);
}

function buildEntryMetadata(entry: GallerySerializableEntry, section: GallerySectionId) {
  const view = SECTION_TO_GROUP.get(section);
  const slug = normalizeSlug(entry.id);
  if (!slug) {
    return;
  }
  const keywords = new Set<string>();
  addKeyword(keywords, entry.id);
  addKeyword(keywords, entry.name);
  if (entry.tags) {
    for (const tag of entry.tags) {
      addKeyword(keywords, tag);
    }
  }
  const metadata: EntryMetadata = {
    slug,
    section,
    view,
    name: entry.name,
    keywords,
  };
  entryMetadataList.push(metadata);
  registerDirectSlug(slug, metadata);

  const tagSlugs = new Set<string>();
  if (entry.tags) {
    for (const tag of entry.tags) {
      const normalized = normalizeSlug(tag);
      if (normalized) {
        tagSlugs.add(normalized);
      }
    }
  }
  for (const tag of tagSlugs) {
    registerAliasSlug(normalizeSlug(`${tag}-${slug}`), metadata);
    registerAliasSlug(normalizeSlug(`${slug}-${tag}`), metadata);
    if (!slug.endsWith("s")) {
      registerAliasSlug(normalizeSlug(`${tag}-${slug}s`), metadata);
      registerAliasSlug(normalizeSlug(`${slug}s-${tag}`), metadata);
    }
    if (!tag.endsWith("s")) {
      registerAliasSlug(normalizeSlug(`${tag}s-${slug}`), metadata);
      registerAliasSlug(normalizeSlug(`${tag}s-${slug}s`), metadata);
    }
  }
}

for (const section of galleryPayload.sections) {
  for (const entry of section.entries) {
    buildEntryMetadata(entry, section.id);
  }
}

const ALL_KNOWN_SLUGS = [
  ...new Set([
    ...Array.from(VIEW_ALIAS.keys()),
    ...Array.from(GROUP_SLUG_TO_ID.keys()),
    ...Array.from(SECTION_SLUG_TO_ID.keys()),
    ...Array.from(directEntrySlugs.values()),
    ...Array.from(aliasEntrySlugs.values()),
  ]),
];

export interface ResolvedComponentsSlug {
  section?: GallerySectionId;
  view?: GallerySectionGroupKey;
  query?: string;
  viewExplicit?: boolean;
}

export function resolveComponentsSlug(
  rawSlug: string,
): ResolvedComponentsSlug | null {
  const normalized = normalizeSlug(rawSlug);
  if (!normalized) {
    return null;
  }

  const aliasView = VIEW_ALIAS.get(normalized);
  if (aliasView) {
    return { view: aliasView, viewExplicit: true };
  }

  const section = SECTION_SLUG_TO_ID.get(normalized);
  if (section) {
    const view = SECTION_TO_GROUP.get(section);
    return { section, view, viewExplicit: false };
  }

  const group = GROUP_SLUG_TO_ID.get(normalized);
  if (group) {
    return { view: group, viewExplicit: true };
  }

  const directEntry = entrySlugMap.get(normalized);
  if (directEntry) {
    return {
      section: directEntry.section,
      view: directEntry.view,
      query: directEntry.name,
      viewExplicit: false,
    };
  }

  const words = normalized.split("-").filter(Boolean);
  let bestMatch: EntryMetadata | null = null;
  let bestScore = 0;

  for (const metadata of entryMetadataList) {
    let score = 0;
    for (const word of words) {
      if (
        metadata.keywords.has(word) ||
        (word.endsWith("s") && metadata.keywords.has(word.slice(0, -1)))
      ) {
        score += 1;
      } else {
        score = 0;
        break;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = metadata;
    }
  }

  if (bestMatch && bestScore > 0) {
    return {
      section: bestMatch.section,
      view: bestMatch.view,
      query: bestMatch.name,
      viewExplicit: false,
    };
  }

  return null;
}

export function getAllComponentSlugs(): readonly string[] {
  return ALL_KNOWN_SLUGS;
}

export { DEFAULT_VIEW as DEFAULT_COMPONENTS_VIEW };
