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

export interface PageHeaderProps<
  HeaderKey extends string = string,
  HeroKey extends string = string,
>
  extends Omit<React.HTMLAttributes<HTMLElement>, "className" | "children"> {
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
}

/**
 * PageHeader — combines <Header> and <Hero> within a neomorphic frame.
 *
 * Used for top-of-page introductions with optional actions.
 */
export default function PageHeader<
  HeaderKey extends string = string,
  HeroKey extends string = string,
>({
  header,
  hero,
  className,
  frameProps,
  contentClassName,
  as,
  subTabs,
  search,
  ...elementProps
}: PageHeaderProps<HeaderKey, HeroKey>) {
  const Component = (as ?? "header") as PageHeaderElement;

  const {
    subTabs: heroSubTabs,
    search: heroSearch,
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

  return (
    <Component {...(elementProps as React.HTMLAttributes<HTMLElement>)}>
      <NeomorphicHeroFrame
        {...frameProps}
        className={cn(
          className ??
            "rounded-card r-card-lg border border-border/40 p-6 md:p-7 lg:p-8",
          frameProps?.className,
        )}
      >
        <div
          className={cn(
            "relative z-[2]",
            contentClassName ?? "space-y-5 md:space-y-6",
          )}
        >
          <Header {...header} underline={header.underline ?? false} />
          <Hero
            {...heroRest}
            as={heroAs ?? "header"}
            frame={heroFrame ?? true}
            topClassName={cn("top-[var(--header-stack)]", heroTopClassName)}
            subTabs={resolvedSubTabs}
            search={resolvedSearch}
          />
        </div>
      </NeomorphicHeroFrame>
    </Component>
  );
}
