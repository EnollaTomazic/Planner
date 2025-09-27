"use client";

import * as React from "react";

import ComponentSpecView from "@/components/prompts/ComponentsView";
import type { GallerySerializableEntry } from "@/components/gallery/registry";
import { Card, CardContent } from "@/components/ui";
import Badge from "@/components/ui/primitives/Badge";

import {
  COMPONENTS_PANEL_ID,
  type ComponentsView,
} from "./useComponentsGalleryState";

interface ComponentsGalleryPanelsProps {
  readonly view: ComponentsView;
  readonly filteredSpecs: readonly GallerySerializableEntry[];
  readonly sectionLabel: string;
  readonly countLabel: string;
  readonly countDescriptionId: string;
  readonly componentsPanelLabelledBy: string;
  readonly componentsPanelRef: React.MutableRefObject<HTMLDivElement | null>;
}

export default function ComponentsGalleryPanels({
  view,
  filteredSpecs,
  sectionLabel,
  countLabel,
  countDescriptionId,
  componentsPanelLabelledBy,
  componentsPanelRef,
}: ComponentsGalleryPanelsProps) {
  return (
    <section
      id={view}
      className="col-span-full grid gap-[var(--space-6)] md:gap-[var(--space-7)] lg:gap-[var(--space-8)]"
    >
      <div
        id={COMPONENTS_PANEL_ID}
        role="tabpanel"
        aria-labelledby={componentsPanelLabelledBy}
        tabIndex={0}
        ref={componentsPanelRef}
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
    </section>
  );
}
