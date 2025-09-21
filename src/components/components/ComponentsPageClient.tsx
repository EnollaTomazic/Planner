"use client";

import * as React from "react";
import Fuse from "fuse.js";
import { PanelsTopLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import ComponentSpecView from "@/components/prompts/ComponentsView";
import { getGallerySectionEntries } from "@/components/prompts/constants";
import ColorsView from "@/components/prompts/ColorsView";
import {
  type DesignTokenGroup,
  type GalleryHeroCopy,
  type GalleryNavigationData,
  type GalleryNavigationSection,
  type GallerySectionGroupKey,
} from "@/components/gallery/types";
import { formatGallerySectionLabel } from "@/components/gallery/registry";
import type { GallerySerializableEntry } from "@/components/gallery/registry";
import { Card, CardContent, PageHeader, PageShell } from "@/components/ui";
import Badge from "@/components/ui/primitives/Badge";
import { usePersistentState } from "@/lib/db";
import { cn } from "@/lib/utils";

const NEO_TABLIST_SHARED_CLASSES = [
  "data-[variant=neo]:rounded-card",
  "data-[variant=neo]:r-card-lg",
  "data-[variant=neo]:gap-[var(--space-2)]",
  "data-[variant=neo]:px-[var(--space-2)]",
  "data-[variant=neo]:py-[var(--space-2)]",
  "data-[variant=neo]:[--neo-tablist-bg:linear-gradient(135deg,hsl(var(--card)/0.9),hsl(var(--panel)/0.74))]",
  "data-[variant=neo]:[--neo-tab-bg:linear-gradient(135deg,hsl(var(--card)/0.96),hsl(var(--panel)/0.82))]",
  "data-[variant=neo]:shadow-neo",
  "data-[variant=neo]:hover:shadow-neo-soft",
  "data-[variant=neo]:[&_[data-active=true]]:relative",
  "data-[variant=neo]:[&_[data-active=true]::after]:content-['']",
  "data-[variant=neo]:[&_[data-active=true]::after]:pointer-events-none",
  "data-[variant=neo]:[&_[data-active=true]::after]:absolute",
  "data-[variant=neo]:[&_[data-active=true]::after]:left-[var(--space-3)]",
  "data-[variant=neo]:[&_[data-active=true]::after]:right-[var(--space-3)]",
  "data-[variant=neo]:[&_[data-active=true]::after]:-bottom-[var(--space-2)]",
  "data-[variant=neo]:[&_[data-active=true]::after]:h-[var(--hairline-w)]",
  "data-[variant=neo]:[&_[data-active=true]::after]:rounded-full",
  "data-[variant=neo]:[&_[data-active=true]::after]:underline-gradient",
].join(" ");

const HEADER_FRAME_CLASSNAME = [
  "shadow-neo",
  "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit]",
  "before:bg-[radial-gradient(120%_82%_at_12%_-20%,hsl(var(--accent)/0.3),transparent_65%),radial-gradient(110%_78%_at_88%_-12%,hsl(var(--ring)/0.28),transparent_70%)]",
  "before:opacity-80 before:mix-blend-screen",
  "after:pointer-events-none after:absolute after:inset-0 after:-z-20 after:rounded-[inherit]",
  "after:bg-[linear-gradient(135deg,hsl(var(--card)/0.9),hsl(var(--panel)/0.78)),radial-gradient(120%_140%_at_50%_120%,hsl(var(--accent-2)/0.2),transparent_75%)]",
  "after:opacity-70 after:mix-blend-soft-light",
  "motion-reduce:before:opacity-60 motion-reduce:after:opacity-50",
].join(" ");

type Section = GalleryNavigationSection["id"];
type ComponentsView = GallerySectionGroupKey;

interface ComponentsPageClientProps {
  navigation: GalleryNavigationData;
  tokenGroups: readonly DesignTokenGroup[];
}

const DEFAULT_FALLBACK_COPY: GalleryHeroCopy = {
  eyebrow: "Gallery",
  heading: "Planner component gallery",
  subtitle: "Browse Planner UI building blocks by category.",
};

export default function ComponentsPageClient({
  navigation,
  tokenGroups,
}: ComponentsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsString = searchParams.toString();
  const sectionParam = searchParams.get("section");
  const queryParam = searchParams.get("q");
  const viewParam = searchParams.get("view");
  const [, startTransition] = React.useTransition();
  const [query, setQuery] = usePersistentState("components-query", "");

  const groups = navigation.groups;

  const viewOrder = React.useMemo<ComponentsView[]>(
    () => groups.map((group) => group.id as ComponentsView),
    [groups],
  );

  const defaultView = React.useMemo<ComponentsView>(
    () => (viewOrder[0] ?? "primitives") as ComponentsView,
    [viewOrder],
  );

  const navSectionEntries = React.useMemo(
    () => groups.flatMap((group) => group.sections),
    [groups],
  );

  const sectionMap = React.useMemo(() => {
    const map = new Map<Section, GalleryNavigationSection>();
    for (const section of navSectionEntries) {
      map.set(section.id, section);
    }
    return map;
  }, [navSectionEntries]);

  const sectionGroupMap = React.useMemo(() => {
    const map = new Map<Section, ComponentsView>();
    for (const group of groups) {
      for (const section of group.sections) {
        map.set(section.id, group.id);
      }
    }
    return map;
  }, [groups]);

  const groupSectionIds = React.useMemo(() => {
    const map = new Map<ComponentsView, Set<Section>>();
    for (const group of groups) {
      map.set(
        group.id,
        new Set(group.sections.map((section) => section.id)),
      );
    }
    return map;
  }, [groups]);

  const defaultSection = React.useMemo<Section>(() => {
    for (const group of groups) {
      if (group.sections.length > 0) {
        return group.sections[0].id;
      }
    }
    return (navSectionEntries[0]?.id ?? "buttons") as Section;
  }, [groups, navSectionEntries]);

  const fallbackCopy = React.useMemo<GalleryHeroCopy>(() => {
    const firstSection = navSectionEntries[0];
    if (firstSection) {
      return firstSection.copy;
    }
    const firstGroup = groups[0];
    if (firstGroup) {
      return firstGroup.copy;
    }
    return DEFAULT_FALLBACK_COPY;
  }, [groups, navSectionEntries]);

  const normalizeView = React.useCallback(
    (value: string | null): ComponentsView => {
      if (value === "colors") {
        return "tokens";
      }
      if (value && (viewOrder as readonly string[]).includes(value)) {
        return value as ComponentsView;
      }
      return defaultView;
    },
    [defaultView, viewOrder],
  );

  const normalizeSection = React.useCallback(
    (value: string | null): Section => {
      if (value && sectionMap.has(value as Section)) {
        return value as Section;
      }
      return defaultSection;
    },
    [defaultSection, sectionMap],
  );

  const [view, setView] = React.useState<ComponentsView>(() =>
    normalizeView(viewParam),
  );
  const [section, setSection] = React.useState<Section>(() =>
    normalizeSection(sectionParam),
  );

  const previousSectionParamRef = React.useRef<string | null | undefined>(
    undefined,
  );
  const previousViewParamRef = React.useRef<string | null | undefined>(
    undefined,
  );
  const previousQueryParamRef = React.useRef<string | null | undefined>(
    undefined,
  );

  const componentsPanelRef = React.useRef<HTMLDivElement>(null);
  const tokensPanelRef = React.useRef<HTMLDivElement>(null);
  const previousViewRef = React.useRef<ComponentsView | null>(null);

  const currentGroup = React.useMemo(
    () => groups.find((group) => group.id === view) ?? null,
    [groups, view],
  );

  const heroTabs = React.useMemo(
    () =>
      currentGroup
        ? currentGroup.sections.map((section) => ({
            key: section.id,
            label: section.label,
            controls: "components-panel",
          }))
        : [],
    [currentGroup],
  );

  const sectionMeta = React.useMemo(
    () => sectionMap.get(section) ?? null,
    [section, sectionMap],
  );

  const currentGroupLabel = currentGroup?.label ?? "";
  const activeSectionLabel = sectionMeta?.label ?? "";
  const sectionMetaLabel = sectionMeta?.label;

  const sectionSpecs = React.useMemo<readonly GallerySerializableEntry[]>(
    () => getGallerySectionEntries(section),
    [section],
  );

  const sectionFuse = React.useMemo(() => {
    return new Fuse<GallerySerializableEntry>(sectionSpecs, {
      keys: ["name", "tags", "description", "props.name", "props.type"],
      threshold: 0.3,
    });
  }, [sectionSpecs]);

  const filteredSpecs = React.useMemo(() => {
    if (!query) {
      return sectionSpecs;
    }
    return sectionFuse.search(query).map((result) => result.item);
  }, [query, sectionFuse, sectionSpecs]);

  const filteredCount = filteredSpecs.length;

  const sectionLabel = React.useMemo(() => {
    if (sectionMetaLabel) {
      return sectionMetaLabel;
    }
    return formatGallerySectionLabel(section);
  }, [section, sectionMetaLabel]);

  const countLabel = React.useMemo(() => {
    const suffix = filteredCount === 1 ? "spec" : "specs";
    return `${filteredCount} ${sectionLabel.toLowerCase()} ${suffix}`;
  }, [filteredCount, sectionLabel]);

  const countDescriptionId = React.useId();

  const heroCopy = React.useMemo(() => {
    if (view === "tokens") {
      return currentGroup?.copy ?? fallbackCopy;
    }
    if (sectionMeta) {
      return sectionMeta.copy;
    }
    return currentGroup?.copy ?? fallbackCopy;
  }, [currentGroup, fallbackCopy, sectionMeta, view]);

  const sectionCopy = React.useMemo(() => {
    if (sectionMeta) {
      return sectionMeta.copy;
    }
    if (currentGroup && view !== "tokens") {
      return currentGroup.copy;
    }
    return heroCopy;
  }, [currentGroup, heroCopy, sectionMeta, view]);

  const searchLabel = React.useMemo(
    () => `Search ${sectionCopy.heading}`,
    [sectionCopy.heading],
  );

  const searchPlaceholder = React.useMemo(() => {
    const baseLabel = activeSectionLabel || currentGroupLabel || "gallery";
    return `Search ${baseLabel.toLowerCase()} specs…`;
  }, [activeSectionLabel, currentGroupLabel]);

  const viewTabs = React.useMemo(
    () =>
      groups.map((group) => ({
        key: group.id,
        label: group.label,
        controls: group.id === "tokens" ? "tokens-panel" : "components-panel",
      })),
    [groups],
  );

  const componentsPanelLabelledBy = React.useMemo(() => {
    const base = `components-${view}-tab`;
    if (heroTabs.length > 0) {
      return `${base} components-${section}-tab`;
    }
    return base;
  }, [heroTabs.length, section, view]);

  const handleViewChange = React.useCallback(
    (key: string | number) => {
      const rawValue = typeof key === "string" ? key : String(key);
      const nextView = normalizeView(rawValue);
      if (nextView === view) {
        return;
      }
      setView(nextView);
      if (nextView === "tokens") {
        return;
      }
      const allowedSections = groupSectionIds.get(nextView);
      if (allowedSections?.has(section)) {
        return;
      }
      const fallbackSection = groups
        .find((group) => group.id === nextView)
        ?.sections[0]?.id;
      if (fallbackSection && fallbackSection !== section) {
        setSection(fallbackSection);
      }
    },
    [groupSectionIds, groups, normalizeView, section, view],
  );

  React.useEffect(() => {
    if (previousSectionParamRef.current === sectionParam) {
      return;
    }
    previousSectionParamRef.current = sectionParam;
    const next = normalizeSection(sectionParam);
    setSection((prev) => (prev === next ? prev : next));
  }, [normalizeSection, sectionParam]);

  React.useEffect(() => {
    if (previousViewParamRef.current === viewParam) {
      return;
    }
    previousViewParamRef.current = viewParam;
    const next = normalizeView(viewParam);
    setView((prev) => (prev === next ? prev : next));
  }, [normalizeView, viewParam]);

  React.useEffect(() => {
    if (previousQueryParamRef.current === queryParam) {
      return;
    }
    previousQueryParamRef.current = queryParam;
    const next = queryParam ?? "";
    if (next !== query) {
      setQuery(next);
    }
  }, [queryParam, query, setQuery]);

  React.useEffect(() => {
    const current = sectionParam ?? "";
    if (current === section) return;
    const next = new URLSearchParams(paramsString);
    next.set("section", section);
    startTransition(() => {
      router.replace(`?${next.toString()}`, { scroll: false });
    });
  }, [paramsString, router, section, sectionParam, startTransition]);

  React.useEffect(() => {
    const current = normalizeView(viewParam);
    if (current === view) return;
    const next = new URLSearchParams(paramsString);
    if (view === defaultView) {
      next.delete("view");
    } else {
      next.set("view", view);
    }
    startTransition(() => {
      router.replace(`?${next.toString()}`, { scroll: false });
    });
  }, [defaultView, normalizeView, paramsString, router, startTransition, view, viewParam]);

  React.useEffect(() => {
    const current = queryParam ?? "";
    if (current === query) return;
    const next = new URLSearchParams(paramsString);
    if (query) {
      next.set("q", query);
    } else {
      next.delete("q");
    }
    startTransition(() => {
      router.replace(`?${next.toString()}`, { scroll: false });
    });
  }, [paramsString, query, queryParam, router, startTransition]);

  React.useEffect(() => {
    if (view === "tokens") {
      return;
    }
    const allowed = groupSectionIds.get(view);
    if (!allowed || allowed.size === 0) {
      return;
    }
    if (!allowed.has(section)) {
      const fallback = groups.find((group) => group.id === view)?.sections[0]?.id;
      if (fallback && fallback !== section) {
        setSection(fallback);
      }
    }
  }, [groupSectionIds, groups, section, view]);

  React.useEffect(() => {
    if (view === "tokens") {
      return;
    }
    const owner = sectionGroupMap.get(section);
    if (!owner) {
      return;
    }
    if (owner === view) {
      return;
    }
    const allowed = groupSectionIds.get(view);
    if (allowed?.has(section)) {
      return;
    }
    setView(owner);
  }, [groupSectionIds, section, sectionGroupMap, view]);

  React.useEffect(() => {
    const previousView = previousViewRef.current;
    if (view !== "tokens" && previousView === "tokens") {
      componentsPanelRef.current?.focus({ preventScroll: true });
    }
    previousViewRef.current = view;
  }, [view]);

  React.useEffect(() => {
    if (view === "tokens") {
      tokensPanelRef.current?.focus({ preventScroll: true });
    }
  }, [view]);

  const showSectionTabs = heroTabs.length > 0 && view !== "tokens";

  return (
    <PageShell
      as="main"
      grid
      aria-labelledby="components-header"
      className="py-[var(--space-6)] md:py-[var(--space-7)] lg:py-[var(--space-8)]"
      contentClassName="gap-y-[var(--space-6)] md:gap-y-[var(--space-7)] lg:gap-y-[var(--space-8)]"
    >
      <PageHeader
        containerClassName="relative isolate col-span-full"
        header={{
          id: "components-header",
          heading: "Component Gallery",
          subtitle: "Browse Planner UI building blocks by category.",
          sticky: false,
          tabs: {
            items: viewTabs,
            value: view,
            onChange: handleViewChange,
            ariaLabel: "Component gallery view",
            idBase: "components",
            linkPanels: true,
            variant: "neo",
            tablistClassName: cn(NEO_TABLIST_SHARED_CLASSES, "w-full md:w-auto"),
          },
        }}
        frameProps={{
          className: HEADER_FRAME_CLASSNAME,
        }}
        hero={{
          frame: true,
          sticky: false,
          eyebrow: heroCopy.eyebrow,
          heading: heroCopy.heading,
          subtitle: heroCopy.subtitle,
          icon: (
            <span className="[&_svg]:size-[var(--space-6)]">
              <PanelsTopLeft aria-hidden />
            </span>
          ),
          barClassName:
            "isolate overflow-hidden rounded-card r-card-lg before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(118%_82%_at_15%_-18%,hsl(var(--accent)/0.34),transparent_65%),radial-gradient(112%_78%_at_85%_-12%,hsl(var(--ring)/0.3),transparent_70%)] before:opacity-80 before:mix-blend-screen after:pointer-events-none after:absolute after:inset-0 after:-z-20 after:bg-[linear-gradient(135deg,hsl(var(--card)/0.9),hsl(var(--panel)/0.78)),repeating-linear-gradient(0deg,hsl(var(--ring)/0.12)_0_hsl(var(--ring)/0.12)_var(--hairline-w),transparent_var(--hairline-w),transparent_var(--space-2))] after:opacity-70 after:mix-blend-soft-light motion-reduce:after:opacity-50",
          subTabs: showSectionTabs
            ? {
                ariaLabel: "Component section",
                items: heroTabs,
                value: section,
                onChange: (key) => setSection(key as Section),
                idBase: "components",
                linkPanels: true,
                size: "sm",
                variant: "default",
                showBaseline: true,
                tablistClassName: cn(
                  "max-w-full shadow-neo-inset rounded-card r-card-lg",
                  "w-full md:w-auto",
                ),
                className: "max-w-full w-full md:w-auto",
                renderItem: ({ item, props, ref, disabled }) => {
                  const {
                    className: baseClassName,
                    onClick,
                    "aria-label": ariaLabelProp,
                    "aria-labelledby": ariaLabelledByProp,
                    title: titleProp,
                    ...restProps
                  } = props;
                  const handleClick: React.MouseEventHandler<HTMLElement> = (
                    event,
                  ) => {
                    onClick?.(event);
                  };
                  const labelText =
                    typeof item.label === "string" || typeof item.label === "number"
                      ? String(item.label)
                      : undefined;
                  const computedTitle = titleProp ?? labelText;
                  const computedAriaLabel =
                    ariaLabelProp ??
                    (labelText && !ariaLabelledByProp ? labelText : undefined);
                  return (
                    <button
                      type="button"
                      {...restProps}
                      ref={ref as React.Ref<HTMLButtonElement>}
                      className={cn(
                        baseClassName,
                        "text-label font-normal text-muted-foreground transition-colors",
                        "data-[active=true]:text-foreground data-[active=true]:font-medium",
                        disabled && "pointer-events-none",
                      )}
                      onClick={(event) => {
                        if (disabled) {
                          event.preventDefault();
                          event.stopPropagation();
                          return;
                        }
                        handleClick(event);
                      }}
                      disabled={disabled}
                      aria-labelledby={ariaLabelledByProp}
                      aria-label={computedAriaLabel}
                      title={computedTitle}
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
                  variant: "neo",
                  label: searchLabel,
                  placeholder: searchPlaceholder,
                  fieldClassName: cn(
                    "bg-[linear-gradient(135deg,hsl(var(--card)/0.95),hsl(var(--panel)/0.82))]",
                    "!shadow-neo-soft",
                    "hover:!shadow-neo-soft",
                    "active:!shadow-neo-soft",
                    "focus-within:!shadow-neo-soft",
                    "focus-within:[--tw-ring-offset-width:var(--space-1)]",
                    "focus-within:[--tw-ring-offset-color:hsl(var(--panel)/0.82)]",
                    "motion-reduce:transition-none motion-reduce:hover:!shadow-neo-soft motion-reduce:active:!shadow-neo-soft motion-reduce:focus-within:!shadow-neo-soft",
                  ),
                }
              : undefined,
        }}
      />
      <section
        className="col-span-full grid gap-[var(--space-6)] md:gap-[var(--space-7)] lg:gap-[var(--space-8)]"
      >
        <div
          id="components-components-panel"
          role="tabpanel"
          aria-labelledby={componentsPanelLabelledBy}
          tabIndex={-1}
          ref={componentsPanelRef}
          hidden={view === "tokens"}
          aria-hidden={view === "tokens"}
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
          id="components-tokens-panel"
          role="tabpanel"
          aria-labelledby={`components-${view}-tab`}
          tabIndex={-1}
          ref={tokensPanelRef}
          hidden={view !== "tokens"}
          aria-hidden={view !== "tokens"}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ColorsView groups={tokenGroups} />
        </div>
      </section>
    </PageShell>
  );
}
