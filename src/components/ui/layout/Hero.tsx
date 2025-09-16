// src/components/ui/layout/Hero.tsx
"use client";

/**
 * Hero — HUD-glitch banner with sub-tabs and a neon search row.
 *
 * Layout highlights:
 *   • Sticky header-style bar with optional sub-tabs matching `Header` segments
 *   • Neon divider that hosts a pill search bar and optional actions
 *   • Animated beams, scanlines, and noise create the glitchy HUD effect
 */

import * as React from "react";
import TabBar, { type TabBarProps, type TabItem } from "./TabBar";
import type { HeaderTabsProps } from "@/components/ui/layout/Header";
import SearchBar, {
  type SearchBarProps,
} from "@/components/ui/primitives/SearchBar";
import { NeomorphicFrameStyles } from "./NeomorphicFrameStyles";

function cx(...p: Array<string | false | null | undefined>) {
  return p.filter(Boolean).join(" ");
}

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
  sticky?: boolean;
  topClassName?: string;
  barClassName?: string;
  bodyClassName?: string;
  rail?: boolean;
  /** Typography profile for the heading/subtitle. */
  tone?: "heroic" | "supportive";

  /** Whether to include glitchy frame and background layers. */
  frame?: boolean;

  /** Divider tint for neon line. */
  dividerTint?: "primary" | "life";

  /** Semantic wrapper element (defaults to `section`). */
  as?: HeroElement;

  /** Built-in top-right sub-tabs (preferred). */
  subTabs?: HeaderTabsProps<Key> & {
    size?: TabBarProps["size"];
    align?: TabBarProps["align"];
    className?: string;
    showBaseline?: boolean;
    right?: React.ReactNode;
  };

  /** @deprecated Use `subTabs` instead. */
  tabs?: {
    items: TabItem[];
    value: string;
    onChange: (k: string) => void;
    size?: TabBarProps["size"];
    align?: TabBarProps["align"];
    className?: string;
    showBaseline?: boolean;
    variant?: TabBarProps["variant"];
    linkPanels?: boolean;
  };

  /** Built-in bottom search (preferred). `round` makes it pill. */
  search?: (SearchBarProps & { round?: boolean }) | null;
}

function Hero<Key extends string = string>({
  eyebrow,
  heading,
  subtitle,
  icon,
  children,
  actions,
  tone = "heroic",
  frame = true,
  sticky = true,
  topClassName = "top-[var(--space-8)]",
  barClassName,
  bodyClassName,
  rail = true,
  dividerTint = "primary",
  subTabs,
  tabs,
  search,
  className,
  as,
  ...rest
}: HeroProps<Key>) {
  const headingStr = typeof heading === "string" ? heading : undefined;
  const dividerStyle = {
    "--divider": dividerTint === "life" ? "var(--accent)" : "var(--ring)",
  } as React.CSSProperties;

  const heroVariant: TabBarProps["variant"] | undefined = frame
    ? "neo"
    : undefined;

  const Component: HeroElement = as ?? "section";

  const isSupportiveTone = tone === "supportive";

  const stickyClasses = sticky
    ? cx("sticky sticky-blur", topClassName)
    : "";

  const shellClass = cx(
    stickyClasses,
    frame
      ? "relative overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))/0.4] px-[var(--space-6)] hero2-frame hero2-neomorph"
      : "px-[var(--space-3)] sm:px-[var(--space-4)] lg:px-[var(--space-5)]",
  );

  const barSpacingClass = frame
    ? "relative z-[2] flex items-center gap-[var(--space-3)] md:gap-[var(--space-4)] lg:gap-[var(--space-6)] py-[var(--space-6)]"
    : "relative z-[2] flex items-center gap-[var(--space-2)] md:gap-[var(--space-3)] lg:gap-[var(--space-4)] py-[var(--space-4)]";

  const bodySpacingClass = frame
    ? "relative z-[2] mt-[var(--space-5)] md:mt-[var(--space-6)] flex flex-col gap-[var(--space-5)] md:gap-[var(--space-6)]"
    : "relative z-[2] mt-[var(--space-4)] md:mt-[var(--space-5)] flex flex-col gap-[var(--space-4)] md:gap-[var(--space-5)]";

  const actionRowClass = frame
    ? "flex items-center gap-[var(--space-3)] md:gap-[var(--space-4)] lg:gap-[var(--space-6)] pt-[var(--space-5)] md:pt-[var(--space-6)]"
    : "flex flex-wrap items-center gap-[var(--space-2)] md:flex-nowrap md:gap-[var(--space-3)] lg:gap-[var(--space-4)] pt-[var(--space-4)] md:pt-[var(--space-5)]";

  const headingClassName = cx(
    "title-glow font-semibold tracking-[-0.01em] text-balance break-words",
    frame ? "hero2-title" : undefined,
    isSupportiveTone
      ? "text-title md:text-title"
      : "text-title-lg md:text-title-lg",
  );

  const subtitleClassName = cx(
    "text-ui md:text-body text-muted-foreground break-words",
    isSupportiveTone ? "font-normal" : "font-medium",
  );

  // Compose right area: prefer built-in sub-tabs if provided.
  const subTabsNode = subTabs ? (
    <TabBar
      items={subTabs.items.map(({ hint, ...item }) => {
        void hint;
        return item;
      })}
      value={String(subTabs.value)}
      onValueChange={(k) => subTabs.onChange(k as Key)}
      size={subTabs.size ?? "md"}
      align={subTabs.align ?? "end"}
      right={subTabs.right}
      showBaseline={subTabs.showBaseline ?? true}
      variant={subTabs.variant ?? heroVariant}
      className={cx("justify-end", subTabs.className)}
      ariaLabel={subTabs.ariaLabel ?? "Hero sub-tabs"}
      linkPanels={subTabs.linkPanels}
    />
  ) : tabs ? (
    <TabBar
      items={tabs.items}
      value={tabs.value}
      onValueChange={tabs.onChange}
      size={tabs.size ?? "md"}
      align={tabs.align ?? "end"}
      showBaseline={tabs.showBaseline ?? true}
      variant={tabs.variant ?? heroVariant}
      className={cx("justify-end", tabs.className)}
      ariaLabel="Hero tabs"
      linkPanels={tabs.linkPanels}
    />
  ) : null;

  const searchProps =
    search != null
      ? {
          ...search,
          round: search.round ?? true,
          variant: search.variant ?? heroVariant,
        }
      : search;

  return (
    <Component className={className} {...(rest as React.HTMLAttributes<HTMLElement>)}>
      {frame ? <HeroGlitchStyles /> : null}
      {frame ? <NeomorphicFrameStyles /> : null}

      <div className={shellClass}>
        {frame ? (
          <>
            <span aria-hidden className="hero2-beams" />
            <span aria-hidden className="hero2-scanlines" />
            <span aria-hidden className="hero2-noise opacity-[0.03]" />
          </>
        ) : null}

        <div className={cx(barSpacingClass, barClassName)}>
          {rail ? <span aria-hidden className="rail" /> : null}
          {icon ? (
            <div className="opacity-70 hover:opacity-100 focus-visible:opacity-100 transition-opacity">
              {icon}
            </div>
          ) : null}

          <div className="min-w-0">
            {eyebrow ? (
              <div className="text-label font-semibold tracking-[0.02em] uppercase text-muted-foreground">
                {eyebrow}
              </div>
            ) : null}

            <div className="flex min-w-0 flex-wrap items-baseline gap-x-[var(--space-2)] gap-y-[var(--space-1)]">
              <h2 className={headingClassName} data-text={headingStr}>
                {heading}
              </h2>
              {subtitle ? (
                <span className={subtitleClassName}>{subtitle}</span>
              ) : null}
            </div>
          </div>

          {subTabsNode ? (
            <div className="ml-auto self-start">{subTabsNode}</div>
          ) : null}
        </div>

        {children || searchProps || actions ? (
          <div className={bodySpacingClass}>
            {children ? (
              <div className={cx(bodyClassName)}>{children}</div>
            ) : null}
            {searchProps || actions ? (
              <div className="relative" style={dividerStyle}>
                <span
                  aria-hidden
                  className={cx(
                    "block h-px",
                    frame
                      ? "hero2-divider-line bg-[hsl(var(--divider))/0.35]"
                      : "bg-[hsl(var(--divider))/0.28]",
                  )}
                />
                {frame ? (
                  <span
                    aria-hidden
                    className="hero2-divider-glow absolute inset-x-0 top-0 h-px blur-[6px] opacity-60 bg-[hsl(var(--divider))]"
                  />
                ) : null}
                <div className={actionRowClass}>
                  {searchProps ? <HeroSearchBar {...searchProps} /> : null}
                  {actions ? (
                    <div className="flex items-center gap-[var(--space-2)]">{actions}</div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {frame ? (
          <div
            aria-hidden
            className="absolute inset-0 rounded-[var(--radius-2xl)] ring-1 ring-inset ring-border/55"
          />
        ) : null}
      </div>
    </Component>
  );
}

export default Hero;

/* ───────────── Adapter: HeroTabs (kept for parity) ───────── */
export interface HeroTab<K extends string> extends TabItem<K> {
  hint?: string;
}
export function HeroTabs<K extends string>(props: {
  tabs: Array<HeroTab<K>>;
  activeKey: K;
  onChange: (k: K) => void;
  ariaLabel?: string;
  className?: string;
  align?: TabBarProps["align"];
  size?: TabBarProps["size"];
  right?: React.ReactNode;
  showBaseline?: boolean;
  variant?: TabBarProps["variant"];
  linkPanels?: boolean;
}) {
  const {
    tabs,
    activeKey,
    onChange,
    ariaLabel,
    className,
    align = "end",
    size = "md",
    right,
    showBaseline = false,
    variant,
    linkPanels = false,
  } = props;

  const items: TabItem[] = React.useMemo(
    () =>
      tabs.map(({ key, hint, ...rest }) => {
        void hint;
        return {
          ...rest,
          key: String(key),
        };
      }),
    [tabs],
  );

  return (
    <TabBar
      items={items}
      value={String(activeKey)}
      onValueChange={(k) => onChange(k as K)}
      align={align}
      size={size}
      right={right}
      ariaLabel={ariaLabel}
      className={className}
      showBaseline={showBaseline}
      variant={variant}
      linkPanels={linkPanels}
    />
  );
}

/* ───────────── Reusable: Search inside Hero divider ───────── */
export function HeroSearchBar({
  className,
  round,
  variant,
  fieldClassName,
  ...props
}: SearchBarProps & { className?: string; round?: boolean }) {
  const resolvedVariant = variant ?? (round ? "neo" : undefined);
  const isNeo = resolvedVariant === "neo";

  return (
    <SearchBar
      {...props}
      variant={resolvedVariant}
      className={cx(
        "w-full max-w-[calc(var(--space-8)*10)]",
        round && "rounded-full",
        className,
      )}
      fieldClassName={cx(
        round && "rounded-full [&>input]:rounded-full",
        isNeo && "overflow-hidden hero2-frame",
        fieldClassName,
      )}
    />
  );
}

/* ───────────── CSS injected globally via styled-jsx (unchanged) ─────────── */
export function HeroGlitchStyles() {
  return (
    <style jsx global>{`
      /* === Glitch title ================================================== */
      .hero2-title {
        position: relative;
        text-shadow:
          -0.02em 0 hsl(var(--accent-2) / 0.65),
          0.02em 0 hsl(var(--lav-deep) / 0.65),
          0 0 0.25em hsl(var(--foreground) / 0.35);
      }
      .hero2-title::before,
      .hero2-title::after {
        content: attr(data-text);
        position: absolute;
        inset: 0;
        pointer-events: none;
        clip-path: inset(0 0 0 0);
        opacity: 0.75;
      }
      .hero2-title::before {
        transform: translate(
          calc(var(--hairline-w) / 2),
          calc(-1 * var(--hairline-w) / 2)
        );
        color: hsl(var(--accent-2) / 0.85);
        mix-blend-mode: screen;
        animation: hero2-glitch-a 2.4s infinite steps(8, end);
      }
      .hero2-title::after {
        transform: translate(
          calc(-1 * var(--hairline-w) / 2),
          calc(var(--hairline-w) / 2)
        );
        color: hsl(var(--lav-deep) / 0.85);
        mix-blend-mode: screen;
        animation: hero2-glitch-b 2.4s infinite steps(9, end);
      }
      @keyframes hero2-glitch-a {
        0% {
          clip-path: inset(0);
        }
        10% {
          clip-path: inset(0 0 8% 0);
        }
        20% {
          clip-path: inset(60% 0 0 0);
        }
        40% {
          clip-path: inset(30% 0 40% 0);
        }
        80% {
          clip-path: inset(10% 0 70% 0);
        }
        100% {
          clip-path: inset(0);
        }
      }
      @keyframes hero2-glitch-b {
        0% {
          clip-path: inset(0);
        }
        15% {
          clip-path: inset(70% 0 10% 0);
        }
        55% {
          clip-path: inset(0 0 60% 0);
        }
        95% {
          clip-path: inset(20% 0 30% 0);
        }
        100% {
          clip-path: inset(0);
        }
      }

      /* === HUD Tabs container (legacy hook, optional) ==================== */
      .tabs-hud {
        background: transparent;
        box-shadow: none;
      }

      /* === Neon divider (unchanged) ===================================== */
      .neon-primary {
        --neon: var(--primary);
      }
      .neon-life {
        --neon: var(--accent);
      }
      @media (prefers-contrast: more) {
        .hero2-divider-line {
          background-color: hsl(var(--foreground)) !important;
          opacity: 0.85 !important;
        }
        .hero2-divider-glow {
          background-color: hsl(var(--foreground)) !important;
          opacity: 0.9 !important;
          filter: none !important;
        }
      }
      @media (forced-colors: active) {
        .hero2-divider-line {
          background-color: CanvasText !important;
          opacity: 1 !important;
        }
        .hero2-divider-glow {
          display: none !important;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .hero2-title::before,
        .hero2-title::after {
          animation: none !important;
          transition: none !important;
        }
      }
    `}</style>
  );
}
