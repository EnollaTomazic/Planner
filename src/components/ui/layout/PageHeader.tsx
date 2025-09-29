// src/components/ui/layout/PageHeader.tsx
"use client";

import * as React from "react";
import Header, { type HeaderProps } from "./Header";
import Hero, { type HeroProps, HeroSearchBar } from "./hero";
import NeomorphicHeroFrame, {
  type NeomorphicHeroFrameProps,
  type HeroSlot,
  type HeroSlotInput,
  type HeroSlots,
} from "./NeomorphicHeroFrame";
import TabBar, { type TabBarA11yProps, type TabBarProps } from "./TabBar";
import { cn } from "@/lib/utils";

type PageHeaderElement = Extract<
  keyof React.JSX.IntrinsicElements,
  "header" | "section" | "article" | "aside" | "main" | "div" | "nav"
>;

type PageHeaderElementProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "className" | "children"
>;

type PageHeaderFrameElement = React.ElementRef<typeof NeomorphicHeroFrame>;

type HeaderKey = string;
type HeroKey = string;

type FrameSlotPresence = {
  tabs: boolean;
  search: boolean;
  actions: boolean;
};

type FrameVariantWithSpacing = Exclude<
  NeomorphicHeroFrameProps["variant"],
  "unstyled" | undefined
>;

const frameContentSpacingByVariant = {
  default: "space-y-[var(--space-5)] md:space-y-[var(--space-6)]",
  compact: "space-y-[var(--space-4)] md:space-y-[var(--space-5)]",
  dense: "space-y-[var(--space-3)] md:space-y-[var(--space-4)]",
} as const satisfies Record<FrameVariantWithSpacing, string>;

const flushHeaderBarPaddingClass =
  "[--header-bar-px:var(--space-0)] sm:[--header-bar-sm-px:var(--space-0)]";

const flushHeaderBodyPaddingClass =
  "[--header-body-px:var(--space-0)] sm:[--header-body-sm-px:var(--space-0)]";

const hasRenderableNode = (node: React.ReactNode): boolean => {
  if (node === null || node === undefined) {
    return false;
  }
  if (typeof node === "boolean") {
    return false;
  }
  if (Array.isArray(node)) {
    return node.some((child) => hasRenderableNode(child));
  }
  return true;
};

const sanitizeActionsNode = <HeroKey extends string>(
  node: HeroProps<HeroKey>["actions"] | null | undefined,
): HeroProps<HeroKey>["actions"] | null | undefined => {
  if (node === undefined) {
    return undefined;
  }
  if (node === null) {
    return null;
  }
  return hasRenderableNode(node) ? node : null;
};

const hasRenderableSlotValue = (
  value: HeroSlotInput | null | undefined,
): boolean => {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === "boolean") {
    return false;
  }
  if (Array.isArray(value)) {
    return value.some((child) => hasRenderableNode(child));
  }
  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    !React.isValidElement(value) &&
    Object.prototype.hasOwnProperty.call(value, "node")
  ) {
    const slot = value as HeroSlot;
    return hasRenderableNode(slot.node);
  }
  return true;
};

const sanitizeSlotValue = (
  value: HeroSlotInput | null | undefined,
): HeroSlotInput | null | undefined => {
  if (value === undefined) {
    return undefined;
  }
  return hasRenderableSlotValue(value) ? value : null;
};

export interface PageHeaderBaseProps<
  HeaderKey extends string = string,
  HeroKey extends string = string,
> extends PageHeaderElementProps {
  /** Props forwarded to <Header> */
  header: HeaderProps<HeaderKey>;
  /** Props forwarded to <Hero> */
  hero: HeroProps<HeroKey>;
  /** Optional className for the outer frame */
  className?: string;
  /** Optional className for the semantic wrapper */
  containerClassName?: string;
  /**
   * Additional props for the outer frame.
   *
   * Inline style overrides are no longer supported; migrate to the
   * token-mapped data attributes instead. For example, use
   * `data-hero-divider-tint` or `data-hero-slot-shadow` to swap the
   * divider palette and slot shadow without violating CSP.
   */
  frameProps?: NeomorphicHeroFrameProps;
  /** Optional className for the inner content wrapper */
  contentClassName?: string;
  /** Semantic element for the header container (defaults to a <section>) */
  as?: PageHeaderElement;
  /** Optional hero sub-tabs override */
  subTabs?: HeroProps<HeroKey>["subTabs"];
  /** Optional hero search override */
  search?: HeroProps<HeroKey>["search"];
  /** Optional hero actions override */
  actions?: HeroProps<HeroKey>["actions"];
  /** Move header tabs into the hero region instead of rendering them inline */
  tabsInHero?: boolean;
}

export type PageHeaderProps<
  HeaderKey extends string = string,
  HeroKey extends string = string,
> = PageHeaderBaseProps<HeaderKey, HeroKey> &
  React.RefAttributes<PageHeaderFrameElement>;

export type PageHeaderRef = PageHeaderFrameElement;

/**
 * PageHeader — combines <Header> and <Hero> within a neomorphic frame.
 *
 * Used for top-of-page introductions with optional actions.
 */
const PageHeaderInner = <
  HeaderKey extends string = string,
  HeroKey extends string = string,
>(
  {
    header,
    hero,
    className,
    containerClassName,
    frameProps,
    contentClassName,
    as,
    subTabs,
    search,
    actions,
    tabsInHero = false,
    ...elementProps
  }: PageHeaderBaseProps<HeaderKey, HeroKey>,
  ref: React.ForwardedRef<PageHeaderFrameElement>,
) => {
  const Component: PageHeaderElement = as ?? "section";

  const {
    sticky: headerSticky = false,
    tabs: headerTabs,
    underline: headerUnderline,
    barClassName: headerBarClassName,
    bodyClassName: headerBodyClassName,
    ...headerRest
  } = header;

  const {
    sticky: heroSticky = false,
    subTabs: heroSubTabs,
    search: heroSearch,
    actions: heroActions,
    tone: heroTone,
    frame: heroFrame,
    topClassName: heroTopClassName,
    as: heroAs,
    padding: heroPadding,
    dividerTint: heroDividerTintProp,
    ...heroRest
  } = hero;

  const forwardedHeaderSubTabs = React.useMemo<
    HeroProps<HeroKey>["subTabs"] | undefined
  >(() => {
    if (!tabsInHero || heroSubTabs !== undefined || !headerTabs) {
      return undefined;
    }

    const { items, value, onChange, renderItem, ...restHeaderTabs } = headerTabs;

    return {
      ...restHeaderTabs,
      ...(renderItem
        ? {
            renderItem: renderItem as unknown as TabBarProps<HeroKey>["renderItem"],
          }
        : {}),
      items: items.map((item) => ({
        ...item,
        key: String(item.key) as HeroKey,
      })),
      value: String(value) as HeroKey,
      onChange: (key: HeroKey) => onChange(String(key) as HeaderKey),
    };
  }, [tabsInHero, heroSubTabs, headerTabs]);

  const resolvedSubTabs = React.useMemo(
    () => {
      if (heroSubTabs !== undefined) return heroSubTabs;
      if (subTabs !== undefined) return subTabs;
      return forwardedHeaderSubTabs;
    },
    [heroSubTabs, subTabs, forwardedHeaderSubTabs],
  );

  const resolvedSearch = React.useMemo(() => {
    const baseSearch = heroSearch === null ? null : heroSearch ?? search;
    return baseSearch !== null && baseSearch !== undefined
      ? { ...baseSearch, round: baseSearch.round ?? true }
      : baseSearch;
  }, [heroSearch, search]);

  const resolvedActions = React.useMemo(
    () =>
      sanitizeActionsNode<HeroKey>(
        heroActions === null ? null : heroActions ?? actions,
      ),
    [heroActions, actions],
  );

  const resolvedHeroFrame = heroFrame ?? true;

  const heroDividerTint = heroDividerTintProp ?? "primary";

  const frameDividerTintAttr = frameProps?.["data-hero-divider-tint"];
  const {
    className: frameClassName,
    variant: frameVariant,
    slots: frameSlotsProp,
    align: frameAlign,
    label: frameLabel,
    labelledById: frameLabelledById,
    ...framePropsRest
  } = frameProps ?? {};
  const { ["data-hero-divider-tint"]: _frameDividerTintAttr, ...restFrameProps } =
    framePropsRest;
  void _frameDividerTintAttr;

  const normalizedFrameDividerTint =
    frameDividerTintAttr === "life"
      ? "life"
      : frameDividerTintAttr === "primary"
      ? "primary"
      : undefined;

  const resolvedFrameDividerTint = normalizedFrameDividerTint ?? heroDividerTint;

  const heroShouldRenderActionArea = frameSlotsProp === null;
  const heroShouldRenderTabs = heroShouldRenderActionArea || tabsInHero;

  const heroTabVariant: TabBarProps["variant"] | undefined =
    resolvedHeroFrame ? "neo" : undefined;

  const computedContentSpacing = React.useMemo(() => {
    const variant = frameVariant ?? "default";
    if (variant === "unstyled") {
      return undefined;
    }
    return (
      frameContentSpacingByVariant[variant] ??
      frameContentSpacingByVariant.default
    );
  }, [frameVariant]);

  const normalizedHeaderBarClassName =
    headerBarClassName === undefined
      ? flushHeaderBarPaddingClass
      : headerBarClassName;

  const normalizedHeaderBodyClassName =
    headerBodyClassName === undefined
      ? flushHeaderBodyPaddingClass
      : headerBodyClassName;

  const actionAreaTabsSlot = React.useMemo<HeroSlot | null | undefined>(() => {
    if (!resolvedSubTabs || heroShouldRenderTabs) return undefined;

    const {
      items,
      value,
      onChange,
      className: subTabsClassName,
      align,
      size,
      showBaseline,
      right: subTabsRight,
      ariaLabel,
      ariaLabelledBy: subTabsAriaLabelledBy,
      variant: subTabsVariant,
      linkPanels,
      idBase,
    } = resolvedSubTabs;

    const sanitizedItems = items.map(({ hint, ...item }) => {
      void hint;
      return item;
    });

    const sanitizedAriaLabel =
      typeof ariaLabel === "string" && ariaLabel.trim().length > 0
        ? ariaLabel.trim()
        : undefined;
    const sanitizedAriaLabelledBy =
      typeof subTabsAriaLabelledBy === "string" &&
      subTabsAriaLabelledBy.trim().length > 0
        ? subTabsAriaLabelledBy.trim()
        : undefined;
    const accessibilityProps: TabBarA11yProps = sanitizedAriaLabelledBy
      ? {
          ariaLabelledBy: sanitizedAriaLabelledBy,
          ...(sanitizedAriaLabel ? { ariaLabel: sanitizedAriaLabel } : {}),
        }
      : {
          ariaLabel: sanitizedAriaLabel ?? "Hero sub-tabs",
        };

    const slotLabel = sanitizedAriaLabelledBy
      ? sanitizedAriaLabel ?? undefined
      : sanitizedAriaLabel ?? "Hero sub-tabs";

    return {
      node: (
        <TabBar<HeroKey>
          items={sanitizedItems}
          value={String(value) as HeroKey}
          onValueChange={(key) => onChange(key as HeroKey)}
          size={size ?? "md"}
          align={align ?? "end"}
          className={cn("justify-end", subTabsClassName)}
          showBaseline={showBaseline ?? true}
          right={subTabsRight}
          variant={subTabsVariant ?? heroTabVariant}
          {...accessibilityProps}
          linkPanels={linkPanels}
          idBase={idBase}
        />
      ),
      ...(slotLabel ? { label: slotLabel } : {}),
      ...(sanitizedAriaLabelledBy
        ? { labelledById: sanitizedAriaLabelledBy }
        : {}),
    };
  }, [
    resolvedSubTabs,
    heroTabVariant,
    heroShouldRenderTabs,
  ]);

  const actionAreaSearchSlot = React.useMemo<HeroSlot | null | undefined>(() => {
    if (resolvedSearch === null) return null;
    if (!resolvedSearch) return undefined;

    const rawAriaLabel = resolvedSearch["aria-label"];
    const sanitizedAriaLabel =
      typeof rawAriaLabel === "string" && rawAriaLabel.trim().length > 0
        ? rawAriaLabel.trim()
        : undefined;
    const rawAriaLabelledBy = resolvedSearch["aria-labelledby"];
    const sanitizedAriaLabelledBy =
      typeof rawAriaLabelledBy === "string" &&
      rawAriaLabelledBy.trim().length > 0
        ? rawAriaLabelledBy.trim()
        : undefined;
    const visibleLabel = resolvedSearch.label;
    const sanitizedVisibleLabel =
      typeof visibleLabel === "string" && visibleLabel.trim().length > 0
        ? visibleLabel.trim()
        : undefined;

    const slotLabel = sanitizedAriaLabelledBy
      ? sanitizedAriaLabel ?? sanitizedVisibleLabel
      : sanitizedAriaLabel ?? sanitizedVisibleLabel ?? "Hero search";

    const usesNeoPill =
      resolvedSearch.variant === "neo" || Boolean(resolvedSearch.round);

    return {
      node: <HeroSearchBar {...resolvedSearch} />,
      ...(slotLabel ? { label: slotLabel } : {}),
      ...(sanitizedAriaLabelledBy
        ? { labelledById: sanitizedAriaLabelledBy }
        : {}),
      ...(usesNeoPill ? { unstyled: true } : {}),
    };
  }, [resolvedSearch]);

  const actionAreaActions = resolvedActions;

  const heroActionProps = React.useMemo<
    Pick<HeroProps<HeroKey>, "subTabs" | "search" | "actions"> | undefined
  >(() => {
    if (!heroShouldRenderActionArea && !heroShouldRenderTabs) return undefined;
    return {
      ...(heroShouldRenderTabs ? { subTabs: resolvedSubTabs } : {}),
      ...(heroShouldRenderActionArea
        ? { search: resolvedSearch, actions: resolvedActions }
        : {}),
    };
  }, [
    heroShouldRenderActionArea,
    heroShouldRenderTabs,
    resolvedSubTabs,
    resolvedSearch,
    resolvedActions,
  ]);

  const { resolvedFrameSlots, frameSlotPresence } = React.useMemo<{
    resolvedFrameSlots: HeroSlots | null | undefined;
    frameSlotPresence: FrameSlotPresence;
  }>(() => {
    const emptyPresence: FrameSlotPresence = {
      tabs: false,
      search: false,
      actions: false,
    };

    if (frameSlotsProp === null) {
      return { resolvedFrameSlots: null, frameSlotPresence: emptyPresence };
    }

    const slotKeys: Array<keyof FrameSlotPresence> = [
      "tabs",
      "search",
      "actions",
    ];

    const defaultSlotCandidates: Record<
      keyof FrameSlotPresence,
      HeroSlotInput | null | undefined
    > = {
      tabs: sanitizeSlotValue(actionAreaTabsSlot),
      search: sanitizeSlotValue(actionAreaSearchSlot),
      actions: sanitizeSlotValue(actionAreaActions),
    };

    const defaultSlots: HeroSlots = {};
    for (const key of slotKeys) {
      const value = defaultSlotCandidates[key];
      if (value !== undefined) {
        defaultSlots[key] = value;
      }
    }

    if (frameSlotsProp === undefined) {
      const presence = { ...emptyPresence };
      let hasRenderable = false;

      for (const key of slotKeys) {
        const value = defaultSlotCandidates[key];
        if (hasRenderableSlotValue(value)) {
          presence[key] = true;
          hasRenderable = true;
        }
      }

      return {
        resolvedFrameSlots: hasRenderable ? defaultSlots : undefined,
        frameSlotPresence: presence,
      };
    }

    const merged: HeroSlots = {};
    const presence = { ...emptyPresence };
    let hasRenderable = false;

    for (const key of slotKeys) {
      const provided = Object.prototype.hasOwnProperty.call(frameSlotsProp, key);
      const candidate = provided
        ? (frameSlotsProp[key] as HeroSlotInput | null | undefined)
        : defaultSlotCandidates[key];
      const value = sanitizeSlotValue(candidate);
      if (value !== undefined) {
        merged[key] = value;
      }
      if (hasRenderableSlotValue(value)) {
        presence[key] = true;
        hasRenderable = true;
      }
    }

    if (!hasRenderable) {
      return { resolvedFrameSlots: undefined, frameSlotPresence: emptyPresence };
    }

    return { resolvedFrameSlots: merged, frameSlotPresence: presence };
  }, [
    frameSlotsProp,
    actionAreaTabsSlot,
    actionAreaSearchSlot,
    actionAreaActions,
  ]);

  const fallbackFrameAlign = React.useMemo<
    NeomorphicHeroFrameProps["align"] | undefined
  >(() => {
    if (resolvedFrameSlots === null) {
      return undefined;
    }

    const { tabs: hasTabs, search: hasSearch, actions: hasActions } =
      frameSlotPresence;

    const activeCount = Number(hasTabs) + Number(hasSearch) + Number(hasActions);

    if (activeCount === 0) {
      return undefined;
    }

    if (activeCount === 3) {
      return "between";
    }

    const tabPreference = hasTabs
      ? resolvedSubTabs?.align ?? "end"
      : undefined;

    let searchPreference: NeomorphicHeroFrameProps["align"] | undefined;
    if (hasSearch) {
      if (resolvedSearch && typeof resolvedSearch === "object") {
        const candidate = (resolvedSearch as {
          align?: NeomorphicHeroFrameProps["align"];
        }).align;
        if (
          candidate === "start" ||
          candidate === "center" ||
          candidate === "end" ||
          candidate === "between"
        ) {
          searchPreference = candidate;
        }
      }
      if (!searchPreference) {
        searchPreference = "center";
      }
    }

    const actionsPreference = hasActions ? "end" : undefined;

    if (activeCount === 1) {
      if (hasTabs) return tabPreference ?? "end";
      if (hasSearch) return searchPreference ?? "center";
      return "center";
    }

    const preferenceOrder: Array<
      [present: boolean, value: NeomorphicHeroFrameProps["align"] | undefined]
    > = [
      [hasSearch, searchPreference],
      [hasTabs, tabPreference],
      [hasActions, actionsPreference],
    ];

    for (const [present, value] of preferenceOrder) {
      if (!present) continue;
      if (value) return value;
    }

    return "center";
  }, [
    resolvedFrameSlots,
    frameSlotPresence,
    resolvedSubTabs,
    resolvedSearch,
  ]);

  const effectiveFrameAlign =
    frameAlign ?? fallbackFrameAlign ?? "between";

  return (
    <Component
      className={containerClassName}
      {...(elementProps as React.HTMLAttributes<HTMLElement>)}
    >
      <NeomorphicHeroFrame
        ref={ref}
        variant={frameVariant ?? "default"}
        align={effectiveFrameAlign}
        {...(resolvedFrameSlots !== undefined
          ? { slots: resolvedFrameSlots }
          : {})}
        label={frameLabel}
        labelledById={frameLabelledById}
        data-hero-divider-tint={resolvedFrameDividerTint}
        {...restFrameProps}
        className={cn(className, frameClassName)}
      >
        <div
          className={cn(
            "relative z-[2]",
            computedContentSpacing,
            contentClassName,
          )}
        >
          <Header
            {...headerRest}
            barClassName={normalizedHeaderBarClassName}
            bodyClassName={normalizedHeaderBodyClassName}
            sticky={headerSticky}
            tabs={tabsInHero ? undefined : headerTabs}
            underline={headerUnderline ?? false}
          />
          <Hero
            {...heroRest}
            sticky={heroSticky}
            as={heroAs ?? "section"}
            frame={resolvedHeroFrame}
            topClassName={cn("top-[var(--header-stack)]", heroTopClassName)}
            tone={heroTone ?? "supportive"}
            dividerTint={heroDividerTint}
            {...(heroPadding !== undefined ? { padding: heroPadding } : {})}
            {...(heroActionProps ?? {})}
          />
        </div>
      </NeomorphicHeroFrame>
    </Component>
  );
};

const PageHeader = React.forwardRef<
  PageHeaderFrameElement,
  PageHeaderBaseProps<HeaderKey, HeroKey>
>(PageHeaderInner);

PageHeader.displayName = "PageHeader";

export default PageHeader as <
  HeaderKey extends string = string,
  HeroKey extends string = string,
>(
  props: PageHeaderProps<HeaderKey, HeroKey>,
) => React.ReactElement | null;
