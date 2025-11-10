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
  PageHero,
  type HeroTab,
  PageShell,
  SegmentedControl,
  type SegmentedControlOption,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { VARIANTS, type Variant } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { useThemeQuerySync } from "@/lib/theme-hooks";

import { ComponentsGalleryPanels } from "./ComponentsGalleryPanels";
import {
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

  const heroPrimaryTabItems = React.useMemo<HeroTab<ComponentsView>[]>(
    () =>
      categoryCards.map((card) => {
        const Icon = card.icon;
        return {
          key: card.id,
          label: card.label,
          icon: <Icon className="size-[var(--space-4)]" aria-hidden />,
          id: `category-${card.id}`,
          controls: card.id === "tokens" ? "tokens-panel" : "components-panel",
          className: "min-w-[calc(var(--space-8)*3.5)]",
        } satisfies HeroTab<ComponentsView>;
      }),
    [categoryCards],
  );

  const activeCategoryMeta = React.useMemo(() => {
    const match = categoryCards.find((card) => card.id === view);
    if (!match) {
      return null;
    }
    return { icon: match.icon, description: match.description };
  }, [categoryCards, view]);

  const ActiveCategoryIcon = activeCategoryMeta?.icon;

  const [theme, setTheme] = useTheme();
  useThemeQuerySync();

  const themeOptions = React.useMemo<
    readonly SegmentedControlOption<Variant>[]
  >(() => {
    return VARIANTS.map((variant) => ({
      value: variant.id,
      label: variant.label,
    }));
  }, []);

  const handleThemeChange = React.useCallback(
    (nextVariant: Variant) => {
      setTheme((current) => {
        if (current.variant === nextVariant) {
          return current;
        }
        return { ...current, variant: nextVariant };
      });
    },
    [setTheme],
  );

  const themeControlLabelId = React.useId();

  return (
    <>
      <PageShell
        as="header"
        grid
        className="py-[var(--space-6)] md:py-[var(--space-7)] lg:py-[var(--space-8)]"
      >
        <PageHero
          sticky={false}
          title={
            <span
              id="components-header"
              className="inline-flex items-center gap-[var(--space-2)]"
            >
              Components
            </span>
          }
          subtitle={
            <span id="components-header-subtitle">
              Explore the building blocks of the Planner.
            </span>
          }
          actions={
            <div className="flex flex-col items-stretch gap-[var(--space-2)] text-right sm:flex-row sm:items-center sm:justify-end">
              <span id={themeControlLabelId} className="sr-only">
                Select a preview theme
              </span>
              <SegmentedControl<Variant>
                options={themeOptions}
                value={theme.variant}
                onValueChange={handleThemeChange}
                ariaLabel="Select a preview theme"
                ariaLabelledBy={themeControlLabelId}
                size="sm"
                align="end"
                linkPanels={false}
                className="w-full sm:w-auto"
              />
            </div>
          }
        tabs={{
          items: heroPrimaryTabItems,
          value: view,
          onChange: (nextView) => handleViewChange(nextView),
          ariaLabel: "Component categories",
          idBase: COMPONENTS_VIEW_TAB_ID_BASE,
          linkPanels: true,
          variant: "neo",
          align: "end",
          className: "w-full md:w-auto",
        }}
        subTabs={
          showSectionTabs
            ? {
                items: heroTabs.map((tab) => ({
                  key: tab.key,
                  label: tab.label,
                  controls: tab.controls,
                })),
                value: section,
                onChange: (nextSection) => handleSectionChange(nextSection),
                ariaLabel: "Component sections",
                idBase: COMPONENTS_SECTION_TAB_ID_BASE,
                linkPanels: true,
                size: "sm",
                variant: "neo",
                className: "w-full",
                tablistClassName: cn(SECTION_TABLIST_CLASSES, "w-full"),
              }
            : undefined
        }
          searchBar={{
            id: "components-search",
            value: query,
            onValueChange: setQuery,
            debounceMs: 300,
            label: searchLabel,
            placeholder: searchPlaceholder,
            round: true,
            fieldClassName: cn(
              "bg-[hsl(var(--surface-3)/0.82)]",
              "border border-card-hairline-60",
              "shadow-depth-soft",
              "focus-within:shadow-depth-soft",
            ),
          }}
          className="col-span-full"
        >
          {activeCategoryMeta ? (
            <div className="flex items-start gap-[var(--space-3)] text-muted-foreground">
              {ActiveCategoryIcon ? (
                <ActiveCategoryIcon
                  aria-hidden
                  className="mt-[var(--space-1)] size-[var(--space-5)] shrink-0"
                />
              ) : null}
              <p className="max-w-2xl text-pretty text-ui md:text-body">
                {activeCategoryMeta.description}
              </p>
            </div>
          ) : null}
        </PageHero>
      </PageShell>

      <PageShell
        as="main"
        id="page-main"
        tabIndex={-1}
        data-view={view}
        grid
        aria-labelledby="components-header"
        className="scroll-mt-[calc(env(safe-area-inset-top)+var(--header-stack)+var(--space-2))] py-[var(--space-6)] md:py-[var(--space-7)] lg:py-[var(--space-8)]"
        contentClassName="gap-y-[var(--space-6)] md:gap-y-[var(--space-7)] lg:gap-y-[var(--space-8)]"
      >
        <div id={`components-${view}`}>
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
        </div>
      </PageShell>
    </>
  );
}
