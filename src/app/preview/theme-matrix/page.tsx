import type { Metadata } from "next";

import {
  galleryPayload,
  getGalleryPreviewRoutes,
  formatGallerySectionLabel,
  type GalleryPreviewRoute,
} from "@/components/gallery";
import { PageShell } from "@/components/ui";

import { ThemeMatrixEntryCard } from "./ThemeMatrixEntryCard";
import type {
  ThemeMatrixEntry,
  ThemeMatrixGroup,
  ThemeMatrixSection,
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

const previewRoutes = getGalleryPreviewRoutes();
const previewGroupsByKey = new Map<string, ThemeMatrixGroup>();

for (const route of previewRoutes) {
  const key = createGroupKey(route.entryId, route.stateId);
  if (previewGroupsByKey.has(key)) {
    continue;
  }
  previewGroupsByKey.set(key, {
    key,
    entryId: route.entryId,
    entryName: route.entryName,
    sectionId: route.sectionId,
    stateId: route.stateId,
    stateName: route.stateName,
    previewId: route.previewId,
    axisSummary: buildAxisSummary(route),
  });
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
      if (!group || seen.has(group.key)) {
        continue;
      }

      let resolvedStateName = group.stateName;
      if (stateId && !resolvedStateName) {
        const stateMatch = entry.states?.find((state) => state.id === stateId);
        resolvedStateName = stateMatch?.name ?? null;
      }

      groups.push(
        resolvedStateName === group.stateName
          ? group
          : {
              ...group,
              stateName: resolvedStateName,
            },
      );
      seen.add(group.key);
    }

    for (const group of previewGroupsByKey.values()) {
      if (group.entryId !== entry.id || seen.has(group.key)) {
        continue;
      }

      groups.push(group);
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
