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
  type ComponentsView,
} from "./useComponentsGalleryState";

interface ComponentsGalleryPanelsProps {
  readonly view: ComponentsView;
  readonly filteredSpecs: readonly GallerySerializableEntry[];
  readonly sectionLabel: string;
  readonly countLabel: string;
  readonly countDescriptionId: string;
  readonly componentsPanelLabelledBy: string;
  readonly componentsPanelRef: React.Ref<HTMLDivElement>;
  readonly tokensPanelRef: React.Ref<HTMLDivElement>;
  readonly tokenGroups: readonly DesignTokenGroup[];
}

export default function ComponentsGalleryPanels({
  view,
  filteredSpecs,
  sectionLabel,
  countLabel,
  countDescriptionId,
  componentsPanelLabelledBy,
  componentsPanelRef,
  tokensPanelRef,
  tokenGroups,
}: ComponentsGalleryPanelsProps) {
  const isTokensView = view === "tokens";
  const tokensTabId = `${COMPONENTS_VIEW_TAB_ID_BASE}-tokens-tab`;

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
            <h2 className="text-ui font-semibold tracking-[-0.01em] text-muted-foreground">
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
            {filteredSpecs.length === 0 ? (
              <Card>
                <CardContent className="text-ui text-muted-foreground">
                  No results found
                </CardContent>
              </Card>
            ) : (
              filteredSpecs.map((spec) => (
                <ComponentSpecView key={spec.id} entry={spec} />
              ))
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
