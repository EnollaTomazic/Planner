"use client";

import * as React from "react";
import Fuse from "fuse.js";
import { useRouter, useSearchParams } from "next/navigation";

import { getGallerySectionEntries } from "@/components/prompts/constants";
import {
  type GalleryHeroCopy,
  type GalleryNavigationData,
  type GalleryNavigationSection,
  type GallerySectionGroupKey,
} from "@/components/gallery/types";
import { formatGallerySectionLabel } from "@/components/gallery/registry";
import type { GallerySerializableEntry } from "@/components/gallery/registry";
import { usePersistentState } from "@/lib/db";

export type Section = GalleryNavigationSection["id"];
export type ComponentsView = GallerySectionGroupKey;

export const COMPONENTS_VIEW_TAB_ID_BASE = "components";
export const COMPONENTS_SECTION_TAB_ID_BASE = "components-section";
export const COMPONENTS_PANEL_ID = "components-components-panel";

interface TabItem {
  readonly key: string;
  readonly label: string;
  readonly controls: string;
}

interface UseComponentsGalleryStateParams {
  readonly navigation: GalleryNavigationData;
}

export interface ComponentsGalleryState {
  readonly view: ComponentsView;
  readonly section: Section;
  readonly query: string;
  readonly setQuery: React.Dispatch<React.SetStateAction<string>>;
  readonly heroCopy: GalleryHeroCopy;
  readonly heroTabs: TabItem[];
  readonly viewTabs: TabItem[];
  readonly showSectionTabs: boolean;
  readonly searchLabel: string;
  readonly searchPlaceholder: string;
  readonly filteredSpecs: readonly GallerySerializableEntry[];
  readonly sectionLabel: string;
  readonly countLabel: string;
  readonly countDescriptionId: string;
  readonly componentsPanelLabelledBy: string;
  readonly handleViewChange: (key: string | number) => void;
  readonly handleSectionChange: (key: string | number) => void;
  readonly componentsPanelRef: React.Ref<HTMLDivElement>;
  readonly tokensPanelRef: React.Ref<HTMLDivElement>;
}

const DEFAULT_FALLBACK_COPY: GalleryHeroCopy = {
  eyebrow: "Gallery",
  heading: "Planner component gallery",
  subtitle: "Browse Planner UI building blocks by category.",
};

function isKeyboardFocusVisible(element: HTMLElement): boolean {
  try {
    if (element.matches(":focus-visible")) {
      return true;
    }
  } catch {
    // Ignore selector support errors and fall back to class/attribute detection.
  }

  return (
    element.classList.contains("focus-visible") ||
    element.classList.contains("is-focus-visible") ||
    element.hasAttribute("data-focus-visible-added") ||
    element.dataset.focusVisible === "true"
  );
}

export function formatQueryWithHash(
  queryString: string,
  hash: string | undefined,
): string {
  const hasQuery = queryString.length > 0;
  const queryPrefix = hasQuery ? `?${queryString}` : "";
  if (!hash) {
    return queryPrefix;
  }
  if (!hasQuery) {
    return hash;
  }
  return `${queryPrefix}${hash}`;
}

export function useComponentsGalleryState({
  navigation,
}: UseComponentsGalleryStateParams): ComponentsGalleryState {
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

  const getDefaultSectionForView = React.useCallback(
    (viewValue: ComponentsView | null | undefined): Section => {
      if (viewValue) {
        const viewGroup = groups.find((group) => group.id === viewValue);
        const firstSection = viewGroup?.sections[0];
        if (firstSection) {
          return firstSection.id;
        }
      }
      const fallbackSection = navSectionEntries[0]?.id;
      if (fallbackSection) {
        return fallbackSection;
      }
      return "buttons" as Section;
    },
    [groups, navSectionEntries],
  );

  const shouldAllowCrossView = React.useCallback(
    (rawView: string | null) => {
      if (rawView === null) {
        return true;
      }
      if (rawView === "colors") {
        return false;
      }
      return !(viewOrder as readonly string[]).includes(rawView);
    },
    [viewOrder],
  );

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
    (
      value: string | null,
      viewValue: ComponentsView,
      options: { allowCrossView?: boolean } = {},
    ): Section => {
      const allowCrossView = options.allowCrossView ?? false;
      if (value && sectionMap.has(value as Section)) {
        const owner = sectionGroupMap.get(value as Section);
        if (!owner || owner === viewValue || allowCrossView) {
          return value as Section;
        }
      }
      return getDefaultSectionForView(viewValue);
    },
    [getDefaultSectionForView, sectionGroupMap, sectionMap],
  );

  const [view, setView] = React.useState<ComponentsView>(() =>
    normalizeView(viewParam),
  );
  const [section, setSection] = React.useState<Section>(() =>
    normalizeSection(sectionParam, normalizeView(viewParam), {
      allowCrossView: shouldAllowCrossView(viewParam),
    }),
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
  const lastInteractionRef = React.useRef<"pointer" | "keyboard" | null>(null);
  const supportsPreventScrollRef = React.useRef<boolean | null>(null);
  const lastSyncedSectionRef = React.useRef<Section | null>(null);
  const shouldFocusPanel = React.useCallback(
    (panel: HTMLElement | null) => {
      if (typeof document === "undefined" || !panel) {
        return false;
      }
      if (lastInteractionRef.current === "pointer") {
        return false;
      }
      const activeElement = document.activeElement;
      if (!activeElement || !(activeElement instanceof HTMLElement)) {
        return false;
      }
      if (activeElement.getAttribute("role") !== "tab") {
        return false;
      }
      if (panel.id) {
        const controls = activeElement.getAttribute("aria-controls");
        if (!controls || controls !== panel.id) {
          return false;
        }
      }
      if (!isKeyboardFocusVisible(activeElement)) {
        return false;
      }
      return true;
    },
    [lastInteractionRef],
  );
  const focusPanel = React.useCallback(
    (panel: HTMLElement | null) => {
      if (!panel || !shouldFocusPanel(panel)) {
        return;
      }
      if (supportsPreventScrollRef.current === true) {
        panel.focus({ preventScroll: true });
        return;
      }
      if (supportsPreventScrollRef.current === false) {
        panel.focus();
        return;
      }
      try {
        panel.focus({
          get preventScroll() {
            supportsPreventScrollRef.current = true;
            return true;
          },
        } as FocusOptions);
      } catch {
        supportsPreventScrollRef.current = false;
        panel.focus();
      }
    },
    [shouldFocusPanel],
  );

  const currentGroup = React.useMemo(
    () => groups.find((group) => group.id === view) ?? null,
    [groups, view],
  );

  const heroTabs = React.useMemo<TabItem[]>(
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

  const resolvedSection = React.useMemo<Section>(() => {
    if (heroTabs.some((tab) => tab.key === section)) {
      return section;
    }
    const fallbackSection = heroTabs[0]?.key;
    if (fallbackSection) {
      return fallbackSection as Section;
    }
    return section;
  }, [heroTabs, section]);

  const sectionMeta = React.useMemo(() => {
    const groupSection = currentGroup?.sections.find(
      (groupSectionEntry) => groupSectionEntry.id === resolvedSection,
    );
    if (groupSection) {
      return groupSection;
    }
    return sectionMap.get(resolvedSection) ?? null;
  }, [currentGroup, resolvedSection, sectionMap]);

  const currentGroupLabel = currentGroup?.label ?? "";
  const activeSectionLabel = sectionMeta?.label ?? "";
  const sectionMetaLabel = sectionMeta?.label;

  const sectionSpecs = React.useMemo<readonly GallerySerializableEntry[]>(
    () => getGallerySectionEntries(resolvedSection),
    [resolvedSection],
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
    return formatGallerySectionLabel(resolvedSection);
  }, [resolvedSection, sectionMetaLabel]);

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

  const viewTabs = React.useMemo<TabItem[]>(
    () =>
      groups.map((group) => ({
        key: group.id,
        label: group.label,
        controls: group.id === "tokens" ? "tokens-panel" : "components-panel",
      })),
    [groups],
  );

  const componentsPanelLabelledBy = React.useMemo(() => {
    const viewTabId = `${COMPONENTS_VIEW_TAB_ID_BASE}-${view}-tab`;
    if (heroTabs.length > 0) {
      const sectionTabId = `${COMPONENTS_SECTION_TAB_ID_BASE}-${resolvedSection}-tab`;
      return `${viewTabId} ${sectionTabId}`;
    }
    return viewTabId;
  }, [heroTabs.length, resolvedSection, view]);

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
      const fallbackSection = getDefaultSectionForView(nextView);
      if (fallbackSection !== section) {
        setSection(fallbackSection);
      }
    },
    [
      getDefaultSectionForView,
      groupSectionIds,
      normalizeView,
      section,
      view,
    ],
  );

  const handleSectionChange = React.useCallback(
    (key: string | number) => {
      const rawValue = typeof key === "string" ? key : String(key);
      setSection(normalizeSection(rawValue, view));
    },
    [normalizeSection, view],
  );

  React.useEffect(() => {
    if (previousSectionParamRef.current === sectionParam) {
      return;
    }
    previousSectionParamRef.current = sectionParam;
    const normalizedViewFromParams = normalizeView(viewParam);
    const next = normalizeSection(sectionParam, normalizedViewFromParams, {
      allowCrossView: shouldAllowCrossView(viewParam),
    });
    setSection((prev) => (prev === next ? prev : next));
  }, [
    normalizeSection,
    normalizeView,
    sectionParam,
    shouldAllowCrossView,
    viewParam,
  ]);

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
    if (typeof window === "undefined") {
      return;
    }
    const handlePointerDown = () => {
      lastInteractionRef.current = "pointer";
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }
      lastInteractionRef.current = "keyboard";
    };
    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [lastInteractionRef]);

  const buildQueryWithHash = React.useCallback((next: URLSearchParams) => {
    const queryString = next.toString();
    if (queryString.length === 0) {
      if (typeof window === "undefined") {
        return "";
      }
      return formatQueryWithHash("", window.location.hash);
    }
    if (typeof window === "undefined") {
      return formatQueryWithHash(queryString, undefined);
    }
    const hash = window.location.hash;
    return formatQueryWithHash(queryString, hash);
  }, []);

  React.useEffect(() => {
    const current = sectionParam ?? "";
    if (current === resolvedSection) {
      lastSyncedSectionRef.current = resolvedSection;
      return;
    }
    if (lastSyncedSectionRef.current === resolvedSection) {
      return;
    }
    lastSyncedSectionRef.current = resolvedSection;
    const next = new URLSearchParams(paramsString);
    next.set("section", resolvedSection);
    startTransition(() => {
      router.replace(buildQueryWithHash(next), { scroll: false });
    });
  }, [
    buildQueryWithHash,
    paramsString,
    resolvedSection,
    router,
    sectionParam,
    startTransition,
  ]);

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
      router.replace(buildQueryWithHash(next), { scroll: false });
    });
  }, [
    buildQueryWithHash,
    defaultView,
    normalizeView,
    paramsString,
    router,
    startTransition,
    view,
    viewParam,
  ]);

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
      router.replace(buildQueryWithHash(next), { scroll: false });
    });
  }, [buildQueryWithHash, paramsString, query, queryParam, router, startTransition]);

  React.useEffect(() => {
    if (view === "tokens") {
      return;
    }
    const allowed = groupSectionIds.get(view);
    if (!allowed || allowed.size === 0) {
      return;
    }
    if (!allowed.has(section)) {
      const fallback = getDefaultSectionForView(view);
      if (fallback !== section) {
        setSection(fallback);
      }
    }
  }, [getDefaultSectionForView, groupSectionIds, section, view]);

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
      focusPanel(componentsPanelRef.current);
    }
    previousViewRef.current = view;
  }, [focusPanel, view]);

  React.useEffect(() => {
    if (view !== "tokens") {
      return;
    }
    focusPanel(tokensPanelRef.current);
  }, [focusPanel, view]);

  const showSectionTabs = heroTabs.length > 0 && view !== "tokens";

  return {
    view,
    section: resolvedSection,
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
  };
}
