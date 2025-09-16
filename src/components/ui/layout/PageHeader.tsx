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
    ...elementProps
  }: PageHeaderBaseProps<HeaderKey, HeroKey>,
  ref: React.ForwardedRef<PageHeaderFrameElement>,
) => {
  const Component: PageHeaderElement = as ?? "section";

  const {
    subTabs: heroSubTabs,
    search: heroSearch,
    actions: heroActions,
    tone: heroTone,
    frame: heroFrame,
    topClassName: heroTopClassName,
    as: heroAs,
    ...heroRest
  } = hero;

  const resolvedSubTabs = React.useMemo(
    () => heroSubTabs ?? subTabs,
    [heroSubTabs, subTabs],
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

  const { className: frameClassName, variant: frameVariant, ...restFrameProps } =
    frameProps ?? {};

  return (
    <Component
      className={containerClassName}
      {...(elementProps as React.HTMLAttributes<HTMLElement>)}
    >
      <NeomorphicHeroFrame
        ref={ref}
        variant={frameVariant ?? "default"}
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
          <Header {...header} underline={header.underline ?? false} />
          <Hero
            {...heroRest}
            as={heroAs ?? "section"}
            frame={heroFrame ?? false}
            topClassName={cn("top-[var(--header-stack)]", heroTopClassName)}
            tone={heroTone ?? "supportive"}
            subTabs={resolvedSubTabs}
            search={resolvedSearch}
            actions={resolvedActions}
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
