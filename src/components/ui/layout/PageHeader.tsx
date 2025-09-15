// src/components/ui/layout/PageHeader.tsx
"use client";

import * as React from "react";
import Header, { type HeaderProps } from "./Header";
import Hero, { type HeroProps } from "./Hero";
import NeomorphicHeroFrame, {
  type NeomorphicHeroFrameProps,
} from "./NeomorphicHeroFrame";
import { cn } from "@/lib/utils";

type PageHeaderElement = Extract<
  keyof JSX.IntrinsicElements,
  "header" | "section" | "article" | "aside" | "main" | "div" | "nav"
>;

type PageHeaderElementProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "className" | "children"
>;

type PageHeaderFrameElement = React.ElementRef<typeof NeomorphicHeroFrame>;

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
  /** Additional props for the outer frame */
  frameProps?: NeomorphicHeroFrameProps;
  /** Optional className for the inner content wrapper */
  contentClassName?: string;
  /** Semantic element for the header container */
  as?: PageHeaderElement;
  /** Optional hero sub-tabs override */
  subTabs?: HeroProps<HeroKey>["subTabs"];
  /** Optional hero search override */
  search?: HeroProps<HeroKey>["search"];
  /** Optional hero actions override */
  actions?: HeroProps<HeroKey>["actions"];
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
    frameProps,
    contentClassName,
    as,
    subTabs,
    search,
    actions,
    ...elementProps
  }: PageHeaderBaseProps<HeaderKey, HeroKey>,
  ref: React.ForwardedRef<PageHeaderFrameElement>,
) => {
  const Component = (as ?? "header") as PageHeaderElement;

  const {
    subTabs: heroSubTabs,
    search: heroSearch,
    actions: heroActions,
    frame: heroFrame,
    topClassName: heroTopClassName,
    as: heroAs,
    ...heroRest
  } = hero;

  const resolvedSubTabs =
    heroSubTabs !== undefined ? heroSubTabs : subTabs;

  const searchSource =
    heroSearch !== undefined ? heroSearch : search;
  const resolvedSearch =
    searchSource === undefined
      ? undefined
      : searchSource === null
        ? null
        : { ...searchSource, round: searchSource.round ?? true };

  const resolvedActions =
    heroActions !== undefined ? heroActions : actions;

  const {
    className: frameClassName,
    contentClassName: frameContentClassName,
    density: frameDensity,
    variant: frameVariant,
    as: frameAs,
    lead: frameLead,
    tabs: frameTabs,
    actions: frameActions,
    search: frameSearch,
    footer: frameFooter,
    ...frameRest
  } = frameProps ?? {};

  const headerNode = (
    <Header {...header} underline={header.underline ?? false} />
  );

  const leadNode = frameLead ? (
    <>
      {frameLead}
      {headerNode}
    </>
  ) : (
    headerNode
  );

  return (
    <Component {...(elementProps as React.HTMLAttributes<HTMLElement>)}>
      <NeomorphicHeroFrame
        ref={ref}
        as={frameAs}
        density={frameDensity ?? "default"}
        variant={frameVariant ?? "neo"}
        className={cn(
          className ?? "rounded-card r-card-lg border border-border/40",
          frameClassName,
        )}
        contentClassName={cn(
          frameContentClassName,
          contentClassName,
        )}
        lead={leadNode}
        tabs={frameTabs}
        actions={frameActions}
        search={frameSearch}
        footer={frameFooter}
        {...frameRest}
      >
        <Hero
          {...heroRest}
          as={heroAs ?? "header"}
          frame={heroFrame ?? true}
          topClassName={cn("top-[var(--header-stack)]", heroTopClassName)}
          subTabs={resolvedSubTabs}
          search={resolvedSearch}
          actions={resolvedActions}
        />
      </NeomorphicHeroFrame>
    </Component>
  );
};

const PageHeaderWithForwardRef = React.forwardRef(PageHeaderInner);

PageHeaderWithForwardRef.displayName = "PageHeader";

type PageHeaderComponent = <
  HeaderKey extends string = string,
  HeroKey extends string = string,
>(
  props: PageHeaderBaseProps<HeaderKey, HeroKey> &
    React.RefAttributes<PageHeaderFrameElement>,
) => React.ReactElement | null;

const PageHeader = PageHeaderWithForwardRef as unknown as PageHeaderComponent;

export default PageHeader;
