"use client";

import * as React from "react";
import { Box, LayoutGrid, PanelsTopLeft, Shapes, Palette } from "lucide-react";

import type { DesignTokenGroup, GalleryNavigationData } from "@/components/gallery/types";
import { PageShell, SearchBar, TabBar } from "@/components/ui";
import { cn } from "@/lib/utils";

import { ComponentsGalleryPanels } from "./ComponentsGalleryPanels";
import {
  COMPONENTS_SECTION_TAB_ID_BASE,
  COMPONENTS_VIEW_TAB_ID_BASE,
  type ComponentsView,
  useComponentsGalleryState,
} from "./useComponentsGalleryState";

const NEO_TABLIST_SHARED_CLASSES = [
  "data-[variant=neo]:rounded-card",
  "data-[variant=neo]:r-card-lg",
  "data-[variant=neo]:gap-[var(--space-2)]",
  "data-[variant=neo]:px-[var(--space-2)]",
  "data-[variant=neo]:py-[var(--space-2)]",
  "data-[variant=neo]:bg-[hsl(var(--panel)/0.86)]",
  "data-[variant=neo]:shadow-depth-soft",
  "data-[variant=neo]:hover:shadow-depth-soft",
  "data-[variant=neo]:[&_[data-active=true]]:relative",
  "data-[variant=neo]:[&_[data-active=true]::after]:content-['']",
  "data-[variant=neo]:[&_[data-active=true]::after]:pointer-events-none",
  "data-[variant=neo]:[&_[data-active=true]::after]:absolute",
  "data-[variant=neo]:[&_[data-active=true]::after]:left-[var(--space-3)]",
  "data-[variant=neo]:[&_[data-active=true]::after]:right-[var(--space-3)]",
  "data-[variant=neo]:[&_[data-active=true]::after]:-bottom-[var(--space-2)]",
  "data-[variant=neo]:[&_[data-active=true]::after]:h-[var(--hairline-w)]",
  "data-[variant=neo]:[&_[data-active=true]::after]:rounded-full",
  "data-[variant=neo]:[&_[data-active=true]::after]:bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(var(--accent-2)))]",
].join(" ");

interface ComponentsPageClientProps {
  readonly navigation: GalleryNavigationData;
  readonly tokenGroups: readonly DesignTokenGroup[];
}

export function ComponentsPageClient({
  navigation,
  tokenGroups,
}: ComponentsPageClientProps) {
  const {
    view,
    section,
    query,
    setQuery,
    heroTabs,
    viewTabs,
    inPageNavigation,
    showSectionTabs,
    searchLabel,
    searchPlaceholder,
    categoryGroups,
    sectionLabel,
    countLabel,
    countDescriptionId,
    componentsPanelLabelledBy,
    handleViewChange,
    handleSectionChange,
    componentsPanelRef,
    tokensPanelRef,
  } = useComponentsGalleryState({ navigation });

  const categoryMeta: Partial<Record<ComponentsView, { icon: React.ReactNode; description: string }>> = {
    primitives: {
      icon: <Box aria-hidden className="size-[var(--space-6)] text-accent" />,
      description: "Core UI elements and base controls.",
    },
    patterns: {
      icon: <Shapes aria-hidden className="size-[var(--space-6)] text-accent" />,
      description: "Reusable interaction patterns and flows.",
    },
    layouts: {
      icon: <LayoutGrid aria-hidden className="size-[var(--space-6)] text-accent" />,
      description: "Compositions for dashboards and surfaces.",
    },
    tokens: {
      icon: <Palette aria-hidden className="size-[var(--space-6)] text-accent" />,
      description: "Design tokens for color and motion systems.",
    },
  };

  const categories = inPageNavigation
    .map((item) => {
      const meta = categoryMeta[item.id];
      if (!meta) {
        return null;
      }
      return {
        ...item,
        ...meta,
      };
    })
    .filter((item): item is typeof item & { icon: React.ReactNode; description: string } => item != null);

  const handleCategoryClick = React.useCallback(
    (item: (typeof categories)[number]) => {
      if (view !== item.id) {
        handleViewChange(item.id);
      }
      const targetHash = item.href.startsWith("#") ? item.href.slice(1) : item.href;
      if (targetHash && typeof window !== "undefined") {
        const target = document.getElementById(targetHash);
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.location.hash = targetHash;
      }
    },
    [handleViewChange, view],
  );

  return (
    <>
      <PageShell
        as="header"
        grid
        className="py-[var(--space-6)] md:py-[var(--space-7)] lg:py-[var(--space-8)]"
        contentClassName="gap-y-[var(--space-6)] md:gap-y-[var(--space-7)] lg:gap-y-[var(--space-8)]"
      >
        <div className="col-span-full">
          <div
            className={cn(
              "relative isolate overflow-hidden rounded-card r-card-xl border border-card-hairline-80",
              "bg-[hsl(var(--panel)/0.88)] px-[var(--space-6)] py-[var(--space-5)] shadow-depth-soft",
              "before:pointer-events-none before:absolute before:inset-x-[var(--space-6)] before:top-0 before:h-[var(--hairline-w)] before:bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(var(--accent-2)))] before:opacity-80",
              "after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] after:bg-glitch-overlay after:opacity-30 after:mix-blend-soft-light",
            )}
          >
            <div className="flex flex-col gap-[var(--space-4)] md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-[var(--space-3)]">
                <span className="rounded-full bg-[hsl(var(--accent)/0.12)] p-[var(--space-2)] text-accent">
                  <PanelsTopLeft aria-hidden className="size-[var(--space-6)]" />
                </span>
                <div className="space-y-[var(--space-2)]">
                  <h1
                    id="components-header"
                    className="text-title-lg font-semibold tracking-[-0.02em] text-foreground"
                  >
                    Component Gallery
                  </h1>
                  <p className="text-label text-muted-foreground">
                    UI building blocks by category.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {categories.length > 0 ? (
          <div className="col-span-full grid gap-[var(--space-3)] md:grid-cols-2 xl:grid-cols-4">
            {categories.map((item) => {
              const isActive = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleCategoryClick(item)}
                  className={cn(
                    "group relative flex h-full flex-col justify-between gap-[var(--space-3)]",
                    "rounded-card r-card-lg border border-card-hairline-75 bg-[hsl(var(--panel)/0.88)] p-[var(--space-4)]",
                    "text-left shadow-depth-soft transition-transform duration-motion-sm ease-out",
                    "hover:-translate-y-[var(--space-0-5)] focus-visible:-translate-y-[var(--space-0-5)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--panel)/0.88)]",
                    "before:pointer-events-none before:absolute before:inset-x-[var(--space-4)] before:top-0 before:h-[var(--hairline-w)] before:rounded-full",
                    "before:bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(var(--accent-2)))] before:opacity-70",
                    isActive && "ring-1 ring-accent/40",
                  )}
                >
                  <div className="flex items-center gap-[var(--space-3)]">
                    <div className="rounded-full bg-[hsl(var(--accent)/0.12)] p-[var(--space-2)] text-accent">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-label font-semibold tracking-[-0.01em] text-foreground">
                        {item.label}
                      </p>
                      <p className="text-caption text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-caption font-medium text-muted-foreground">
                    Jump to section
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="col-span-full flex flex-col gap-[var(--space-4)]">
          <div className="flex flex-col gap-[var(--space-3)] xl:flex-row xl:items-center xl:justify-between">
            <TabBar
              items={viewTabs}
              value={view}
              onValueChange={handleViewChange}
              ariaLabel="Component gallery view"
              idBase={COMPONENTS_VIEW_TAB_ID_BASE}
              linkPanels
              variant="neo"
              tablistClassName={cn(NEO_TABLIST_SHARED_CLASSES, "w-full xl:w-auto")}
            />
            {showSectionTabs ? (
              <div className="w-full xl:w-auto">
                <SearchBar
                  id="components-search"
                  value={query}
                  onValueChange={setQuery}
                  debounceMs={300}
                  label={searchLabel}
                  placeholder={searchPlaceholder}
                  variant="neo"
                  fieldClassName="bg-[hsl(var(--panel)/0.8)] !shadow-depth-soft focus-within:[--tw-ring-offset-width:var(--space-1)] focus-within:[--tw-ring-offset-color:hsl(var(--panel)/0.8)]"
                />
              </div>
            ) : null}
          </div>

          {showSectionTabs ? (
            <TabBar
              items={heroTabs}
              value={section}
              onValueChange={handleSectionChange}
              ariaLabel="Component section"
              idBase={COMPONENTS_SECTION_TAB_ID_BASE}
              linkPanels
              size="sm"
              showBaseline
              tablistClassName="max-w-full shadow-depth-inner rounded-card r-card-lg"
            />
          ) : null}
        </div>
      </PageShell>

      <PageShell
        as="section"
        id={`components-${view}`}
        grid
        aria-labelledby="components-header"
        className="scroll-mt-[calc(env(safe-area-inset-top)+var(--header-stack)+var(--space-2))] py-[var(--space-6)] md:py-[var(--space-7)] lg:py-[var(--space-8)]"
        contentClassName="gap-y-[var(--space-6)] md:gap-y-[var(--space-7)] lg:gap-y-[var(--space-8)]"
      >
        <ComponentsGalleryPanels
          view={view}
          categoryGroups={categoryGroups}
          sectionLabel={sectionLabel}
          countLabel={countLabel}
          countDescriptionId={countDescriptionId}
          componentsPanelLabelledBy={componentsPanelLabelledBy}
          componentsPanelRef={componentsPanelRef}
          tokensPanelRef={tokensPanelRef}
          tokenGroups={tokenGroups}
        />
      </PageShell>
    </>
  );
}
