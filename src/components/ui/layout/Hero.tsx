// src/components/ui/layout/Hero.tsx
"use client";

import * as React from "react";
import {
  TabBar,
  type TabBarA11yProps,
  type TabBarProps,
  type TabItem,
} from "./TabBar";
import type { HeaderTabsProps } from "@/components/ui/layout/Header";
import { cn } from "@/lib/utils";
import { NeomorphicFrameStyles } from "./NeomorphicFrameStyles";
import { HeroGlitchStyles } from "./hero/HeroGlitchStyles";
import { HeroImage, type HeroImageProps } from "./hero/HeroImage";
import { HeroSearchBar, type HeroSearchBarProps } from "./hero/HeroSearchBar";
import { useHeroStyles } from "./hero/useHeroStyles";
import styles from "./hero/Hero.module.css";

type HeroElement = Extract<
  keyof React.JSX.IntrinsicElements,
  "header" | "section" | "article" | "aside" | "div" | "main" | "nav"
>;

export type HeroTab<K extends string = string> = TabItem<K> & { hint?: string };

export type HeroTabsProps<K extends string = string> = TabBarA11yProps & {
  items: Array<HeroTab<K>>;
  value: K;
  onChange: (key: K) => void;
  className?: string;
  align?: TabBarProps["align"];
  size?: TabBarProps["size"];
  right?: React.ReactNode;
  showBaseline?: boolean;
  variant?: TabBarProps["variant"];
  linkPanels?: boolean;
  idBase?: string;
};

type HeroSearchConfig = (HeroSearchBarProps & { round?: boolean }) | null;

type HeroTabsLike<Key extends string> =
  | (HeroTabsProps<Key> & { legacy?: false })
  | (HeaderTabsProps<Key> & { legacy?: true });

export interface HeroProps<Key extends string = string>
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  /** @deprecated Use `title` instead. */
  heading?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  sticky?: boolean;
  topClassName?: string;
  barClassName?: string;
  bodyClassName?: string;
  /** Visual treatment for the label cluster bar. */
  barVariant?: "flat" | "raised";
  /** Typography profile for the heading/subtitle. */
  tone?: "heroic" | "supportive";
  /** Whether to include glitchy frame and background layers. */
  frame?: boolean;
  /** Level of glitch treatment for frame overlays (defaults to `default`). */
  glitch?: "default" | "subtle" | "off";
  /** Divider tint for neon line. */
  dividerTint?: "primary" | "life";
  /** Semantic wrapper element (defaults to `section`). */
  as?: HeroElement;
  /** Horizontal padding for the outer shell. */
  padding?: "default" | "none";
  /** @deprecated Decorative rails were removed. */
  rail?: boolean;
  /** Built-in top-right segmented tabs (preferred). */
  tabs?: HeroTabsProps<Key>;
  /** Secondary segmented control support. */
  subTabs?: HeaderTabsProps<Key>;
  /** Built-in bottom search (preferred). `round` makes it pill. */
  searchBar?: HeroSearchConfig;
  /** @deprecated Use `searchBar` instead. */
  search?: HeroSearchConfig;
  /** Optional illustration rendered inside the hero frame. */
  illustration?: React.ReactNode;
  /** Visual state for the default hero illustration background. */
  illustrationState?: HeroImageProps["state"];
  /** Custom alt text for the hero illustration background. */
  illustrationAlt?: string;
}

function mapTabs<Key extends string>(
  config: HeroTabsLike<Key> | undefined,
  heroVariant: TabBarProps["variant"] | undefined,
): React.ReactNode {
  if (!config) {
    return null;
  }

  const {
    legacy,
    align,
    size,
    right,
    showBaseline,
    variant,
    className,
    items: heroItems,
    value,
    onChange,
    ariaLabel,
    ariaLabelledBy,
    linkPanels,
    idBase,
  } = config as HeroTabsProps<Key> & { legacy?: boolean };

  const items = (legacy
    ? (config as HeaderTabsProps<Key>).items
    : heroItems
  ).map(
    ({ hint, ...item }) => {
      void hint;
      return { ...item, key: String(item.key ?? item.label) };
    },
  );

  const resolvedValue = legacy
    ? String((config as HeaderTabsProps<Key>).value)
    : String(value);

  const handleChange = (key: string) => {
    if (legacy) {
      (config as HeaderTabsProps<Key>).onChange(key as Key);
      return;
    }
    onChange(key as Key);
  };

  const sanitizedLabel =
    typeof ariaLabel === "string" && ariaLabel.trim().length > 0
      ? ariaLabel.trim()
      : undefined;
  const sanitizedLabelledBy =
    typeof ariaLabelledBy === "string" && ariaLabelledBy.trim().length > 0
      ? ariaLabelledBy.trim()
      : undefined;

  const accessibilityProps: TabBarA11yProps = sanitizedLabelledBy
    ? {
        ariaLabelledBy: sanitizedLabelledBy,
        ...(sanitizedLabel ? { ariaLabel: sanitizedLabel } : {}),
      }
    : {
        ariaLabel: sanitizedLabel ?? "Hero tabs",
      };

  return (
    <TabBar
      items={items}
      value={resolvedValue}
      onValueChange={handleChange}
      size={size ?? "md"}
      align={align ?? "end"}
      right={right}
      showBaseline={showBaseline ?? true}
      variant={variant ?? heroVariant}
      className={cn("justify-end", className)}
      {...accessibilityProps}
      linkPanels={linkPanels}
      idBase={idBase}
    />
  );
}

function Hero<Key extends string = string>({
  eyebrow,
  title,
  heading,
  subtitle,
  icon,
  children,
  actions,
  tone = "heroic",
  frame = true,
  glitch = "default",
  sticky = true,
  topClassName = "top-[var(--space-8)]",
  barClassName,
  bodyClassName,
  barVariant = "flat",
  dividerTint = "primary",
  tabs,
  subTabs,
  searchBar,
  search,
  illustration,
  illustrationState,
  illustrationAlt,
  className,
  as,
  padding = "default",
  rail: _deprecatedRail,
  ...rest
}: HeroProps<Key>) {
  void _deprecatedRail;
  const heroHeading = title ?? heading;
  const headingStr =
    typeof heroHeading === "string" ? heroHeading : undefined;
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

  const headingContent = heroHeading ? (
    <div className="min-w-0">
      {eyebrow ? (
        <div className="text-label font-semibold tracking-[0.02em] uppercase text-muted-foreground">
          {eyebrow}
        </div>
      ) : null}

      <div className="flex min-w-0 flex-wrap items-baseline gap-x-[var(--space-2)] gap-y-[var(--space-1)]">
        <h2 className={classes.heading} data-text={headingStr}>
          {heroHeading}
        </h2>
        {subtitle ? <span className={classes.subtitle}>{subtitle}</span> : null}
      </div>
    </div>
  ) : null;

  const tabsNode = React.useMemo(
    () =>
      mapTabs<Key>(
        subTabs
          ? ({ ...subTabs, legacy: true } as HeroTabsLike<Key>)
          : tabs
            ? ({ ...tabs, legacy: false } as HeroTabsLike<Key>)
            : undefined,
        heroVariant,
      ),
    [heroVariant, subTabs, tabs],
  );

  const searchConfig = searchBar ?? search ?? null;

  const searchProps =
    searchConfig != null
      ? {
          ...searchConfig,
          round: searchConfig.round ?? true,
          variant: searchConfig.variant ?? heroVariant,
        }
      : searchConfig;

  const heroIllustrationAlt = React.useMemo(() => {
    if (typeof illustrationAlt === "string") {
      const trimmed = illustrationAlt.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
    if (typeof headingStr === "string" && headingStr.trim().length > 0) {
      return `${headingStr.trim()} hero illustration`;
    }
    return undefined;
  }, [illustrationAlt, headingStr]);

  const illustrationNode = frame
    ? illustration ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]",
            "after:pointer-events-none after:absolute after:inset-0 after:z-[1] after:content-[''] after:bg-glitch-overlay after:opacity-30 after:mix-blend-soft-light",
          )}
        >
          <div className="absolute inset-0">
            <div className="relative h-full w-full">{illustration}</div>
          </div>
        </div>
      ) : (
        <HeroImage
          state={illustrationState}
          alt={heroIllustrationAlt}
          className={cn(
            "z-0 rounded-[inherit]",
            "after:pointer-events-none after:absolute after:inset-0 after:z-[1] after:content-[''] after:bg-glitch-overlay after:opacity-30 after:mix-blend-soft-light",
          )}
        />
      )
    : null;

  return (
    <Component className={className} {...(rest as React.HTMLAttributes<HTMLElement>)}>
      {shouldRenderGlitchStyles ? <HeroGlitchStyles /> : null}
      {frame || isRaisedBar ? <NeomorphicFrameStyles /> : null}

      <div className={classes.shell}>
        {illustrationNode}
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

          {tabsNode ? <div className={classes.utilities}>{tabsNode}</div> : null}
        </div>

        {children || searchProps || actions ? (
          <div className={classes.body}>
            {children ? <div className={cn(bodyClassName)}>{children}</div> : null}
            {searchProps || actions ? (
              <div
                className={cn(
                  "relative",
                  classes.divider,
                  frame &&
                    "before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:rounded-[inherit] before:content-[''] before:bg-glitch-overlay before:opacity-30 before:mix-blend-soft-light",
                )}
                data-divider-tint={dividerTint}
              >
                <span aria-hidden className={cn(classes.dividerLine, styles.dividerLine)} />
                {showDividerGlow ? (
                  <span aria-hidden className={cn(classes.dividerGlow, styles.dividerGlow)} />
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

export { Hero };
