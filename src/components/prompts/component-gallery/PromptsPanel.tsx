"use client";

import * as React from "react";
import {
  Card,
  PillarBadge,
  PillarSelector,
  SearchBar,
  SectionCard,
  TabBar,
} from "@/components/ui";
import GalleryItem from "../GalleryItem";
import PromptsComposePanel from "../PromptsComposePanel";
import PromptsDemos from "../PromptsDemos";
import PromptsHeader from "../PromptsHeader";
import WelcomeHeroFigure from "@/components/home/WelcomeHeroFigure";
import { layoutGridClassName } from "@/components/ui/layout/PageShell";
import { cn } from "@/lib/utils";
import type { PromptsPanelData } from "./useComponentGalleryState";

const GRID_CLASS = cn(layoutGridClassName, "sm:grid-cols-2 md:grid-cols-12");
const selectorWidth = "calc(var(--space-8) * 3.5)";
const composePanelMaxWidth = "calc(var(--space-8) * 7)";
const layoutPreviewHeight = "calc(var(--space-8) * 3)";
type PanelItem = { label: string; element: React.ReactNode; className?: string };

interface PromptsPanelProps {
  data: PromptsPanelData;
}

export default function PromptsPanel({ data }: PromptsPanelProps) {
  const items = React.useMemo<PanelItem[]>(
    () =>
      [
        { label: "PillarBadge", element: <PillarBadge pillar="Wave" /> },
        {
          label: "PillarSelector",
          element: (
            <div style={{ width: selectorWidth }}>
              <PillarSelector
                value={data.pillarSelector.value}
                onChange={data.pillarSelector.onChange}
              />
            </div>
          ),
        },
        {
          label: "Prompts Header",
          element: (
            <SectionCard className="w-full">
              <SectionCard.Header sticky topClassName="top-[var(--space-8)]">
                <PromptsHeader
                  count={0}
                  query=""
                  onQueryChange={() => {}}
                  onSave={() => {}}
                  disabled
                />
              </SectionCard.Header>
              <SectionCard.Body />
            </SectionCard>
          ),
          className: "sm:col-span-2 md:col-span-12 w-full",
        },
        {
          label: "Prompts Compose",
          element: (
            <div className="w-full" style={{ maxWidth: composePanelMaxWidth }}>
              <PromptsComposePanel
                title=""
                onTitleChange={() => {}}
                text=""
                onTextChange={() => {}}
              />
            </div>
          ),
          className: "sm:col-span-2 md:col-span-12 w-full",
        },
        {
          label: "Prompts Demos",
          element: (
            <div className="w-full">
              <PromptsDemos />
            </div>
          ),
          className: "sm:col-span-2 md:col-span-12 w-full",
        },
        {
          label: "WelcomeHeroFigure",
          element: (
            <div className="w-full space-y-[var(--space-3)]">
              <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col items-center gap-[var(--space-2)]">
                  <span className="text-label font-medium text-muted-foreground">Default halo</span>
                  <div className="w-full max-w-[calc(var(--space-8)*4)]">
                    <WelcomeHeroFigure />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-[var(--space-2)]">
                  <span className="text-label font-medium text-muted-foreground">Toned-down halo</span>
                  <div className="w-full max-w-[calc(var(--space-8)*4)]">
                    <WelcomeHeroFigure haloTone="subtle" showGlitchRail={false} />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-[var(--space-2)]">
                  <span className="text-label font-medium text-muted-foreground">Borderless mode</span>
                  <div className="w-full max-w-[calc(var(--space-8)*4)]">
                    <WelcomeHeroFigure framed={false} />
                  </div>
                </div>
              </div>
            </div>
          ),
          className: "sm:col-span-2 md:col-span-12 w-full",
        },
        {
          label: "Prompts Layout",
          element: (
            <div className="w-full">
              <div className="grid grid-cols-12 gap-[var(--space-6)]">
                <div className="col-span-12 lg:col-span-8 space-y-[var(--space-6)]">
                  <SearchBar value="" onValueChange={() => {}} />
                  <TabBar
                    items={[{ key: "demo", label: "Demo" }]}
                    value="demo"
                    onValueChange={() => {}}
                    ariaLabel="Demo tabs"
                    linkPanels={false}
                  />
                  <Card style={{ height: layoutPreviewHeight }} />
                </div>
              </div>
            </div>
          ),
          className: "sm:col-span-2 md:col-span-12 w-full",
        },
      ],
    [data.pillarSelector.value, data.pillarSelector.onChange],
  );

  return (
    <div className={GRID_CLASS}>
      {items.map((item) => (
        <GalleryItem
          key={item.label}
          label={item.label}
          className={cn("md:col-span-4", item.className)}
        >
          {item.element}
        </GalleryItem>
      ))}
    </div>
  );
}
