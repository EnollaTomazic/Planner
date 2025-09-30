"use client";

import Link from "next/link";
import * as React from "react";

import { PREVIEW_SURFACE_CONTAINER_CLASSNAME } from "@/components/gallery/PreviewSurfaceClient";
import { SectionCard } from "@/components/ui";
import { VARIANTS, type Variant } from "@/lib/theme";
import { cn } from "@/lib/utils";

import type { ThemeMatrixEntry, ThemeMatrixVariantPreview } from "./types";

const BACKGROUND_LABELS: Record<number, string> = {
  0: "Default background",
  1: "Alt background 1",
  2: "Alt background 2",
  3: "VHS background",
  4: "Streak background",
};

const GRID_TEMPLATE = `repeat(${VARIANTS.length}, minmax(320px, 1fr))`;

const variantColumnsStyle = {
  gridTemplateColumns: GRID_TEMPLATE,
} satisfies React.CSSProperties;

const PREVIEW_HEIGHT_VARIABLE =
  "[--theme-matrix-preview-min-h:calc(var(--space-8)*5+var(--space-4))]";
const PREVIEW_MIN_HEIGHT_CLASS =
  "min-h-[var(--theme-matrix-preview-min-h)]";

function getBackgroundLabel(background: number): string {
  return BACKGROUND_LABELS[background] ?? `Background ${background}`;
}

function ThemeMatrixPreviewFrame({
  entryName,
  stateName,
  variantLabel,
  preview,
}: {
  readonly entryName: string;
  readonly stateName: string | null;
  readonly variantLabel: string;
  readonly preview: ThemeMatrixVariantPreview;
}) {
  const url = `/preview/${preview.slug}`;
  const backgroundLabel = getBackgroundLabel(preview.background);
  const titleParts = [entryName];
  if (stateName) {
    titleParts.push(stateName);
  }
  titleParts.push(`${variantLabel} theme`);
  if (preview.background > 0) {
    titleParts.push(backgroundLabel);
  }

  return (
    <figure className="space-y-[var(--space-2)]" data-theme-matrix-cell>
      <div
        className={cn(
          PREVIEW_SURFACE_CONTAINER_CLASSNAME,
          PREVIEW_HEIGHT_VARIABLE,
          PREVIEW_MIN_HEIGHT_CLASS,
          "overflow-hidden p-0",
        )}
      >
        <iframe
          src={url}
          title={titleParts.join(" · ")}
          loading="lazy"
          className="h-full w-full border-0"
          data-preview-embed="iframe"
        />
      </div>
      <figcaption className="flex items-center justify-between gap-[var(--space-2)] text-caption text-muted-foreground">
        <span>{backgroundLabel}</span>
        <Link
          href={url}
          prefetch={false}
          target="_blank"
          rel="noreferrer"
          className="text-ui font-medium text-muted-foreground transition-colors duration-quick ease-out hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--card))]"
        >
          Open preview
        </Link>
      </figcaption>
    </figure>
  );
}

function ThemeMatrixMissingPreview({
  variantLabel,
  backgroundLabel,
}: {
  readonly variantLabel: string;
  readonly backgroundLabel: string;
}) {
  return (
    <div
      className={cn(
        PREVIEW_HEIGHT_VARIABLE,
        PREVIEW_MIN_HEIGHT_CLASS,
        "flex items-center justify-center rounded-card border border-dashed border-card-hairline-60 bg-surface/60 p-[var(--space-4)] text-center text-caption text-muted-foreground",
      )}
    >
      <p className="max-w-[30ch]">
        Missing preview for the {variantLabel} theme ({backgroundLabel}).
      </p>
    </div>
  );
}

function ThemeMatrixVariantGridCell({
  entryName,
  stateName,
  variantLabel,
  preview,
  background,
}: {
  readonly entryName: string;
  readonly stateName: string | null;
  readonly variantLabel: string;
  readonly preview: ThemeMatrixVariantPreview | null;
  readonly background: number;
}) {
  const backgroundLabel = getBackgroundLabel(background);

  return (
    <div className="space-y-[var(--space-3)]" role="gridcell">
      {preview ? (
        <ThemeMatrixPreviewFrame
          entryName={entryName}
          stateName={stateName}
          variantLabel={preview.variantLabel}
          preview={preview}
        />
      ) : (
        <ThemeMatrixMissingPreview
          variantLabel={variantLabel}
          backgroundLabel={backgroundLabel}
        />
      )}
    </div>
  );
}

const COLUMN_MIN_WIDTH = 320;
const matrixContainerStyle = {
  minWidth: `${VARIANTS.length * COLUMN_MIN_WIDTH}px`,
} satisfies React.CSSProperties;

interface ThemeMatrixEntryCardProps {
  readonly entry: ThemeMatrixEntry;
}

export function ThemeMatrixEntryCard({ entry }: ThemeMatrixEntryCardProps) {
  return (
    <SectionCard data-theme-matrix-entry={entry.entryId} className="flex flex-col">
      <SectionCard.Header
        title={entry.entryName}
        titleAs="h3"
        titleClassName="text-ui font-semibold tracking-[-0.01em]"
      />
      <SectionCard.Body className="space-y-[var(--space-5)]">
        {entry.groups.map((group) => {
          const stateLabel = group.stateName;
          const themeMatrixEntryId = group.stateId
            ? `${group.entryId}--${group.stateId}`
            : group.entryId;
          const stateHeadingId = stateLabel ? `${themeMatrixEntryId}-state` : undefined;
          const variantPreviewLookup = new Map<
            Variant,
            Map<number, ThemeMatrixVariantPreview>
          >();
          const backgroundSet = new Set<number>();

          for (const variantGroup of group.variants) {
            const sortedPreviews = [...variantGroup.previews].sort((a, b) => {
              if (a.background !== b.background) {
                return a.background - b.background;
              }
              return a.slug.localeCompare(b.slug);
            });

            const backgroundLookup = new Map<number, ThemeMatrixVariantPreview>();
            for (const preview of sortedPreviews) {
              if (!backgroundLookup.has(preview.background)) {
                backgroundLookup.set(preview.background, preview);
              }
              backgroundSet.add(preview.background);
            }

            variantPreviewLookup.set(variantGroup.variant, backgroundLookup);
          }

          const backgrounds =
            backgroundSet.size > 0
              ? [...backgroundSet].sort((a, b) => a - b)
              : [0];

          return (
            <article
              key={group.key}
              aria-labelledby={stateHeadingId}
              className="space-y-[var(--space-3)]"
              data-theme-matrix-state={group.stateId ?? "default"}
            >
              {stateLabel ? (
                <h4
                  id={stateHeadingId}
                  className="text-label font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                >
                  {stateLabel}
                </h4>
              ) : null}
              {group.axisSummary ? (
                <p className="text-caption text-muted-foreground">{group.axisSummary}</p>
              ) : null}
              <div className="overflow-x-auto" data-theme-matrix-group>
                <div
                  className="space-y-[var(--space-3)]"
                  style={matrixContainerStyle}
                  role="grid"
                  aria-label={`${entry.entryName}${stateLabel ? ` · ${stateLabel}` : ""} theme matrix`}
                >
                  <div
                    className="grid gap-[var(--space-3)] text-caption font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                    style={variantColumnsStyle}
                    role="row"
                  >
                    {VARIANTS.map((variant) => (
                      <span key={variant.id} className="text-left" role="columnheader">
                        {variant.label}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-[var(--space-3)]" role="rowgroup">
                    {backgrounds.map((background) => (
                      <div
                        key={`background-${background}`}
                        className="grid gap-[var(--space-3)]"
                        style={variantColumnsStyle}
                        role="row"
                        aria-label={getBackgroundLabel(background)}
                      >
                        {VARIANTS.map((variant) => (
                          <ThemeMatrixVariantGridCell
                            key={variant.id}
                            entryName={entry.entryName}
                            stateName={stateLabel ?? null}
                            variantLabel={variant.label}
                            preview={
                              variantPreviewLookup.get(variant.id)?.get(background) ?? null
                            }
                            background={background}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </SectionCard.Body>
    </SectionCard>
  );
}
