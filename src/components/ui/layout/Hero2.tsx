// src/components/ui/layout/Hero2.tsx
"use client";

/**
 * Hero2 — HUD-glitch header with smooth tab slider transitions.
 * Default layout (if props provided):
 *   • Tabs in the top-right (align="end")
 *   • Pill search inside the neon bottom row
 * Backward compatible with `right` and `bottom`.
 */

import * as React from "react";
import TabBar, { type TabBarProps, type TabItem } from "@/components/ui/layout/TabBar";
import SearchBar, { type SearchBarProps } from "@/components/ui/primitives/SearchBar";

function cx(...p: Array<string | false | null | undefined>) {
  return p.filter(Boolean).join(" ");
}

export interface Hero2Props
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: React.ReactNode;
  heading: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;

  /** Right slot (legacy). Ignored if `tabs` is provided. */
  right?: React.ReactNode;

  children?: React.ReactNode;
  sticky?: boolean;
  topClassName?: string;
  barClassName?: string;
  bodyClassName?: string;
  rail?: boolean;

  /** Bottom slot (legacy). Ignored if `search` is provided. */
  bottom?: React.ReactNode;

  /** Divider tint for neon line. */
  dividerTint?: "primary" | "life";

  /** Built-in top-right tabs (preferred). */
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

export default function Hero2({
  eyebrow,
  heading,
  subtitle,
  icon,
  right,
  children,
  sticky = true,
  topClassName,
  barClassName,
  bodyClassName,
  rail = true,
  bottom,
  dividerTint = "primary",
  tabs,
  search,
  className,
  ...rest
}: Hero2Props) {
  const headingStr = typeof heading === "string" ? heading : undefined;

  // Compose right area: prefer built-in tabs if provided.
  const rightNode = tabs ? (
    <TabBar
      items={tabs.items}
      value={tabs.value}
      onValueChange={tabs.onChange}
      size={tabs.size ?? "md"}
      align={tabs.align ?? "end"}
      showBaseline={tabs.showBaseline ?? true}
      className={cx("justify-end", tabs.className)}
      ariaLabel="Hero tabs"
    />
  ) : (
    right
  );

  // Compose bottom area: prefer built-in search if provided.
  const bottomNode = search ? <Hero2SearchBar {...search} /> : bottom;

  return (
    <section className={cx("grid gap-3", className)} {...rest}>
      <Hero2GlitchStyles />

      <div
        className={cx(
          sticky ? "sticky-blur" : "",
          "hero2-frame relative overflow-hidden rounded-2xl px-4 sm:px-5 py-4",
          topClassName
        )}
      >
        {/* decorative layers */}
        <span aria-hidden className="hero2-beams" />
        <span aria-hidden className="hero2-scanlines" />
        <span aria-hidden className="hero2-noise" />

        <div className={cx("relative z-[2] flex items-center gap-3", barClassName)}>
          {rail ? <span aria-hidden className="rail" /> : null}
          {icon ? <div className="opacity-90">{icon}</div> : null}

          <div className="min-w-0">
            {eyebrow ? (
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[hsl(var(--muted-foreground))]">
                {eyebrow}
              </div>
            ) : null}

            <div className="flex items-baseline gap-2">
              <h2
                className="hero2-title title-glow text-xl sm:text-2xl truncate"
                data-text={headingStr}
              >
                {heading}
              </h2>
              {subtitle ? (
                <span className="text-xs sm:text-sm tracking-wide text-[hsl(var(--muted-foreground))] truncate">
                  {subtitle}
                </span>
              ) : null}
            </div>
          </div>

          <div className="ml-auto">{rightNode}</div>
        </div>

        {children ? (
          <div className={cx("relative z-[2] mt-3", bodyClassName)}>{children}</div>
        ) : null}

        {/* Neon divider + bottom slot (e.g., search) */}
        {bottomNode ? (
          <div
            className={cx(
              "relative z-[2] hero2-sep mt-3",
              dividerTint === "life" ? "neon-life" : "neon-primary"
            )}
          >
            <span aria-hidden className="hero2-neon-line" />
            <div className="hero2-sep-row">{bottomNode}</div>
          </div>
        ) : null}

        {/* subtle rim */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-[hsl(var(--border)/0.55)]"
        />
      </div>
    </section>
  );
}

/* ───────────── Adapter: Hero2Tabs (kept for parity) ───────── */
export type Hero2Tab<K extends string> = {
  key: K;
  label: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: React.ReactNode;
};
export function Hero2Tabs<K extends string>(props: {
  tabs: Array<Hero2Tab<K>>;
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
      tabs.map(t => ({
        key: String(t.key),
        label: t.label,
        icon: t.icon,
        disabled: t.disabled,
        badge: t.badge,
      })),
    [tabs]
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
    />
  );
}

/* ───────────── Reusable: Search inside Hero2 divider ───────── */
export function Hero2SearchBar({
  className,
  round,
  ...props
}: SearchBarProps & { className?: string; round?: boolean }) {
  return (
    <SearchBar
      {...props}
      className={cx(
        "w-full max-w-[640px]",
        round && "rounded-full [&>input]:rounded-full",
        className
      )}
    />
  );
}

/* ───────────── CSS injected globally via styled-jsx (unchanged) ─────────── */
export function Hero2GlitchStyles() {
  return (
    <style jsx global>{`
      /* === Hero2: header background layers =============================== */
      .hero2-frame {
        --hero2-c1: hsl(var(--accent));
        --hero2-c2: hsl(var(--primary));
        --hero2-bloom: hsl(var(--shadow-color) / 0.85);
        box-shadow: 0 10px 40px -18px var(--hero2-bloom),
          inset 0 0 0 1px hsl(var(--border) / 0.55);
        background: radial-gradient(120% 120% at 0% 0%, hsl(var(--accent) / 0.14) 0%, transparent 55%),
          radial-gradient(120% 120% at 100% 0%, hsl(var(--primary) / 0.12) 0%, transparent 55%),
          linear-gradient(0deg, hsl(var(--card) / 0.82), hsl(var(--card) / 0.82));
      }
      .hero2-beams {
        position: absolute;
        inset: -2px;
        border-radius: var(--radius-2xl, 24px);
        z-index: 0;
        pointer-events: none;
        background: linear-gradient(100deg, transparent 0%, hsl(var(--primary) / 0.18) 10%, transparent 22%) 0 0/100% 100%,
          linear-gradient(260deg, transparent 0%, hsl(var(--accent) / 0.2) 8%, transparent 20%) 0 0/100% 100%;
        mix-blend-mode: screen;
        animation: hero2-beam-pan 7s linear infinite;
      }
      @keyframes hero2-beam-pan {
        0% { transform: translateX(-3%); }
        50% { transform: translateX(3%); }
        100% { transform: translateX(-3%); }
      }
      .hero2-scanlines {
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        background: linear-gradient(transparent 94%, hsl(var(--foreground) / 0.5) 96%, transparent 98%),
          linear-gradient(90deg, transparent 94%, hsl(var(--foreground) / 0.4) 96%, transparent 98%);
        background-size: 100% 14px, 14px 100%;
        opacity: 0.07;
        animation: hero2-scan-move 6s linear infinite;
      }
      @keyframes hero2-scan-move {
        0% { background-position: 0 0, 0 0; }
        100% { background-position: 0 14px, 14px 0; }
      }
      .hero2-noise {
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        opacity: 0.08;
        mix-blend-mode: overlay;
        background-image: url("data:image/svg+xml;utf8,\
        <svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'>\
          <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter>\
          <rect width='100%' height='100%' filter='url(%23n)' opacity='0.38'/></svg>");
        background-size: 280px 280px;
        animation: hero2-noise-shift 1.8s steps(2, end) infinite;
      }
      @keyframes hero2-noise-shift { 50% { background-position: 50% 50%; } }

      /* === Glitch title ================================================== */
      .hero2-title {
        position: relative;
        text-shadow: -0.02em 0 rgba(59, 237, 255, 0.65), 0.02em 0 rgba(255, 77, 210, 0.65),
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
        transform: translate(0.5px, -0.5px);
        color: rgba(59, 237, 255, 0.85);
        mix-blend-mode: screen;
        animation: hero2-glitch-a 2.4s infinite steps(8, end);
      }
      .hero2-title::after {
        transform: translate(-0.5px, 0.5px);
        color: rgba(255, 77, 210, 0.85);
        mix-blend-mode: screen;
        animation: hero2-glitch-b 2.4s infinite steps(9, end);
      }
      @keyframes hero2-glitch-a {
        0% { clip-path: inset(0); }
        10% { clip-path: inset(0 0 8% 0); }
        20% { clip-path: inset(60% 0 0 0); }
        40% { clip-path: inset(30% 0 40% 0); }
        80% { clip-path: inset(10% 0 70% 0); }
        100% { clip-path: inset(0); }
      }
      @keyframes hero2-glitch-b {
        0% { clip-path: inset(0); }
        15% { clip-path: inset(70% 0 10% 0); }
        55% { clip-path: inset(0 0 60% 0); }
        95% { clip-path: inset(20% 0 30% 0); }
        100% { clip-path: inset(0); }
      }

      /* === HUD Tabs container (legacy hook, optional) ==================== */
      .tabs-hud { background: transparent; box-shadow: none; }

      /* === Neon divider (unchanged) ===================================== */
      .neon-primary { --neon: var(--primary); }
      .neon-life { --neon: var(--accent); }
      .hero2-sep { position: relative; padding-top: 24px; }
      .hero2-neon-line {
        position: absolute;
        left: -8px; right: -8px; top: 0; height: 1px;
        pointer-events: none;
        background: linear-gradient(90deg, transparent, hsl(var(--neon)), transparent);
        box-shadow:
          0 0 4px hsl(var(--neon) / 0.55),
          0 0 10px hsl(var(--neon) / 0.35),
          0 0 18px hsl(var(--neon) / 0.2);
        animation: neon-flicker 3.4s infinite;
        opacity: 0.95;
      }
      .hero2-sep-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        justify-content: space-between;
      }
      @keyframes neon-flicker {
        0%, 17%, 22%, 26%, 52%, 100% { opacity: 1; }
        18% { opacity: 0.72; }
        24% { opacity: 0.55; }
        54% { opacity: 0.78; }
        70% { opacity: 0.62; }
        74% { opacity: 1; }
      }

      @media (prefers-reduced-motion: reduce) {
        .hero2-beams,
        .hero2-scanlines,
        .hero2-noise,
        .hero2-title::before,
        .hero2-title::after,
        .hero2-neon-line {
          animation: none !important;
          transition: none !important;
        }
      }
    `}</style>
  );
}
