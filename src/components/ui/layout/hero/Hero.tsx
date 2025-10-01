// src/components/ui/layout/hero/Hero.tsx
"use client";

import * as React from "react";
import TabBar, {
  type TabBarA11yProps,
  type TabBarProps,
  type TabItem,
} from "../TabBar";
import type { HeaderTabsProps } from "@/components/ui/layout/Header";
import {
  DEFAULT_HERO_STATE,
  DEFAULT_HERO_VARIANT,
  getHeroIllustration,
  type HeroIllustrationState,
} from "@/data/heroImages";
import { cn } from "@/lib/utils";
import { NeomorphicFrameStyles } from "../NeomorphicFrameStyles";
import { HeroGlitchStyles } from "./HeroGlitchStyles";
import { HeroImage } from "./HeroImage";
import { HeroSearchBar, type HeroSearchBarProps } from "./HeroSearchBar";
import { useHeroStyles } from "./useHeroStyles";

type HeroElement = Extract<
  keyof React.JSX.IntrinsicElements,
  "header" | "section" | "article" | "aside" | "div" | "main" | "nav"
>;

export interface HeroProps<Key extends string = string>
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: React.ReactNode;
  heading: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  /** Illustration state from the hero library. */
  illustrationState?: HeroIllustrationState;
  /** Explicit alternate text for the illustration (defaults to heading or library description). */
  illustrationAlt?: string;
  sticky?: boolean;
  topClassName?: string;
  barClassName?: string;
  bodyClassName?: string;
  /** Visual treatment for the label cluster bar. */
  barVariant?: "flat" | "raised";
  /** @deprecated Decorative rails were removed. */
  rail?: boolean;
  /** Typography profile for the heading/subtitle. */
  tone?: "heroic" | "supportive";

  /** Whether to include glitchy frame and background layers. */
  frame?: boolean;

  /** Level of glitch treatment for frame overlays (defaults to subtle). */
  glitch?: "default" | "subtle" | "off";

  /** Divider tint for neon line. */
  dividerTint?: "primary" | "life";

  /** Semantic wrapper element (defaults to `section`). */
  as?: HeroElement;

  /** Horizontal padding for the outer shell. */
  padding?: "default" | "none";

  /** Built-in top-right sub-tabs (preferred). */
  subTabs?: HeaderTabsProps<Key> & {
    size?: TabBarProps["size"];
    align?: TabBarProps["align"];
    className?: string;
    showBaseline?: boolean;
    right?: React.ReactNode;
    idBase?: string;
  };

  /** @deprecated Use `subTabs` instead. */
  tabs?: {
    items: TabItem[];
    value: string;
    onChange: (key: string) => void;
    size?: TabBarProps["size"];
    align?: TabBarProps["align"];
    className?: string;
    showBaseline?: boolean;
    variant?: TabBarProps["variant"];
    linkPanels?: boolean;
  };

  /** Built-in bottom search (preferred). `round` makes it pill. */
  search?: (HeroSearchBarProps & { round?: boolean }) | null;
}

const defaultIllustrationAlt = getHeroIllustration(
  DEFAULT_HERO_VARIANT,
  DEFAULT_HERO_STATE,
).alt;

function Hero<Key extends string = string>({
  eyebrow,
  heading,
  subtitle,
  icon,
  children,
  actions,
  illustrationState,
  illustrationAlt,
  tone = "heroic",
  frame = true,
  glitch = "subtle",
  sticky = true,
  topClassName = "top-[var(--space-8)]",
  barClassName,
  bodyClassName,
  barVariant = "flat",
  rail: _deprecatedRail = true,
  dividerTint = "primary",
  subTabs,
  tabs,
  search,
  className,
  as,
  padding = "default",
  ...rest
}: HeroProps<Key>) {
  void _deprecatedRail;
  const headingStr = typeof heading === "string" ? heading : undefined;
  const illustrationAltText =
    illustrationAlt ?? headingStr ?? defaultIllustrationAlt;
  const Component: HeroElement = as ?? "section";

  const {
    heroVariant,
    shouldRenderGlitchStyles,
    isRaisedBar,
    showDividerGlow,
    classes,
  } = useHeroStyles({
    frame,
    sticky,
    topClassName,
    padding,
    barVariant,
    tone,
    glitch,
  });

  const iconNode = icon ? (
    <div className="shrink-0 opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100">
      {icon}
    </div>
  ) : null;

  const headingContent = (
    <div className="min-w-0">
      {eyebrow ? (
        <div className="text-label font-semibold tracking-[0.02em] uppercase text-muted-foreground">
          {eyebrow}
        </div>
      ) : null}

      <div className="flex min-w-0 flex-wrap items-baseline gap-x-[var(--space-2)] gap-y-[var(--space-1)]">
        <h2 className={classes.heading} data-text={headingStr}>
          {heading}
        </h2>
        {subtitle ? <span className={classes.subtitle}>{subtitle}</span> : null}
      </div>
    </div>
  );

  const subTabsNode = subTabs
    ? (() => {
        const sanitizedLabel =
          typeof subTabs.ariaLabel === "string" && subTabs.ariaLabel.trim().length > 0
            ? subTabs.ariaLabel.trim()
            : undefined;
        const sanitizedLabelledBy =
          typeof subTabs.ariaLabelledBy === "string" &&
          subTabs.ariaLabelledBy.trim().length > 0
            ? subTabs.ariaLabelledBy.trim()
            : undefined;
        const accessibilityProps: TabBarA11yProps = sanitizedLabelledBy
          ? {
              ariaLabelledBy: sanitizedLabelledBy,
              ...(sanitizedLabel ? { ariaLabel: sanitizedLabel } : {}),
            }
          : {
              ariaLabel: sanitizedLabel ?? "Hero sub-tabs",
            };

        return (
          <TabBar
            items={subTabs.items.map(({ hint, ...item }) => {
              void hint;
              return item;
            })}
            value={String(subTabs.value)}
            onValueChange={(key) => subTabs.onChange(key as Key)}
            size={subTabs.size ?? "md"}
            align={subTabs.align ?? "end"}
            right={subTabs.right}
            showBaseline={subTabs.showBaseline ?? true}
            variant={subTabs.variant ?? heroVariant}
            className={cn("justify-end", subTabs.className)}
            {...accessibilityProps}
            linkPanels={subTabs.linkPanels}
            idBase={subTabs.idBase}
          />
        );
      })()
    : tabs
      ? (
          <TabBar
            items={tabs.items}
            value={tabs.value}
            onValueChange={tabs.onChange}
            size={tabs.size ?? "md"}
            align={tabs.align ?? "end"}
            showBaseline={tabs.showBaseline ?? true}
            variant={tabs.variant ?? heroVariant}
            className={cn("justify-end", tabs.className)}
            ariaLabel="Hero tabs"
            linkPanels={tabs.linkPanels}
          />
        )
      : null;

  const searchProps =
    search != null
      ? {
          ...search,
          round: search.round ?? true,
          variant: search.variant ?? heroVariant,
        }
      : search;

  const rootClassName = cn("relative", className);

  return (
    <Component className={rootClassName} {...(rest as React.HTMLAttributes<HTMLElement>)}>
      <HeroImage
        variant={heroVariant}
        state={illustrationState ?? DEFAULT_HERO_STATE}
        alt={illustrationAltText}
      />
      {shouldRenderGlitchStyles ? <HeroGlitchStyles /> : null}
      {frame || isRaisedBar ? <NeomorphicFrameStyles /> : null}

      <div className={classes.shell}>
        <div className={cn(classes.bar, barClassName)}>
          <div className={classes.labelCluster}>
            {isRaisedBar ? (
              <div className={classes.raisedLabelBar}>
                {iconNode}
                {headingContent}
              </div>
            ) : (
              <>
                {iconNode}
                {headingContent}
              </>
            )}
          </div>

          {subTabsNode ? <div className={classes.utilities}>{subTabsNode}</div> : null}
        </div>

        {children || searchProps || actions ? (
          <div className={classes.body}>
            {children ? <div className={cn(bodyClassName)}>{children}</div> : null}
            {searchProps || actions ? (
              <div
                className={cn("relative", classes.divider)}
                data-divider-tint={dividerTint}
              >
                <span aria-hidden className={classes.dividerLine} />
                {showDividerGlow ? (
                  <span aria-hidden className={classes.dividerGlow} />
                ) : null}
                <div className={classes.actionRow}>
                  {searchProps ? (
                    <div className={classes.searchWell}>
                      <HeroSearchBar {...searchProps} />
                    </div>
                  ) : null}
                  {actions ? (
                    <div className={classes.actionsWell}>
                      <div className={classes.actionCluster}>{actions}</div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {frame ? (
          <div
            aria-hidden
            className="absolute inset-0 rounded-card r-card-lg ring-1 ring-inset ring-border/55"
          />
        ) : null}
      </div>
    </Component>
  );
}

export default Hero;

