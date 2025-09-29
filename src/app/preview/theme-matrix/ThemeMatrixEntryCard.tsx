"use client";

import { ThemeMatrixPreview } from "@/components/prompts/ComponentsView";
import { SectionCard } from "@/components/ui";

import type { ThemeMatrixEntry } from "./types";

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
              <div data-theme-matrix-group>
                <ThemeMatrixPreview entryId={themeMatrixEntryId} previewId={group.previewId} />
              </div>
            </article>
          );
        })}
      </SectionCard.Body>
    </SectionCard>
  );
}
