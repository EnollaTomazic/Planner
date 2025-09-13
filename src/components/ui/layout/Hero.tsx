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
import SegmentedButtons, {
  type TabBarProps,
  type TabItem,
} from "@/components/ui/SegmentedButtons";
import type { HeaderTabsProps } from "@/components/ui/layout/Header";
import SearchBar, {
  type SearchBarProps,
} from "@/components/ui/primitives/SearchBar";
import { NeomorphicFrameStyles } from "./NeomorphicFrameStyles";

function cx(...p: Array<string | false | null | undefined>) {
  return p.filter(Boolean).join(" ");
}

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

  /** Whether to include glitchy frame and background layers. */
  frame?: boolean;

  /** Divider tint for neon line. */
  dividerTint?: "primary" | "life";

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
  frame = true,
  sticky = true,
  topClassName = "top-8",
  barClassName,
  bodyClassName,
  rail = true,
  dividerTint = "primary",
  subTabs,
  tabs,
  search,
  className,
  ...rest
}: HeroProps<Key>) {
  const headingStr = typeof heading === "string" ? heading : undefined;
  const dividerStyle = {
    "--divider": dividerTint === "life" ? "var(--accent)" : "var(--ring)",
  } as React.CSSProperties;

  // Compose right area: prefer built-in sub-tabs if provided.
  const subTabsNode = subTabs ? (
    <SegmentedButtons
      items={subTabs.items.map((t) => ({
        key: t.key,
        label: t.label,
        icon: t.icon,
      }))}
      value={String(subTabs.value)}
      onValueChange={(k) => subTabs.onChange(k as Key)}
      size={subTabs.size ?? "md"}
      align={subTabs.align ?? "end"}
      right={subTabs.right}
      showBaseline={subTabs.showBaseline ?? true}
      className={cx("justify-end", subTabs.className)}
      ariaLabel={subTabs.ariaLabel ?? "Hero sub-tabs"}
    />
  ) : tabs ? (
    <SegmentedButtons
      items={tabs.items}
      value={tabs.value}
      onValueChange={tabs.onChange}
      size={tabs.size ?? "md"}
      align={tabs.align ?? "end"}
      showBaseline={tabs.showBaseline ?? true}
      className={cx("justify-end", tabs.className)}
      ariaLabel="Hero tabs"
    />
  ) : null;

  return (
    <section className={className} {...rest}>
      <HeroGlitchStyles />
      <NeomorphicFrameStyles />

      <div
        className={cx(
          sticky ? "sticky-blur" : "",
          frame
            ? "relative overflow-hidden rounded-2xl border border-[hsl(var(--border))/0.4] px-6 md:px-7 lg:px-8 hero2-neomorph"
            : "",
          sticky && topClassName,
        )}
      >
        {frame ? (
          <>
            <span aria-hidden className="hero2-beams" />
            <span aria-hidden className="hero2-scanlines" />
            <span aria-hidden className="hero2-noise opacity-[0.03]" />
          </>
        ) : null}

        <div
          className={cx(
            "relative z-[2] flex items-center gap-3 md:gap-4 lg:gap-6 py-6",
            barClassName,
          )}
        >
          {rail ? <span aria-hidden className="rail" /> : null}
          {icon ? (
            <div className="opacity-70 hover:opacity-100 focus-visible:opacity-100 transition-opacity">
              {icon}
            </div>
          ) : null}

          <div className="min-w-0">
            {eyebrow ? (
              <div className="text-xs font-semibold tracking-[0.02em] uppercase text-muted-foreground">
                {eyebrow}
              </div>
            ) : null}

            <div className="flex items-baseline gap-2">
              <h2
                className="hero2-title title-glow text-2xl md:text-3xl font-semibold tracking-[-0.005em] truncate"
                data-text={headingStr}
              >
                {heading}
              </h2>
              {subtitle ? (
                <span className="text-sm md:text-base font-medium text-[hsl(var(--muted-foreground))] truncate">
                  {subtitle}
                </span>
              ) : null}
            </div>
          </div>

          {subTabsNode ? <div className="ml-auto">{subTabsNode}</div> : null}
        </div>

        {children || search || actions ? (
          <div className="relative z-[2] mt-5 flex flex-col gap-5">
            {children ? (
              <div className={cx(bodyClassName)}>{children}</div>
            ) : null}
            {search || actions ? (
              <div className="relative" style={dividerStyle}>
                <span
                  aria-hidden
                  className="block h-px bg-[hsl(var(--divider))/0.35]"
                />
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px blur-[6px] opacity-60 bg-[hsl(var(--divider))]"
                />
                <div className="flex items-center gap-3 md:gap-4 lg:gap-6 pt-4">
                  {search ? <HeroSearchBar {...search} /> : null}
                  {actions ? (
                    <div className="flex items-center gap-2">{actions}</div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {frame ? (
          <div
            aria-hidden
            className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-border/55"
          />
        ) : null}
      </div>
    </section>
  );
}

export default Hero;

/* ───────────── Adapter: HeroTabs (kept for parity) ───────── */
export type HeroTab<K extends string> = {
  key: K;
  label: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: React.ReactNode;
};
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
  } = props;

  const items: TabItem[] = React.useMemo(
    () =>
      tabs.map((t) => ({
        key: String(t.key),
        label: t.label,
        icon: t.icon,
        disabled: t.disabled,
        badge: t.badge,
      })),
    [tabs],
  );

  return (
    <SegmentedButtons
      items={items}
      value={String(activeKey)}
      onValueChange={(k) => onChange(k as K)}
      align={align}
      size={size}
      right={right}
      ariaLabel={ariaLabel}
      className={className}
      showBaseline={showBaseline}
    />
  );
}

/* ───────────── Reusable: Search inside Hero divider ───────── */
export function HeroSearchBar({
  className,
  round,
  ...props
}: SearchBarProps & { className?: string; round?: boolean }) {
  return (
    <SearchBar
      {...props}
      className={cx(
        "w-full max-w-[calc(var(--space-8)*10)]",
        round && "rounded-full",
        className,
      )}
      fieldClassName={round ? "rounded-full [&>input]:rounded-full" : undefined}
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
