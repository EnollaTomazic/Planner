import type { ReactNode } from "react";
import type { Background, Variant } from "@/lib/theme";

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

export interface GalleryEntryRelated {
  surfaces?: readonly GalleryRelatedSurface[];
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
  related?: GalleryEntryRelated;
  preview: GalleryPreview;
  code?: string;
  states?: readonly GalleryStateDefinition[];
}

export const GALLERY_SECTION_IDS = [
  "buttons",
  "inputs",
  "toggles",
  "feedback",
  "prompts",
  "cards",
  "layout",
  "page-header",
  "misc",
  "homepage",
  "reviews",
  "planner",
  "goals",
  "team",
  "components",
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

export interface GalleryPreviewAxisOption {
  readonly value: string;
  readonly label: string;
}

export interface GalleryPreviewAxisParam {
  readonly key: string;
  readonly label: string;
  readonly type: GalleryAxisKind;
  readonly options: readonly GalleryPreviewAxisOption[];
}

export interface GalleryPreviewRoute {
  readonly slug: string;
  readonly previewId: string;
  readonly entryId: string;
  readonly entryName: string;
  readonly sectionId: GallerySectionId;
  readonly stateId: string | null;
  readonly stateName: string | null;
  readonly themeVariant: Variant;
  readonly themeBackground: Background;
}

export const getGalleryEntryAxes = (
  payload: GalleryRegistryPayload,
  entryId: string,
): readonly GalleryAxis[] => {
  for (const section of payload.sections) {
    const entry = section.entries.find((candidate) => candidate.id === entryId);
    if (entry) {
      return entry.axes ?? [];
    }
  }
  return [];
};

export const createGalleryRegistry = (
  sections: readonly GallerySection[],
): GalleryRegistry => {
  const previews = new Map<string, GalleryPreviewRenderer>();
  const sectionOrder: GallerySectionId[] = [];
  const sectionsById = new Map<GallerySectionId, GalleryEntry[]>();

  for (const section of sections) {
    if (!sectionsById.has(section.id)) {
      sectionOrder.push(section.id);
      sectionsById.set(section.id, []);
    }

    sectionsById.get(section.id)!.push(...section.entries);
  }

  const serializableSections: GallerySerializableSection[] = sectionOrder.map((sectionId) => ({
    id: sectionId,
    entries: (sectionsById.get(sectionId) ?? []).map((entry) => {
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
