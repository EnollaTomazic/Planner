import type {
  GalleryRegistry,
  GallerySectionId,
  GallerySerializableEntry,
  GalleryPreviewAxisOption,
  GalleryPreviewAxisParam,
  GalleryPreviewRoute,
} from "./registry";
import type {
  GalleryHeroCopy,
  GallerySectionGroupKey,
} from "./metadata";
import type { DesignTokenGroup } from "@/lib/design-token-registry";

export interface GalleryLoaderSlices {
  payload: GalleryRegistry["payload"];
  primitives: readonly GallerySerializableEntry[];
  components: readonly GallerySerializableEntry[];
  complex: readonly GallerySerializableEntry[];
  tokens: readonly DesignTokenGroup[];
}

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

export type {
  DesignTokenGroup,
  GalleryHeroCopy,
  GallerySectionGroupKey,
  GalleryPreviewAxisOption,
  GalleryPreviewAxisParam,
  GalleryPreviewRoute,
};
