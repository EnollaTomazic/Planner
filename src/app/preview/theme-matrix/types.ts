import type {
  GallerySectionId,
  GallerySerializableEntry,
  GallerySerializableSection,
} from "@/components/gallery";
import type { Background, Variant } from "@/lib/theme";

export interface ThemeMatrixVariantPreview {
  readonly variant: Variant;
  readonly variantLabel: string;
  readonly background: Background;
  readonly slug: string;
  readonly previewId: string;
}

export interface ThemeMatrixVariantGroup {
  readonly variant: Variant;
  readonly variantLabel: string;
  readonly previews: readonly ThemeMatrixVariantPreview[];
}

export interface ThemeMatrixGroup {
  readonly key: string;
  readonly entryId: string;
  readonly entryName: string;
  readonly sectionId: GallerySectionId;
  readonly stateId: string | null;
  readonly stateName: string | null;
  readonly axisSummary: string | null;
  readonly variants: readonly ThemeMatrixVariantGroup[];
}

export interface ThemeMatrixEntry {
  readonly entryId: string;
  readonly entryName: string;
  readonly groups: ThemeMatrixGroup[];
}

export interface ThemeMatrixSection {
  readonly sectionId: GallerySectionId;
  readonly label: string;
  readonly entries: ThemeMatrixEntry[];
}

export type SerializableGallerySection = GallerySerializableSection;
export type SerializableGalleryEntry = GallerySerializableEntry;
