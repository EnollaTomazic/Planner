"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  Blocks,
  Layers,
  Palette,
  PanelsTopLeft,
  Workflow,
} from "lucide-react";

import type { DesignTokenGroup, GalleryNavigationData } from "@/components/gallery/types";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
  PageShell,
} from "@/components/ui";
import Button from "@/components/ui/primitives/Button";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

import ComponentsGalleryPanels from "./ComponentsGalleryPanels";
import {
  COMPONENTS_PANEL_ID,
  COMPONENTS_SECTION_TAB_ID_BASE,
  COMPONENTS_VIEW_TAB_ID_BASE,
  useComponentsGalleryState,
} from "./useComponentsGalleryState";

const VIEW_TAB_ICON_MAP: Record<string, React.ReactNode> = {
  primitives: <Blocks aria-hidden className="icon-sm" />,
  components: <Layers aria-hidden className="icon-sm" />,
  complex: <Workflow aria-hidden className="icon-sm" />,
  tokens: <Palette aria-hidden className="icon-sm" />,
};

interface ComponentsPageClientProps {
  readonly navigation: GalleryNavigationData;
  readonly tokenGroups: readonly DesignTokenGroup[];
}

export default function ComponentsPageClient({
  navigation,
  tokenGroups,
}: ComponentsPageClientProps) {
  const {
    view,
    section,
    query,
    setQuery,
    heroCopy,
    heroTabs,
    viewTabs,
    showSectionTabs,
    searchLabel,
    searchPlaceholder,
    filteredSpecs,
    sectionLabel,
    countLabel,
    countDescriptionId,
    componentsPanelLabelledBy,
    handleViewChange,
    handleSectionChange,
    componentsPanelRef,
    tokensPanelRef,
  } = useComponentsGalleryState({ navigation });
  const reduceMotion = usePrefersReducedMotion();

  const componentsPanelRefObject =
    componentsPanelRef as React.MutableRefObject<HTMLDivElement | null>;

  const decoratedViewTabs = React.useMemo(
    () =>
      viewTabs.map((item) => {
        const key = item.key as string;
        return {
          ...item,
          icon: VIEW_TAB_ICON_MAP[key],
        };
      }),
    [viewTabs],
  );

  const activeViewLabel = React.useMemo(() => {
    const current = decoratedViewTabs.find((tab) => tab.key === view);
    return typeof current?.label === "string" ? current.label : "";
  }, [decoratedViewTabs, view]);

  const scrollToComponentsPanel = React.useCallback(() => {
    const panel = componentsPanelRefObject.current;
    if (!panel) {
      return;
    }
    const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";
    panel.scrollIntoView({ behavior, block: "start" });
    try {
      panel.focus({ preventScroll: true });
    } catch {
      panel.focus();
    }
  }, [componentsPanelRefObject, reduceMotion]);

  const handleJumpToGallery = React.useCallback(() => {
    if (view === "tokens") {
      const fallback =
        decoratedViewTabs.find((tab) => tab.key !== "tokens")?.key ??
        decoratedViewTabs[0]?.key;
      if (fallback) {
        handleViewChange(fallback);
      }
      if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(() => {
          scrollToComponentsPanel();
        });
      } else {
        scrollToComponentsPanel();
      }
      return;
    }
    scrollToComponentsPanel();
  }, [decoratedViewTabs, handleViewChange, scrollToComponentsPanel, view]);

  const heroActions = React.useMemo(
    () => (
      <div className="flex w-full flex-wrap items-center gap-[var(--space-2)] md:w-auto md:justify-end md:gap-[var(--space-3)]">
        <Button
          type="button"
          size="md"
          variant="primary"
          onClick={() => handleViewChange("tokens")}
          disabled={view === "tokens"}
        >
          <Palette aria-hidden className="icon-sm" />
          <span>View tokens</span>
        </Button>
        <Button
          type="button"
          size="md"
          variant="secondary"
          onClick={handleJumpToGallery}
        >
          <ArrowDownToLine aria-hidden className="icon-sm" />
          <span>Jump to gallery</span>
        </Button>
        <Button asChild size="md" variant="ghost">
          <Link href="/prompts">Browse prompts</Link>
        </Button>
      </div>
    ),
    [handleJumpToGallery, handleViewChange, view],
  );

  const heroSummary = React.useMemo(
    () => (
      <div className="grid gap-[var(--space-4)] md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:items-start">
        <div className="space-y-[var(--space-3)]">
          <p className="text-body text-muted-foreground">
            Explore reusable patterns across Planner. Filter by category or search to
            jump straight to matching specs.
          </p>
          <dl className="grid gap-[var(--space-3)] sm:grid-cols-2">
            <div className="space-y-[var(--space-1)]">
              <dt className="text-label text-muted-foreground">Active view</dt>
              <dd className="text-ui font-semibold text-foreground">{activeViewLabel}</dd>
            </div>
            <div className="space-y-[var(--space-1)]">
              <dt className="text-label text-muted-foreground">Section</dt>
              <dd className="text-ui font-semibold text-foreground">{sectionLabel}</dd>
            </div>
          </dl>
        </div>
        <Card className="shadow-neo-soft">
          <CardHeader className="space-y-[var(--space-2)]">
            <CardTitle>Library snapshot</CardTitle>
            <CardDescription>
              Keep an eye on how many specs match the filters you have applied.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-[var(--space-3)]">
            <Badge tone="accent" size="lg">
              {countLabel}
            </Badge>
            <p className="text-ui text-muted-foreground">
              Results refresh instantly when you change the view, switch sections, or
              search by keyword.
            </p>
          </CardContent>
        </Card>
      </div>
    ),
    [activeViewLabel, countLabel, sectionLabel],
  );

  return (
    <>
      <PageShell
        as="header"
        className="py-[var(--space-6)] md:py-[var(--space-7)] lg:py-[var(--space-8)]"
      >
        <PageHeader
          containerClassName="relative isolate col-span-full"
          header={{
            id: "components-header",
            heading: "Component Gallery",
            subtitle: "Browse Planner UI building blocks by category.",
            sticky: false,
            tabs: {
              items: decoratedViewTabs,
              value: view,
              onChange: handleViewChange,
              ariaLabel: "Component gallery view",
              idBase: COMPONENTS_VIEW_TAB_ID_BASE,
              linkPanels: true,
              showBaseline: true,
            },
          }}
          hero={{
            frame: true,
            glitch: "off",
            sticky: false,
            eyebrow: heroCopy.eyebrow,
            heading: heroCopy.heading,
            subtitle: heroCopy.subtitle,
            icon: (
              <span className="[&_svg]:size-[var(--space-6)]">
                <PanelsTopLeft aria-hidden />
              </span>
            ),
            children: heroSummary,
            subTabs: showSectionTabs
              ? {
                  ariaLabel: "Component section",
                  items: heroTabs,
                  value: section,
                  onChange: handleSectionChange,
                  idBase: COMPONENTS_SECTION_TAB_ID_BASE,
                  linkPanels: true,
                  size: "sm",
                  showBaseline: true,
                  tablistClassName: "w-full md:w-auto",
                  className: "w-full md:w-auto",
                  renderItem: ({ item, props, ref, disabled }) => {
                    const {
                      className: baseClassName,
                      ...restProps
                    } = props;
                    return (
                      <button
                        type="button"
                        {...restProps}
                        ref={ref as React.Ref<HTMLButtonElement>}
                        className={cn(
                          baseClassName,
                          "inline-flex items-center gap-[var(--space-2)] text-label font-medium text-muted-foreground transition-colors",
                          "data-[active=true]:text-foreground",
                          disabled && "pointer-events-none",
                        )}
                        aria-controls={COMPONENTS_PANEL_ID}
                        disabled={disabled}
                      >
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  },
                }
              : undefined,
            search:
              showSectionTabs
                ? {
                    id: "components-search",
                    value: query,
                    onValueChange: setQuery,
                    debounceMs: 250,
                    round: true,
                    label: searchLabel,
                    placeholder: searchPlaceholder,
                  }
                : undefined,
            actions: heroActions,
          }}
        />
      </PageShell>

      <PageShell
        as="main"
        grid
        aria-labelledby="components-header"
        className="py-[var(--space-6)] md:py-[var(--space-7)] lg:py-[var(--space-8)]"
        contentClassName="gap-y-[var(--space-6)] md:gap-y-[var(--space-7)] lg:gap-y-[var(--space-8)]"
      >
        <ComponentsGalleryPanels
          view={view}
          filteredSpecs={filteredSpecs}
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
