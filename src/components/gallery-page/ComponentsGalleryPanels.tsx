"use client";

import * as React from "react";

import ColorsView from "@/components/prompts/ColorsView";
import ComponentSpecView from "@/components/prompts/ComponentsView";
import type { GallerySerializableEntry } from "@/components/gallery/registry";
import type { DesignTokenGroup } from "@/components/gallery/types";
import { Card, CardContent } from "@/components/ui";
import Badge from "@/components/ui/primitives/Badge";

import {
  COMPONENTS_PANEL_ID,
  COMPONENTS_VIEW_TAB_ID_BASE,
  type Section,
  type ComponentsView,
} from "./useComponentsGalleryState";

interface ComponentsGalleryPanelsProps {
  readonly view: ComponentsView;
  readonly section: Section;
  readonly filteredSpecs: readonly GallerySerializableEntry[];
  readonly sectionLabel: string;
  readonly countLabel: string;
  readonly countDescriptionId: string;
  readonly componentsPanelLabelledBy: string;
  readonly componentsPanelRef: React.Ref<HTMLDivElement>;
  readonly tokensPanelRef: React.Ref<HTMLDivElement>;
  readonly tokenGroups: readonly DesignTokenGroup[];
  readonly firstMatchId: string | null;
  readonly firstMatchAnchor: string | null;
  readonly searchSubmitCount: number;
}

export default function ComponentsGalleryPanels({
  view,
  section,
  filteredSpecs,
  sectionLabel,
  countLabel,
  countDescriptionId,
  componentsPanelLabelledBy,
  componentsPanelRef,
  tokensPanelRef,
  tokenGroups,
  firstMatchId,
  firstMatchAnchor,
  searchSubmitCount,
}: ComponentsGalleryPanelsProps) {
  const isTokensView = view === "tokens";
  const tokensTabId = `${COMPONENTS_VIEW_TAB_ID_BASE}-tokens-tab`;
  const hasResults = filteredSpecs.length > 0;
  const searchAnchor = "#components-search";

  const getScrollBehavior = React.useCallback((): ScrollBehavior => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return "smooth";
    }
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth";
    } catch {
      return "smooth";
    }
  }, []);

  React.useEffect(() => {
    if (isTokensView) {
      return;
    }
    if (!firstMatchId || searchSubmitCount === 0) {
      return;
    }
    if (typeof document === "undefined") {
      return;
    }
    const target = document.getElementById(firstMatchId);
    if (!target) {
      return;
    }
    if (typeof target.scrollIntoView === "function") {
      try {
        target.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
      } catch {
        target.scrollIntoView();
      }
    }
    if (target instanceof HTMLElement) {
      try {
        target.focus({ preventScroll: true });
      } catch {
        target.focus();
      }
    }
  }, [firstMatchId, getScrollBehavior, isTokensView, searchSubmitCount]);

  const specAnchorIdFor = React.useCallback(
    (spec: GallerySerializableEntry) => `components-${section}-${spec.id}`,
    [section],
  );

  const skipLinkClassName =
    "inline-flex items-center gap-[var(--space-1)] rounded-full px-[var(--space-3)] py-[var(--space-1)] text-caption font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

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
          <nav
            aria-label="Component gallery shortcuts"
            className="flex flex-wrap gap-[var(--space-2)]"
          >
            <a href={searchAnchor} className={skipLinkClassName}>
              Back to search
            </a>
            {hasResults && firstMatchAnchor ? (
              <a href={firstMatchAnchor} className={skipLinkClassName}>
                Skip to first result
              </a>
            ) : null}
          </nav>
          <header className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
            <h2 className="text-ui font-semibold tracking-[-0.01em] text-muted-foreground">
              {sectionLabel} specs
            </h2>
            <Badge
              id={countDescriptionId}
              tone="support"
              size="md"
              className="text-muted-foreground"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {countLabel}
            </Badge>
          </header>
          <div className="grid gap-[var(--space-6)]">
            {filteredSpecs.length === 0 ? (
              <Card>
                <CardContent
                  className="text-ui text-muted-foreground"
                  role="status"
                  aria-live="polite"
                >
                  No results found
                </CardContent>
              </Card>
            ) : (
              filteredSpecs.map((spec) => {
                const anchorId = specAnchorIdFor(spec);
                return (
                  <ComponentSpecView
                    key={spec.id}
                    id={anchorId}
                    tabIndex={-1}
                    data-gallery-entry-id={spec.id}
                    entry={spec}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
      <div
        id={`${COMPONENTS_VIEW_TAB_ID_BASE}-tokens-panel`}
        role="tabpanel"
        aria-labelledby={tokensTabId}
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
