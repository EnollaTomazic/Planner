"use client";

import * as React from "react";

import { ColorsView } from "@/components/prompts/ColorsView";
import { ComponentsView as ComponentSpecView } from "@/components/prompts/ComponentsView";
import type { DesignTokenGroup } from "@/components/gallery/types";
import { Card, CardContent } from "@/components/ui";
import { Badge } from "@/components/ui/primitives/Badge";
import { cn } from "@/lib/utils";

import {
  COMPONENTS_PANEL_ID,
  COMPONENTS_VIEW_TAB_ID_BASE,
  type ComponentsView,
  type ComponentsGalleryCategoryGroup,
} from "./useComponentsGalleryState";

interface ComponentsGalleryPanelsProps {
  readonly view: ComponentsView;
  readonly categoryGroups: readonly ComponentsGalleryCategoryGroup[];
  readonly sectionLabel: string;
  readonly countLabel: string;
  readonly countDescriptionId: string;
  readonly componentsPanelLabelledBy: string;
  readonly componentsPanelRef: React.Ref<HTMLDivElement>;
  readonly tokensPanelRef: React.Ref<HTMLDivElement>;
  readonly tokenGroups: readonly DesignTokenGroup[];
  readonly tokensPanelLabelledBy: string;
}

function formatCategoryHeadingId(key: string, index: number): string {
  const normalized = key
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (normalized) {
    return `components-category-${normalized}`;
  }

  return `components-category-${index}`;
}

export function ComponentsGalleryPanels({
  view,
  categoryGroups,
  sectionLabel,
  countLabel,
  countDescriptionId,
  componentsPanelLabelledBy,
  componentsPanelRef,
  tokensPanelRef,
  tokenGroups,
  tokensPanelLabelledBy,
}: ComponentsGalleryPanelsProps) {
  const isTokensView = view === "tokens";

  const hasCategoryGroups = categoryGroups.length > 0;
  const fallbackSectionLabel = sectionLabel || "gallery";

  return (
    <section className="col-span-full grid gap-[var(--space-6)] md:gap-[var(--space-7)] lg:gap-[var(--space-8)]">
      <div
        id={COMPONENTS_PANEL_ID}
        role="tabpanel"
        aria-labelledby={componentsPanelLabelledBy}
        tabIndex={isTokensView ? -1 : 0}
        ref={componentsPanelRef}
        hidden={isTokensView}
        aria-hidden={isTokensView}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div
          className="flex flex-col gap-[var(--space-6)]"
          aria-describedby={countDescriptionId}
        >
          <header className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
            <h2 className="text-[var(--font-title)] font-semibold tracking-[-0.01em] text-muted-foreground">
              {sectionLabel} specs
            </h2>
            <Badge
              id={countDescriptionId}
              tone="support"
              size="md"
              className="text-muted-foreground"
            >
              {countLabel}
            </Badge>
          </header>
          <div className="grid gap-[var(--space-6)]">
            {hasCategoryGroups ? (
              categoryGroups.map((group, index) => {
                const headingId = formatCategoryHeadingId(group.key, index);
                const badgeLabel = `${group.filteredCount} ${
                  group.filteredCount === 1 ? "spec" : "specs"
                }`;
                const showEmpty = group.filteredCount === 0;
                const labelForEmptyState =
                  group.label || sectionLabel || "gallery";
                const emptyCopy =
                  group.emptyCopy ??
                  `No ${labelForEmptyState.toLowerCase()} specs match this search.`;

                return (
                  <section
                    key={group.key}
                    aria-labelledby={headingId}
                    className={cn(
                      "space-y-[var(--space-4)]",
                      index > 0 &&
                        "border-t border-card-hairline-60 pt-[var(--space-5)]",
                    )}
                  >
                    <header className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
                      <h3
                        id={headingId}
                        className="text-base font-semibold tracking-[-0.01em] text-muted-foreground"
                      >
                        {group.label}
                      </h3>
                      <Badge tone="support" size="sm" className="text-muted-foreground">
                        {badgeLabel}
                      </Badge>
                    </header>
                    {showEmpty ? (
                      <Card>
                        <CardContent className="text-base text-muted-foreground">
                          {emptyCopy}
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-[var(--space-6)]">
                        {group.filteredSpecs.map((spec) => (
                          <ComponentSpecView key={spec.id} entry={spec} />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })
            ) : (
              <Card>
                <CardContent className="text-base text-muted-foreground">
                  No {fallbackSectionLabel.toLowerCase()} specs available.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <div
        id={`${COMPONENTS_VIEW_TAB_ID_BASE}-tokens-panel`}
        role="tabpanel"
        aria-labelledby={tokensPanelLabelledBy}
        tabIndex={isTokensView ? 0 : -1}
        ref={tokensPanelRef}
        hidden={!isTokensView}
        aria-hidden={!isTokensView}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ColorsView groups={tokenGroups} />
      </div>
    </section>
  );
}
