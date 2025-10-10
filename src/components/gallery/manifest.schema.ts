import { z } from 'zod'
import {
  GALLERY_SECTION_IDS,
  type GalleryAxis,
  type GalleryAxisKind,
  type GalleryAxisValue,
  type GalleryEntry,
  type GalleryEntryKind,
  type GalleryEntryRelated,
  type GalleryPreview,
  type GalleryPreviewRenderer,
  type GalleryPreviewRoute,
  type GalleryPropMeta,
  type GalleryRegistryPayload,
  type GalleryRelatedSurface,
  type GallerySection,
  type GallerySerializableEntry,
  type GallerySerializablePreview,
  type GallerySerializableSection,
  type GallerySerializableStateDefinition,
  type GalleryStateDefinition,
  type GalleryUsageNote,
} from './registry'
import { BG_CLASSES, VARIANTS, type Background, type Variant } from '@/lib/theme'

const GALLERY_ENTRY_KIND_VALUES = [
  'primitive',
  'component',
  'complex',
  'token',
] as const satisfies readonly GalleryEntryKind[]

const GALLERY_AXIS_KIND_VALUES = ['variant', 'state'] as const satisfies readonly GalleryAxisKind[]

const GALLERY_USAGE_NOTE_KIND_VALUES = ['do', 'dont'] as const satisfies readonly GalleryUsageNote['kind'][]

const VARIANT_IDS = VARIANTS.map((variant) => variant.id) as [Variant, ...Variant[]]

export const ManifestEntryKindSchema = z.enum(GALLERY_ENTRY_KIND_VALUES)

export const ManifestAxisKindSchema = z.enum(GALLERY_AXIS_KIND_VALUES)

export const ManifestUsageKindSchema = z.enum(GALLERY_USAGE_NOTE_KIND_VALUES)

export const ManifestSectionIdSchema = z.enum(GALLERY_SECTION_IDS)

export const ManifestVariantSchema: z.ZodType<Variant> = z.enum(VARIANT_IDS)

export const ManifestBackgroundSchema: z.ZodType<Background> = z.custom<Background>(
  (value) =>
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value < BG_CLASSES.length,
  {
    message: 'Invalid background index',
  },
)

export const ManifestPropMetaSchema: z.ZodType<GalleryPropMeta> = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean().optional(),
  defaultValue: z.string().optional(),
  description: z.string().optional(),
})

export const ManifestAxisValueSchema: z.ZodType<GalleryAxisValue> = z.object({
  value: z.string(),
  description: z.string().optional(),
})

export const ManifestAxisSchema: z.ZodType<GalleryAxis> = z.object({
  id: z.string(),
  label: z.string(),
  type: ManifestAxisKindSchema,
  values: z.array(ManifestAxisValueSchema).readonly(),
  description: z.string().optional(),
})

export const ManifestUsageNoteSchema: z.ZodType<GalleryUsageNote> = z.object({
  title: z.string(),
  description: z.string(),
  kind: ManifestUsageKindSchema,
})

export const ManifestRelatedSurfaceSchema: z.ZodType<GalleryRelatedSurface> = z.object({
  id: z.string(),
  description: z.string().optional(),
})

export const ManifestEntryRelatedSchema: z.ZodType<GalleryEntryRelated> = z.object({
  surfaces: z.array(ManifestRelatedSurfaceSchema).readonly().optional(),
})

export const ManifestPreviewRendererSchema: z.ZodType<GalleryPreviewRenderer> = z.function(
  z.tuple([]),
  z.any(),
)

export const ManifestPreviewSchema: z.ZodType<GalleryPreview> = z.object({
  id: z.string(),
  render: ManifestPreviewRendererSchema,
})

export const ManifestStateSchema: z.ZodType<GalleryStateDefinition> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  code: z.string().optional(),
  preview: ManifestPreviewSchema,
})

export const ManifestEntrySchema: z.ZodType<GalleryEntry> = z.object({
  id: z.string(),
  name: z.string(),
  kind: ManifestEntryKindSchema,
  description: z.string().optional(),
  tags: z.array(z.string()).readonly().optional(),
  props: z.array(ManifestPropMetaSchema).readonly().optional(),
  axes: z.array(ManifestAxisSchema).readonly().optional(),
  usage: z.array(ManifestUsageNoteSchema).readonly().optional(),
  related: ManifestEntryRelatedSchema.optional(),
  preview: ManifestPreviewSchema,
  code: z.string().optional(),
  states: z.array(ManifestStateSchema).readonly().optional(),
})

export const ManifestSectionSchema: z.ZodType<GallerySection> = z.object({
  id: ManifestSectionIdSchema,
  entries: z.array(ManifestEntrySchema).readonly(),
})

export const ManifestSerializablePreviewSchema: z.ZodType<GallerySerializablePreview> = z.object({
  id: z.string(),
})

export const ManifestSerializableStateSchema: z.ZodType<GallerySerializableStateDefinition> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  code: z.string().optional(),
  preview: ManifestSerializablePreviewSchema,
})

export const ManifestSerializableEntrySchema: z.ZodType<GallerySerializableEntry> = z.object({
  id: z.string(),
  name: z.string(),
  kind: ManifestEntryKindSchema,
  description: z.string().optional(),
  tags: z.array(z.string()).readonly().optional(),
  props: z.array(ManifestPropMetaSchema).readonly().optional(),
  axes: z.array(ManifestAxisSchema).readonly().optional(),
  usage: z.array(ManifestUsageNoteSchema).readonly().optional(),
  related: ManifestEntryRelatedSchema.optional(),
  preview: ManifestSerializablePreviewSchema,
  code: z.string().optional(),
  states: z.array(ManifestSerializableStateSchema).readonly().optional(),
})

export const ManifestSerializableSectionSchema: z.ZodType<GallerySerializableSection> = z.object({
  id: ManifestSectionIdSchema,
  entries: z.array(ManifestSerializableEntrySchema).readonly(),
})

export const ManifestPayloadSchema: z.ZodType<GalleryRegistryPayload> = z.object({
  sections: z.array(ManifestSerializableSectionSchema).readonly(),
  byKind: z.object({
    primitive: z.array(ManifestSerializableEntrySchema),
    component: z.array(ManifestSerializableEntrySchema),
    complex: z.array(ManifestSerializableEntrySchema),
    token: z.array(ManifestSerializableEntrySchema),
  }),
})

export const ManifestRouteSchema: z.ZodType<GalleryPreviewRoute> = z.object({
  slug: z.string(),
  previewId: z.string(),
  entryId: z.string(),
  entryName: z.string(),
  sectionId: ManifestSectionIdSchema,
  stateId: z.string().nullable(),
  stateName: z.string().nullable(),
  themeVariant: ManifestVariantSchema,
  themeBackground: ManifestBackgroundSchema,
})

export type GalleryModuleExport = {
  readonly default: GallerySection | readonly GallerySection[]
}

export const ManifestModuleExportSchema: z.ZodType<GalleryModuleExport> = z.object({
  default: z.union([
    ManifestSectionSchema,
    z.array(ManifestSectionSchema).readonly(),
  ]),
})

export const ManifestPreviewModuleSchema = z.object({
  loader: z.function(z.tuple([]), z.promise(ManifestModuleExportSchema)),
  previewIds: z.array(z.string()).readonly(),
})

export type GalleryPreviewModuleManifest = z.infer<typeof ManifestPreviewModuleSchema>

export const ManifestSchema = z.object({
  galleryPayload: ManifestPayloadSchema,
  galleryPreviewRoutes: z.array(ManifestRouteSchema).readonly(),
  galleryPreviewModules: z.record(ManifestPreviewModuleSchema),
})

export type Manifest = z.infer<typeof ManifestSchema>
