"use client";

/**
 * Hero — sticky, glow, and unapologetically on top.
 * - Always sticky by default
 * - High z-index (z-[999]) so it doesn't hide behind random divs
 * - No border; soft neon glow
 * - Keep topClassName if you need offset (e.g., under the global navbar)
 */

import * as React from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export interface HeroProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: React.ReactNode;
  heading: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
  /** Still overridable, but true by default */
  sticky?: boolean;
  /** Offset from top; keep "top-[64px]" if you sit under SiteChrome */
  topClassName?: string;
  barClassName?: string;
  bodyClassName?: string;
  rail?: boolean;
}

export default function Hero({
  eyebrow,
  heading,
  subtitle,
  icon,
  right,
  children,
  sticky = true,
  topClassName = "top-[64px]", // adjust if your header height changes
  className,
  barClassName,
  bodyClassName,
  rail = true,
  ...rest
}: HeroProps) {
  return (
    <header
      className={cx(
        // Sticky + very high z-index + stacking context
        sticky && cx("sticky", topClassName),
        "z-[999] relative isolate",

        // Card look: no border, soft glow
        "rounded-2xl bg-[hsl(var(--card))]/70 backdrop-blur-md",
        "shadow-[0_0_18px_hsl(var(--ring)/.35),0_0_32px_hsl(var(--accent)/.25)]",

        // Safety: never let children bleed outside
        "overflow-hidden",

        className
      )}
      {...rest}
    >
      {/* Top bar */}
      <div
        className={cx(
          "relative flex items-center justify-between gap-3",
          "px-3 sm:px-4 py-2 min-h-[48px]",
          barClassName
        )}
      >
        {rail ? (
          <div
            className="hero-rail pointer-events-none absolute left-0 top-1 bottom-1 w-[6px] rounded-l-2xl"
            aria-hidden
          />
        ) : null}

        {/* Left: icon + text */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {icon ? <span className="shrink-0 opacity-90">{icon}</span> : null}
          <div className="min-w-0">
            {eyebrow ? (
              <div className="mb-0.5 truncate text-[11px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                {eyebrow}
              </div>
            ) : null}
            <div className="flex min-w-0 items-baseline gap-2">
              <h1 className="truncate text-base leading-tight text-[hsl(var(--foreground))] sm:text-lg title-glow">
                {heading}
              </h1>
              {subtitle ? (
                <span className="hidden truncate text-xs text-[hsl(var(--muted-foreground))] sm:inline">
                  {subtitle}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right slot */}
        {right ? <div className="shrink-0">{right}</div> : <div className="shrink-0" />}
      </div>

      {/* Body under the bar */}
      {children ? (
        <div className={cx("relative px-3 pb-3 pt-2 sm:px-4 sm:pb-4", bodyClassName)}>
          {children}
        </div>
      ) : null}
    </header>
  );
}

/* ================= Tabs helper (unchanged) ================= */

export interface HeroTab<Key extends string = string> {
  key: Key;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
}

export function HeroTabs<Key extends string = string>({
  tabs,
  activeKey,
  onChange,
  ariaLabel,
}: {
  tabs: HeroTab<Key>[];
  activeKey: Key;
  onChange: (key: Key) => void;
  ariaLabel?: string;
}) {
  const btnRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const setBtnRef = React.useCallback(
    (index: number) => (el: HTMLButtonElement | null) => {
      btnRefs.current[index] = el;
    },
    []
  );

  function onKeyDown(e: React.KeyboardEvent) {
    const idx = tabs.findIndex((t) => t.key === activeKey);
    if (idx < 0) return;
    if (e.key === "ArrowRight") {
      const next = (idx + 1) % tabs.length;
      onChange(tabs[next].key);
      btnRefs.current[next]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      const prev = (idx - 1 + tabs.length) % tabs.length;
      onChange(tabs[prev].key);
      btnRefs.current[prev]?.focus();
      e.preventDefault();
    } else if (e.key === "Home") {
      onChange(tabs[0].key);
      btnRefs.current[0]?.focus();
      e.preventDefault();
    } else if (e.key === "End") {
      onChange(tabs[tabs.length - 1].key);
      btnRefs.current[tabs.length - 1]?.focus();
      e.preventDefault();
    }
  }

  return (
    <nav
      role="tablist"
      aria-label={ariaLabel ?? "Page sections"}
      className="flex items-center gap-1 sm:gap-1.5"
      onKeyDown={onKeyDown}
    >
      {tabs.map((t, i) => {
        const active = activeKey === t.key;
        return (
          <button
            key={t.key}
            ref={setBtnRef(i)}
            role="tab"
            aria-selected={active}
            aria-controls={`${t.key}-panel`}
            id={`${t.key}-tab`}
            title={t.hint}
            onClick={() => onChange(t.key)}
            className={[
              "btn-like-segmented",
              active ? "is-active" : "",
              " h-8 sm:h-9 text-xs sm:text-sm px-3 focus-visible:ghost-2 focus-visible:ghost-[hsl(var(--ghost))]",
            ].join(" ")}
          >
            {t.icon}
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
