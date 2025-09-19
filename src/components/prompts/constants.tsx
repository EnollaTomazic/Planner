import type { HeaderTab } from "@/components/ui";
import {
  galleryPayload,
  getGalleryPreviewRenderer,
  formatGallerySectionLabel,
  GALLERY_SECTION_IDS,
  type GallerySectionId,
  type GallerySerializableEntry,
} from "@/components/gallery";
import { COLOR_PALETTES } from "@/lib/theme";

export type Section = GallerySectionId;
export type GallerySpec = GallerySerializableEntry;

export const SECTIONS = GALLERY_SECTION_IDS;

export const COLOR_SECTIONS = [
  { title: "Aurora", tokens: COLOR_PALETTES.aurora },
  { title: "Neutrals", tokens: COLOR_PALETTES.neutrals },
  { title: "Accents", tokens: COLOR_PALETTES.accents },
] as const;

const SECTION_ENTRIES = new Map<Section, readonly GallerySerializableEntry[]>(
  galleryPayload.sections.map((section) => [section.id, section.entries] as const),
);

export function getGallerySectionEntries(
  section: Section,
): readonly GallerySerializableEntry[] {
  return SECTION_ENTRIES.get(section) ?? [];
}

export const getGalleryPreview = getGalleryPreviewRenderer;

export const SECTION_TABS: HeaderTab<Section>[] = GALLERY_SECTION_IDS.map((id) => ({
  key: id,
  label: formatGallerySectionLabel(id),
}));

export type ComponentsView = "components" | "colors";

export const COMPONENTS_VIEW_TABS: HeaderTab<ComponentsView>[] = [
  { key: "components", label: "Components", controls: "components-panel" },
  { key: "colors", label: "Colors", controls: "colors-panel" },
];
