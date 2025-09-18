// src/components/ui/layout/PageHeader.tsx
"use client";

import * as React from "react";
import Header, { type HeaderProps } from "./Header";
import Hero, { type HeroProps, HeroSearchBar } from "./Hero";
import NeomorphicHeroFrame, {
  type NeomorphicHeroFrameProps,
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
  /** Additional props for the outer frame */
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

type FrameAlign = NonNullable<NeomorphicHeroFrameProps["align"]>;

const slotAlignBiasMap: Record<FrameAlign, FrameAlign> = {
  start: "center",
  center: "center",
  end: "end",
  between: "end",
};

function isFrameAlign(value: unknown): value is FrameAlign {
  return (
    value === "start" ||
    value === "center" ||
    value === "end" ||
    value === "between"
  );
}

function getSearchAlign<Key extends string>(
  search: HeroProps<Key>["search"],
): FrameAlign | undefined {
  if (!search || typeof search !== "object") {
    return undefined;
  }
  const align = (search as { align?: unknown }).align;
  return isFrameAlign(align) ? align : undefined;
}

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
    () => (heroActions === null ? null : heroActions ?? actions),
    [heroActions, actions],
  );

  const resolvedHeroFrame = heroFrame ?? false;

  const {
    className: frameClassName,
    variant: frameVariant,
    slots: frameSlotsProp,
    align: frameAlign,
    label: frameLabel,
    labelledById: frameLabelledById,
    ...restFrameProps
  } = frameProps ?? {};

  const heroShouldRenderActionArea = frameSlotsProp === null;
  const heroShouldRenderTabs = heroShouldRenderActionArea || tabsInHero;

  const heroTabVariant: TabBarProps["variant"] | undefined =
    resolvedHeroFrame ? "neo" : undefined;

  const actionAreaTabs = React.useMemo(() => {
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

    return (
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
    );
  }, [resolvedSubTabs, heroTabVariant, heroShouldRenderTabs]);

  const actionAreaSearch = React.useMemo(() => {
    if (resolvedSearch === null) return null;
    if (!resolvedSearch) return undefined;
    const { align: _searchAlign, ...searchProps } = resolvedSearch;
    void _searchAlign;
    return <HeroSearchBar {...searchProps} />;
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

  const resolvedFrameSlots = React.useMemo<HeroSlots | null | undefined>(() => {
    if (frameSlotsProp === null) {
      return null;
    }

    const defaultSlots: HeroSlots = {
      tabs: actionAreaTabs,
      search: actionAreaSearch,
      actions: actionAreaActions,
    };

    const slotKeys: Array<keyof HeroSlots> = ["tabs", "search", "actions"];

    if (frameSlotsProp === undefined) {
      const hasAnyDefault = slotKeys.some((key) => {
        const value = defaultSlots[key];
        return value !== undefined && value !== null;
      });
      return hasAnyDefault ? defaultSlots : undefined;
    }

    const merged: HeroSlots = {};
    let hasRenderable = false;

    for (const key of slotKeys) {
      const provided = Object.prototype.hasOwnProperty.call(frameSlotsProp, key);
      const value = provided ? frameSlotsProp[key] : defaultSlots[key];
      if (value !== undefined) {
        merged[key] = value;
      }
      if (value !== undefined && value !== null) {
        hasRenderable = true;
      }
    }

    return hasRenderable ? merged : undefined;
  }, [frameSlotsProp, actionAreaTabs, actionAreaSearch, actionAreaActions]);

  const resolvedFrameAlign = React.useMemo<FrameAlign>(() => {
    if (frameAlign !== undefined) {
      return frameAlign;
    }

    if (resolvedFrameSlots === null) {
      return "between";
    }

    const tabsSlot = resolvedFrameSlots?.tabs;
    const searchSlot = resolvedFrameSlots?.search;
    const actionsSlot = resolvedFrameSlots?.actions;

    const hasTabsSlot = tabsSlot !== undefined && tabsSlot !== null;
    const hasSearchSlot = searchSlot !== undefined && searchSlot !== null;
    const hasActionsSlot = actionsSlot !== undefined && actionsSlot !== null;

    const slotCount =
      (hasTabsSlot ? 1 : 0) + (hasSearchSlot ? 1 : 0) + (hasActionsSlot ? 1 : 0);

    if (slotCount === 0) {
      return "between";
    }

    const tabsAlign: FrameAlign = (() => {
      const align = resolvedSubTabs?.align;
      return isFrameAlign(align) ? align : "end";
    })();
    const searchAlign = getSearchAlign<HeroKey>(resolvedSearch) ?? "center";

    if (slotCount === 1) {
      if (hasTabsSlot) {
        return tabsAlign;
      }
      if (hasSearchSlot) {
        return searchAlign;
      }
      return "center";
    }

    if (slotCount === 3) {
      return "between";
    }

    const biases: FrameAlign[] = [];

    if (hasTabsSlot) {
      biases.push(slotAlignBiasMap[tabsAlign]);
    }
    if (hasSearchSlot) {
      biases.push(slotAlignBiasMap[searchAlign]);
    }
    if (hasActionsSlot) {
      biases.push("end");
    }

    return biases.includes("center") ? "center" : "end";
  }, [frameAlign, resolvedFrameSlots, resolvedSubTabs, resolvedSearch]);

  return (
    <Component
      className={containerClassName}
      {...(elementProps as React.HTMLAttributes<HTMLElement>)}
    >
      <NeomorphicHeroFrame
        ref={ref}
        variant={frameVariant ?? "default"}
        align={resolvedFrameAlign}
        {...(resolvedFrameSlots !== undefined
          ? { slots: resolvedFrameSlots }
          : {})}
        label={frameLabel}
        labelledById={frameLabelledById}
        {...restFrameProps}
        className={cn(className, frameClassName)}
      >
        <div
          className={cn(
            "relative z-[2]",
            contentClassName ??
              "space-y-[var(--space-5)] md:space-y-[var(--space-6)]",
          )}
        >
          <Header
            {...headerRest}
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
            padding={heroPadding ?? "none"}
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
