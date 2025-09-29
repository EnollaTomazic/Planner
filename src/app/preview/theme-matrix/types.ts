import type {
  GallerySectionId,
  GallerySerializableEntry,
  GallerySerializableSection,
} from "@/components/gallery";

export interface ThemeMatrixGroup {
  readonly key: string;
  readonly entryId: string;
  readonly entryName: string;
  readonly sectionId: GallerySectionId;
  readonly stateId: string | null;
  readonly stateName: string | null;
  readonly previewId: string;
  readonly axisSummary: string | null;
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
