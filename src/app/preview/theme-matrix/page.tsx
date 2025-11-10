import type { Metadata } from "next";

import {
  galleryPayload,
  getGalleryPreviewRoutes,
  getGalleryPreviewAxisSummary,
  formatGallerySectionLabel,
  type GalleryPreviewRoute,
} from "@/components/gallery";
import { PageShell, PageHeader } from "@/components/ui";
import {
  VARIANTS,
  VARIANT_LABELS,
  type Variant,
  type Background,
} from "@/lib/theme";

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
  const summary = getGalleryPreviewAxisSummary(route.entryId, route.stateId);
  return summary || null;
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

const VARIANT_ORDER = new Map<Variant, number>(
  VARIANTS.map(({ id }, index) => [id, index] as const),
);

const toThemeMatrixGroup = (
  builder: ThemeMatrixGroupBuilder,
): ThemeMatrixGroup => {
  const variants: ThemeMatrixVariantGroup[] = [];
  const sortedVariantBuilders = Array.from(builder.variants.values()).sort(
    (a, b) => {
      const aOrder = VARIANT_ORDER.get(a.variant) ?? Number.MAX_SAFE_INTEGER;
      const bOrder = VARIANT_ORDER.get(b.variant) ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      return a.variantLabel.localeCompare(b.variantLabel);
    },
  );

  for (const variantBuilder of sortedVariantBuilders) {
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

    const remainingGroups: ThemeMatrixGroupBuilder[] = [];

    for (const group of previewGroupsByKey.values()) {
      if (group.entryId !== entry.id || seen.has(group.key)) {
        continue;
      }

      remainingGroups.push(group);
      seen.add(group.key);
    }

    remainingGroups
      .sort((a, b) => {
        const aState = a.stateName ?? "";
        const bState = b.stateName ?? "";
        if (aState && bState) {
          const stateComparison = aState.localeCompare(bState);
          if (stateComparison !== 0) {
            return stateComparison;
          }
        } else if (aState || bState) {
          return aState ? -1 : 1;
        }

        const aAxis = a.axisSummary ?? "";
        const bAxis = b.axisSummary ?? "";
        if (aAxis && bAxis) {
          const axisComparison = aAxis.localeCompare(bAxis);
          if (axisComparison !== 0) {
            return axisComparison;
          }
        } else if (aAxis || bAxis) {
          return aAxis ? -1 : 1;
        }

        return a.key.localeCompare(b.key);
      })
      .forEach((group) => {
        groups.push(toThemeMatrixGroup(group));
      });

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
      id="page-main"
      tabIndex={-1}
      grid
      aria-labelledby="theme-matrix-heading"
      className="py-[var(--space-6)] md:py-[var(--space-8)]"
      contentClassName="md:gap-y-[var(--space-7)]"
    >
      <PageHeader
        as="header"
        className="col-span-full"
        title="Theme matrix"
        subtitle="Review every gallery entry and state across all Planner themes. The matrix reuses the component previews so screenshot and accessibility coverage stay in sync."
        headingId="theme-matrix-heading"
      />
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
