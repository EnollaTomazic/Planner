// src/components/ui/layout/PageHeader.tsx
"use client";

import * as React from "react";
import Header, { type HeaderProps } from "./Header";
import Hero, { type HeroProps, HeroSearchBar } from "./Hero";
import NeomorphicHeroFrame, {
  type NeomorphicHeroFrameProps,
  type NeomorphicHeroFrameActionAreaProps,
} from "./NeomorphicHeroFrame";
import TabBar, { type TabBarProps } from "./TabBar";
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
    actionArea: frameActionAreaProp,
    allowOverflow: frameAllowOverflow,
    ...restFrameProps
  } = frameProps ?? {};

  const frameActionArea = frameActionAreaProp ?? null;

  const stickyChildrenPresent = headerSticky || heroSticky;

  const heroShouldRenderActionArea = frameActionArea === null;
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
      variant: subTabsVariant,
      linkPanels,
      idBase,
    } = resolvedSubTabs;

    const sanitizedItems = items.map(({ hint, ...item }) => {
      void hint;
      return item;
    });

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
        ariaLabel={ariaLabel ?? "Hero sub-tabs"}
        linkPanels={linkPanels}
        idBase={idBase}
      />
    );
  }, [resolvedSubTabs, heroTabVariant, heroShouldRenderTabs]);

  const actionAreaSearch = React.useMemo(() => {
    if (resolvedSearch === null) return null;
    if (!resolvedSearch) return undefined;
    return <HeroSearchBar {...resolvedSearch} />;
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

  const resolvedFrameActionArea = React.useMemo<
    NeomorphicHeroFrameActionAreaProps | null | undefined
  >(() => {
    if (frameActionArea === null) {
      return null;
    }

    const tabsProvided =
      frameActionArea !== undefined &&
      Object.prototype.hasOwnProperty.call(frameActionArea, "tabs");
    const searchProvided =
      frameActionArea !== undefined &&
      Object.prototype.hasOwnProperty.call(frameActionArea, "search");
    const actionsProvided =
      frameActionArea !== undefined &&
      Object.prototype.hasOwnProperty.call(frameActionArea, "actions");

    const tabs = tabsProvided ? frameActionArea?.tabs : actionAreaTabs;
    const search = searchProvided ? frameActionArea?.search : actionAreaSearch;
    const actions = actionsProvided ? frameActionArea?.actions : actionAreaActions;

    if (
      frameActionArea === undefined &&
      tabs === undefined &&
      search === undefined &&
      actions === undefined
    ) {
      return undefined;
    }

    if (
      frameActionArea &&
      tabs === frameActionArea.tabs &&
      search === frameActionArea.search &&
      actions === frameActionArea.actions
    ) {
      return frameActionArea;
    }

    return {
      ...(frameActionArea ?? {}),
      ...(tabs !== undefined ? { tabs } : {}),
      ...(search !== undefined ? { search } : {}),
      ...(actions !== undefined ? { actions } : {}),
    };
  }, [frameActionArea, actionAreaTabs, actionAreaSearch, actionAreaActions]);

  return (
    <Component
      className={containerClassName}
      {...(elementProps as React.HTMLAttributes<HTMLElement>)}
    >
      <NeomorphicHeroFrame
        ref={ref}
        variant={frameVariant ?? "default"}
        actionArea={resolvedFrameActionArea}
        allowOverflow={
          frameAllowOverflow ?? stickyChildrenPresent
        }
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
