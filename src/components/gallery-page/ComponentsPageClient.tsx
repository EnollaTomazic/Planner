"use client";

import * as React from "react";
import {
  LayoutPanelLeft,
  Palette,
  Shapes,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import type { DesignTokenGroup, GalleryNavigationData } from "@/components/gallery/types";
import {
  GlitchSegmentedButton,
  GlitchSegmentedGroup,
  PageShell,
  SearchBar,
  TabBar,
} from "@/components/ui";
import { cn } from "@/lib/utils";

import { ComponentsGalleryPanels } from "./ComponentsGalleryPanels";
import {
  COMPONENTS_PANEL_ID,
  COMPONENTS_SECTION_TAB_ID_BASE,
  COMPONENTS_VIEW_TAB_ID_BASE,
  type ComponentsView,
  useComponentsGalleryState,
} from "./useComponentsGalleryState";

const SECTION_TABLIST_CLASSES = [
  "data-[variant=neo]:rounded-card",
  "data-[variant=neo]:r-card-lg",
  "data-[variant=neo]:border data-[variant=neo]:border-card-hairline-60",
  "data-[variant=neo]:px-[var(--space-2)]",
  "data-[variant=neo]:py-[var(--space-2)]",
  "data-[variant=neo]:shadow-depth-outer",
  "data-[variant=neo]:[--neo-tablist-bg:hsl(var(--surface-3)/0.82)]",
  "data-[variant=neo]:[--neo-tab-bg:hsl(var(--surface-1)/0.96)]",
  "data-[variant=neo]:[--neo-tablist-shadow:var(--shadow-depth-outer-soft)]",
  "data-[variant=neo]:hover:shadow-depth-soft",
].join(" ");

const CATEGORY_META = {
  primitives: {
    icon: Shapes,
    description: "Core interface primitives and triggers.",
  },
  patterns: {
    icon: Workflow,
    description: "Reusable flows and guidance surfaces.",
  },
  layouts: {
    icon: LayoutPanelLeft,
    description: "Multi-column scaffolds and responsive frames.",
  },
  tokens: {
    icon: Palette,
    description: "Color, typography, and elevation tokens.",
  },
} satisfies Record<ComponentsView, { icon: LucideIcon; description: string }>;

interface CategoryCardDefinition {
  id: ComponentsView;
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

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
    componentsPanelRef,
    tokensPanelRef,
    handleViewChange,
    handleSectionChange,
  } = useComponentsGalleryState({ navigation });

  const categoryCards = React.useMemo<readonly CategoryCardDefinition[]>(() => {
    const tokensLabel =
      viewTabs.find((tab) => tab.key === "tokens")?.label ?? "Tokens";

    const groups = inPageNavigation.map((item) => {
      const meta = CATEGORY_META[item.id];
      return {
        id: item.id,
        label: item.label,
        href: item.href,
        icon: meta.icon,
        description: meta.description,
      } satisfies CategoryCardDefinition;
    });

    return [
      ...groups,
      {
        id: "tokens",
        label: tokensLabel,
        href: "#components-tokens",
        icon: CATEGORY_META.tokens.icon,
        description: CATEGORY_META.tokens.description,
      },
    ];
  }, [inPageNavigation, viewTabs]);

  const categoryLabelIds = React.useMemo(
    () =>
      new Map<ComponentsView, string>(
        categoryCards.map((card) => [card.id, `components-category-${card.id}`]),
      ),
    [categoryCards],
  );

  const activePanelLabelledBy = React.useMemo(() => {
    const ids = ["components-header"];
    const categoryId = categoryLabelIds.get(view);
    if (categoryId) {
      ids.push(categoryId);
    }
    if (showSectionTabs) {
      ids.push(`${COMPONENTS_SECTION_TAB_ID_BASE}-${section}-tab`);
    }
    return ids.join(" ");
  }, [categoryLabelIds, section, showSectionTabs, view]);

  const tokensPanelLabelledBy = React.useMemo(() => {
    const ids = ["components-header"];
    const categoryId = categoryLabelIds.get("tokens");
    if (categoryId) {
      ids.push(categoryId);
    }
    return ids.join(" ");
  }, [categoryLabelIds]);

  return (
    <>
      <PageShell
        as="header"
        className="py-[var(--space-6)] md:py-[var(--space-7)] lg:py-[var(--space-8)]"
      >
        <div className="space-y-[var(--space-6)]">
          <div className="space-y-[var(--space-2)]">
            <h1
              id="components-header"
              className="text-title font-semibold tracking-[-0.01em] text-foreground"
            >
              Component Gallery
            </h1>
            <p className="text-ui text-muted-foreground">
              UI building blocks by category.
            </p>
          </div>
          <GlitchSegmentedGroup
            value={view}
            onChange={(nextView) => handleViewChange(nextView)}
            ariaLabel="Component categories"
            className="flex w-full flex-wrap gap-[var(--space-2)]"
          >
            {categoryCards.map((card) => {
              const Icon = card.icon;
              const cardId = categoryLabelIds.get(card.id);
              const controlsId =
                card.id === "tokens"
                  ? `${COMPONENTS_VIEW_TAB_ID_BASE}-tokens-panel`
                  : COMPONENTS_PANEL_ID;
              return (
                <GlitchSegmentedButton
                  key={card.id}
                  id={cardId}
                  value={card.id}
                  icon={<Icon className="size-[var(--space-4)]" aria-hidden />}
                  aria-controls={controlsId}
                >
                  {card.label}
                </GlitchSegmentedButton>
              );
            })}
          </GlitchSegmentedGroup>
          <div className="flex flex-col gap-[var(--space-3)] lg:flex-row lg:items-start lg:justify-between">
            {showSectionTabs ? (
              <TabBar
                className="w-full lg:max-w-3xl"
                items={heroTabs}
                value={section}
                onValueChange={handleSectionChange}
                ariaLabel="Component section"
                idBase={COMPONENTS_SECTION_TAB_ID_BASE}
                linkPanels
                size="sm"
                variant="neo"
                tablistClassName={cn(SECTION_TABLIST_CLASSES, "w-full")}
              />
            ) : null}
            <div
              className={cn(
                "w-full",
                showSectionTabs ? "lg:max-w-sm" : "lg:max-w-md",
              )}
            >
              <SearchBar
                id="components-search"
                value={query}
                onValueChange={setQuery}
                debounceMs={300}
                label={searchLabel}
                placeholder={searchPlaceholder}
                variant="neo"
                fieldClassName={cn(
                  "bg-[hsl(var(--surface-3)/0.82)]",
                  "border border-card-hairline-60",
                  "shadow-depth-soft",
                  "focus-within:shadow-depth-soft",
                )}
              />
            </div>
          </div>
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
          componentsPanelLabelledBy={activePanelLabelledBy}
          componentsPanelRef={componentsPanelRef}
          tokensPanelRef={tokensPanelRef}
          tokenGroups={tokenGroups}
          tokensPanelLabelledBy={tokensPanelLabelledBy}
        />
      </PageShell>
    </>
  );
}
