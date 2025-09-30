import type { Metadata } from "next";

import {
  galleryPayload,
  getGalleryPreviewRoutes,
  formatGallerySectionLabel,
  type GalleryPreviewRoute,
} from "@/components/gallery";
import { PageShell } from "@/components/ui";
import { VARIANT_LABELS, type Variant, type Background } from "@/lib/theme";

import { ThemeMatrixEntryCard } from "./ThemeMatrixEntryCard";
import type {
  ThemeMatrixEntry,
  ThemeMatrixGroup,
  ThemeMatrixSection,
  ThemeMatrixVariantGroup,
  ThemeMatrixVariantPreview,
  SerializableGalleryEntry,
  SerializableGallerySection,
} from "./types";

const createGroupKey = (entryId: string, stateId: string | null) =>
  `${entryId}__${stateId ?? "default"}`;

const buildAxisSummary = (route: GalleryPreviewRoute): string | null => {
  if (!route.axisParams.length) {
    return null;
  }

  const summary = route.axisParams
    .map((axis) => {
      const optionLabels = axis.options.map((option) => option.label).join(", ");
      return optionLabels ? `${axis.label}: ${optionLabels}` : axis.label;
    })
    .filter(Boolean)
    .join(" · ");

  return summary.length > 0 ? summary : null;
};

interface ThemeMatrixVariantBuilder {
  readonly variant: Variant;
  readonly variantLabel: string;
  readonly previews: Map<string, ThemeMatrixVariantPreview>;
}

interface ThemeMatrixGroupBuilder {
  key: string;
  entryId: string;
  entryName: string;
  sectionId: ThemeMatrixGroup["sectionId"];
  stateId: string | null;
  stateName: string | null;
  axisSummary: string | null;
  variants: Map<Variant, ThemeMatrixVariantBuilder>;
}

const toThemeMatrixGroup = (
  builder: ThemeMatrixGroupBuilder,
): ThemeMatrixGroup => {
  const variants: ThemeMatrixVariantGroup[] = [];
  for (const variantBuilder of builder.variants.values()) {
    const previews = Array.from(variantBuilder.previews.values()).sort(
      (a, b) => {
        if (a.background !== b.background) {
          return a.background - b.background;
        }
        return a.slug.localeCompare(b.slug);
      },
    );
    variants.push({
      variant: variantBuilder.variant,
      variantLabel: variantBuilder.variantLabel,
      previews,
    });
  }

  return {
    key: builder.key,
    entryId: builder.entryId,
    entryName: builder.entryName,
    sectionId: builder.sectionId,
    stateId: builder.stateId,
    stateName: builder.stateName,
    axisSummary: builder.axisSummary,
    variants,
  };
};

const previewRoutes = getGalleryPreviewRoutes();
const previewGroupsByKey = new Map<string, ThemeMatrixGroupBuilder>();

for (const route of previewRoutes) {
  const key = createGroupKey(route.entryId, route.stateId);
  let group = previewGroupsByKey.get(key);
  if (!group) {
    group = {
      key,
      entryId: route.entryId,
      entryName: route.entryName,
      sectionId: route.sectionId,
      stateId: route.stateId,
      stateName: route.stateName,
      axisSummary: buildAxisSummary(route),
      variants: new Map<Variant, ThemeMatrixVariantBuilder>(),
    };
    previewGroupsByKey.set(key, group);
  } else {
    if (!group.axisSummary) {
      group.axisSummary = buildAxisSummary(route);
    }
    if (route.stateName && !group.stateName) {
      group.stateName = route.stateName;
    }
  }

  const variantId = route.themeVariant as Variant;
  const variantLabel = VARIANT_LABELS[variantId] ?? variantId;
  let variantGroup = group.variants.get(variantId);
  if (!variantGroup) {
    variantGroup = {
      variant: variantId,
      variantLabel,
      previews: new Map<string, ThemeMatrixVariantPreview>(),
    };
    group.variants.set(variantId, variantGroup);
  }

  const previewKey = route.slug;
  if (!variantGroup.previews.has(previewKey)) {
    variantGroup.previews.set(previewKey, {
      variant: variantId,
      variantLabel,
      background: route.themeBackground as Background,
      slug: route.slug,
      previewId: route.previewId,
    });
  }
}

const gallerySections =
  galleryPayload.sections as readonly SerializableGallerySection[];

const themeMatrixSections: ThemeMatrixSection[] = [];

for (const section of gallerySections) {
  const entryGroups: ThemeMatrixEntry[] = [];
  const sectionEntries = section.entries as readonly SerializableGalleryEntry[];

  for (const entry of sectionEntries) {
    const stateOrder: Array<string | null> = [null, ...(entry.states?.map((state) => state.id) ?? [])];
    const groups: ThemeMatrixGroup[] = [];
    const seen = new Set<string>();

    for (const stateId of stateOrder) {
      const key = createGroupKey(entry.id, stateId);
      const group = previewGroupsByKey.get(key);
      const stateMatch = stateId
        ? entry.states?.find((state) => state.id === stateId)
        : undefined;
      const resolvedStateName = stateMatch?.name ?? null;

      if (!group) {
        groups.push({
          key,
          entryId: entry.id,
          entryName: entry.name,
          sectionId: section.id,
          stateId,
          stateName: resolvedStateName,
          axisSummary: null,
          variants: [],
        });
        seen.add(key);
        continue;
      }

      if (seen.has(group.key)) {
        continue;
      }

      let finalized = toThemeMatrixGroup(group);
      if (resolvedStateName && finalized.stateName !== resolvedStateName) {
        finalized = { ...finalized, stateName: resolvedStateName };
      }

      groups.push(finalized);
      seen.add(group.key);
    }

    for (const group of previewGroupsByKey.values()) {
      if (group.entryId !== entry.id || seen.has(group.key)) {
        continue;
      }

      groups.push(toThemeMatrixGroup(group));
      seen.add(group.key);
    }

    if (groups.length === 0) {
      continue;
    }

    entryGroups.push({
      entryId: entry.id,
      entryName: entry.name,
      groups,
    });
  }

  if (entryGroups.length === 0) {
    continue;
  }

  themeMatrixSections.push({
    sectionId: section.id,
    label: formatGallerySectionLabel(section.id),
    entries: entryGroups,
  });
}

export const metadata: Metadata = {
  title: "Gallery theme matrix",
  description:
    "Reference preview coverage grouped by component and state across every Planner theme.",
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return [];
}

export default function ThemeMatrixPage() {
  return (
    <PageShell
      as="main"
      grid
      aria-labelledby="theme-matrix-heading"
      className="py-[var(--space-6)] md:py-[var(--space-8)]"
      contentClassName="md:gap-y-[var(--space-7)]"
    >
      <header className="col-span-full space-y-[var(--space-2)] text-ui">
        <p className="text-caption font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Gallery
        </p>
        <h1 id="theme-matrix-heading" className="text-title font-semibold tracking-[-0.01em]">
          Theme matrix
        </h1>
        <p className="max-w-3xl text-body text-muted-foreground">
          Review every gallery entry and state across all Planner themes. The matrix reuses the
          component previews so screenshot and accessibility coverage stay in sync.
        </p>
      </header>
      {themeMatrixSections.map((section) => {
        const sectionHeadingId = `theme-matrix-section-${section.sectionId}`;
        return (
          <section
            key={section.sectionId}
            aria-labelledby={sectionHeadingId}
            className="col-span-full space-y-[var(--space-4)]"
            data-gallery-section={section.sectionId}
          >
            <h2
              id={sectionHeadingId}
              className="text-title font-semibold tracking-[-0.01em] text-foreground"
            >
              {section.label}
            </h2>
            <div className="grid gap-[var(--space-4)] md:grid-cols-2 xl:grid-cols-3">
              {section.entries.map((entry) => (
                <ThemeMatrixEntryCard key={entry.entryId} entry={entry} />
              ))}
            </div>
          </section>
        );
      })}
    </PageShell>
  );
}
