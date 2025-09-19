import type { ReactNode } from "react";

export type GalleryEntryKind = "primitive" | "component" | "complex" | "token";
export type GalleryAxisKind = "variant" | "state";

export interface GalleryPropMeta {
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: string;
  description?: string;
}

export interface GalleryAxisValue {
  value: string;
  description?: string;
}

export interface GalleryAxis {
  id: string;
  label: string;
  type: GalleryAxisKind;
  values: readonly GalleryAxisValue[];
  description?: string;
}

export interface GalleryUsageNote {
  title: string;
  description: string;
  kind: "do" | "dont";
}

export interface GalleryStateDefinition {
  id: string;
  name: string;
  description?: string;
  code?: string;
  preview: GalleryPreview;
}

export interface GalleryRelatedSurface {
  id: string;
  description?: string;
}

export type GalleryPreviewRenderer = () => ReactNode;

export interface GalleryPreview {
  id: string;
  render: GalleryPreviewRenderer;
}

export interface GalleryEntry {
  id: string;
  name: string;
  kind: GalleryEntryKind;
  description?: string;
  tags?: readonly string[];
  props?: readonly GalleryPropMeta[];
  axes?: readonly GalleryAxis[];
  usage?: readonly GalleryUsageNote[];
  related?: readonly GalleryRelatedSurface[];
  preview: GalleryPreview;
  code?: string;
  states?: readonly GalleryStateDefinition[];
}

export const GALLERY_SECTION_IDS = [
  "buttons",
  "inputs",
  "prompts",
  "planner",
  "cards",
  "page-header",
  "layout",
  "feedback",
  "toggles",
  "league",
  "misc",
] as const;

export type GallerySectionId = (typeof GALLERY_SECTION_IDS)[number];

export interface GallerySection {
  id: GallerySectionId;
  entries: readonly GalleryEntry[];
}

export const defineGallerySection = (section: GallerySection): GallerySection => {
  return section;
};

export const createGalleryPreview = (preview: GalleryPreview): GalleryPreview => {
  if (!preview.id) {
    throw new Error("Gallery preview requires a stable id");
  }
  return preview;
};

export interface GallerySerializablePreview {
  id: string;
}

export type GallerySerializableStateDefinition = Omit<
  GalleryStateDefinition,
  "preview"
> & {
  preview: GallerySerializablePreview;
};

export type GallerySerializableEntry = Omit<
  GalleryEntry,
  "preview" | "states"
> & {
  preview: GallerySerializablePreview;
  states?: readonly GallerySerializableStateDefinition[];
};

export interface GallerySerializableSection {
  id: GallerySectionId;
  entries: readonly GallerySerializableEntry[];
}

export interface GalleryRegistryPayload {
  sections: readonly GallerySerializableSection[];
  byKind: Record<GalleryEntryKind, GallerySerializableEntry[]>;
}

export interface GalleryRegistry {
  payload: GalleryRegistryPayload;
  previews: Map<string, GalleryPreviewRenderer>;
}

export const createGalleryRegistry = (
  sections: readonly GallerySection[],
): GalleryRegistry => {
  const previews = new Map<string, GalleryPreviewRenderer>();
  const serializableSections: GallerySerializableSection[] = sections.map((section) => ({
    id: section.id,
    entries: section.entries.map((entry) => {
      const { preview, states, ...rest } = entry;
      previews.set(preview.id, preview.render);
      const serializableStates = states?.map((state) => {
        previews.set(state.preview.id, state.preview.render);
        const { preview: statePreview, ...stateRest } = state;
        return {
          ...stateRest,
          preview: { id: statePreview.id },
        } satisfies GallerySerializableStateDefinition;
      });
      return {
        ...rest,
        preview: { id: preview.id },
        states: serializableStates,
      } satisfies GallerySerializableEntry;
    }),
  }));

  const byKind: Record<GalleryEntryKind, GallerySerializableEntry[]> = {
    primitive: [],
    component: [],
    complex: [],
    token: [],
  };

  for (const section of serializableSections) {
    for (const entry of section.entries) {
      byKind[entry.kind].push(entry);
    }
  }

  return {
    payload: {
      sections: serializableSections,
      byKind,
    },
    previews,
  };
};

export const formatGallerySectionLabel = (section: GallerySectionId): string =>
  section
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
