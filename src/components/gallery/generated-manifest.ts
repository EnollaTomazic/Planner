// Simplified stub manifest for tests and local previews.
import type {
  GalleryPreviewRoute,
  GalleryRegistryPayload,
  GallerySection,
} from "./registry";

export interface GalleryModuleExport {
  readonly default: GallerySection | readonly GallerySection[];
}

export interface GalleryPreviewModuleManifest {
  readonly loader: () => Promise<GalleryModuleExport>;
  readonly previewIds: readonly string[];
}

const SAMPLE_PREVIEW_ID = "planner:week-picker:overview" as const;
const SAMPLE_ENTRY_ID = "week-picker" as const;
const SAMPLE_ENTRY_NAME = "Week Picker" as const;

const SAMPLE_ENTRY: GalleryRegistryPayload["sections"][number]["entries"][number] = {
  id: SAMPLE_ENTRY_ID,
  name: SAMPLE_ENTRY_NAME,
  kind: "primitive",
  preview: { id: SAMPLE_PREVIEW_ID },
};

export const galleryPayload = {
  sections: [
    {
      id: "planner",
      entries: [SAMPLE_ENTRY],
    },
  ],
  byKind: {
    primitive: [SAMPLE_ENTRY],
    component: [],
    complex: [],
    token: [],
  },
} satisfies GalleryRegistryPayload;

export const galleryPreviewRoutes = [
  {
    slug: "planner/week-picker",
    previewId: SAMPLE_PREVIEW_ID,
    entryId: SAMPLE_ENTRY_ID,
    entryName: SAMPLE_ENTRY_NAME,
    sectionId: "planner",
    stateId: null,
    stateName: null,
    themeVariant: "lg",
    themeBackground: 0,
  },
] satisfies readonly GalleryPreviewRoute[];

export const galleryPreviewModules = [
  {
    loader: async () => ({
      default: (await import("../ui/primitives/Button.gallery")).default as GallerySection,
    }),
    previewIds: [SAMPLE_PREVIEW_ID],
  },
] satisfies readonly GalleryPreviewModuleManifest[];

export default galleryPreviewModules;
