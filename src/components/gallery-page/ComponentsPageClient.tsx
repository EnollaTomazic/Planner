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
import { PageShell, SearchBar, TabBar } from "@/components/ui";
import {
  Header,
  PRIMARY_PAGE_NAV,
  type HeaderNavItem,
} from "@/components/ui/layout/Header";
import { cn } from "@/lib/utils";

import { ComponentsGalleryPanels } from "./ComponentsGalleryPanels";
import {
  COMPONENTS_SECTION_TAB_ID_BASE,
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

  const navItems = React.useMemo<HeaderNavItem[]>(
    () =>
      PRIMARY_PAGE_NAV.map((item) => ({
        ...item,
        active: item.key === "components",
      })),
    [],
  );

  const handleCategoryActivate = React.useCallback(
    (card: CategoryCardDefinition) => {
      if (view !== card.id) {
        handleViewChange(card.id);
      }
      if (typeof window === "undefined") {
        return;
      }
      const targetHash = card.href.startsWith("#")
        ? card.href.slice(1)
        : card.href;
      if (!targetHash) {
        return;
      }
      const hashValue = `#${targetHash}`;
      window.history.replaceState(null, "", hashValue);
      window.requestAnimationFrame(() => {
        const element = document.getElementById(targetHash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    },
    [handleViewChange, view],
  );

  return (
    <>
      <Header
        heading={<span id="components-header">Component Gallery</span>}
        subtitle="UI building blocks by category."
        icon={<Shapes className="opacity-80" />}
        navItems={navItems}
        variant="neo"
        underlineTone="brand"
        showThemeToggle
        sticky={false}
        className="py-[var(--space-6)] md:py-[var(--space-7)] lg:py-[var(--space-8)]"
      >
        <div className="space-y-[var(--space-6)]">
          <ul
            className="grid gap-[var(--space-3)] sm:grid-cols-2 xl:grid-cols-4"
            role="list"
          >
            {categoryCards.map((card) => {
              const Icon = card.icon;
              const isActive = view === card.id;
              const cardId = categoryLabelIds.get(card.id);
              return (
                <li key={card.id}>
                  <button
                    type="button"
                    id={cardId}
                    onClick={() => handleCategoryActivate(card)}
                    aria-pressed={isActive ? "true" : undefined}
                    className={cn(
                      "group relative flex h-full flex-col gap-[var(--space-3)] overflow-hidden text-left",
                      "rounded-card border border-card-hairline-70 bg-[hsl(var(--surface-3)/0.82)]",
                      "px-[var(--space-5)] py-[var(--space-4)]",
                      "shadow-depth-outer transition-[transform,box-shadow] duration-motion-sm ease-out",
                      "hover:-translate-y-[var(--spacing-0-25)] hover:shadow-depth-soft",
                      "focus-visible:-translate-y-[var(--spacing-0-25)] focus-visible:shadow-depth-soft",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface-3)/0.82)]",
                      "data-[active=true]:shadow-depth-soft",
                    )}
                    data-active={isActive ? "true" : undefined}
                  >
                    <span
                      aria-hidden
                      className="glitch-rail pointer-events-none absolute inset-x-[var(--space-4)] top-0 h-[var(--spacing-0-5)] opacity-80"
                    />
                    <span className="inline-flex h-[var(--space-10)] w-[var(--space-10)] items-center justify-center rounded-full border border-card-hairline-60 bg-[hsl(var(--surface-1)/0.92)] text-foreground shadow-depth-soft">
                      <Icon className="size-[var(--space-5)]" aria-hidden />
                    </span>
                    <span className="space-y-[var(--space-1)]">
                      <span className="text-ui font-semibold text-foreground">
                        {card.label}
                      </span>
                      <span className="text-label text-muted-foreground">
                        {card.description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
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
      </Header>

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
