"use client";

/**
 * Header — sticky top bar with built-in segmented tabs.
 *
 * - Stays fixed while the body scrolls so content slides underneath
 * - High z-index (`z-[999]`) keeps it above surrounding chrome
 * - Soft neon glow instead of a border
 * - Offset with `topClassName` (`top-[var(--header-stack)]`) when nested under the global navbar
 * - `tabs` renders a right-aligned segmented control for section switching
 */

import * as React from "react";
import SegmentedButton from "@/components/ui/primitives/SegmentedButton";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export interface HeaderTab<Key extends string = string> {
  key: Key;
  label: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
}

export interface HeaderTabsProps<Key extends string = string> {
  items: HeaderTab<Key>[];
  value: Key;
  onChange: (key: Key) => void;
  ariaLabel?: string;
}

export interface HeaderProps<Key extends string = string>
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: React.ReactNode;
  heading: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  /** Right slot (legacy). Ignored if `tabs` is provided. */
  right?: React.ReactNode;
  children?: React.ReactNode;
  /** Still overridable, but true by default */
  sticky?: boolean;
  /** Offset from top; matches `--header-stack` when under SiteChrome */
  topClassName?: string;
  barClassName?: string;
  bodyClassName?: string;
  rail?: boolean;
  /** Built-in top-right segmented tabs (preferred). */
  tabs?: HeaderTabsProps<Key>;
}

export default function Header<Key extends string = string>({
  eyebrow,
  heading,
  subtitle,
  icon,
  right,
  children,
  sticky = true,
  topClassName = "top-[var(--header-stack)]", // sync with --header-stack token
  className,
  barClassName,
  bodyClassName,
  rail = true,
  tabs,
  ...rest
}: HeaderProps<Key>) {
  return (
    <header
      className={cx(
        "z-[999] relative isolate",

        // Card look: no border, soft glow
        "rounded-card r-card-lg bg-card/70 backdrop-blur-md",
        "shadow-[0_0_18px_hsl(var(--ring)/.35),0_0_32px_hsl(var(--accent)/.25)]",

        // Safety: never let children bleed outside
        "overflow-hidden",

        // Neon underline
        "after:absolute after:left-0 after:bottom-0 after:h-px after:w-full after:bg-gradient-to-r after:from-primary after:via-accent after:to-transparent",

        className,
      )}
      {...rest}
    >
      {/* Top bar */}
      <div
        className={cx(
          sticky && cx("sticky", topClassName),
          "relative flex items-center",
          "px-3 sm:px-4 py-3 sm:py-4 min-h-12",
          barClassName,
        )}
      >
        {rail ? (
          <div
            className="header-rail pointer-events-none absolute left-0 top-1 bottom-1 w-2 rounded-l-2xl"
            aria-hidden
          />
        ) : null}

        {/* Left: icon + text */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {icon ? <span className="shrink-0 opacity-90">{icon}</span> : null}
          <div className="min-w-0">
            {eyebrow ? (
              <div className="mb-1 truncate text-label font-medium tracking-[0.02em] uppercase text-muted-foreground">
                {eyebrow}
              </div>
            ) : null}
            <div className="flex min-w-0 items-baseline gap-2">
              <h1 className="truncate text-title leading-tight text-foreground sm:text-title-lg font-semibold tracking-[-0.01em] title-glow">
                {heading}
              </h1>
              {subtitle ? (
                <span className="hidden truncate text-label font-medium tracking-[0.02em] text-muted-foreground sm:inline">
                  {subtitle}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right slot / tabs */}
        {tabs ? (
          <div className="ml-auto shrink-0">
            <TabsNav
              items={tabs.items}
              value={tabs.value}
              onChange={tabs.onChange}
              ariaLabel={tabs.ariaLabel}
            />
          </div>
        ) : right ? (
          <div className="ml-auto shrink-0">{right}</div>
        ) : null}
      </div>

      {/* Body under the bar */}
      {children ? (
        <div
          className={cx("relative px-3 py-3 sm:px-4 sm:py-4", bodyClassName)}
        >
          {children}
        </div>
      ) : null}
    </header>
  );
}

/* ================= Tabs helper ================= */

function TabsNav<Key extends string = string>({
  items,
  value,
  onChange,
  ariaLabel,
}: HeaderTabsProps<Key>) {
  const btnRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const setBtnRef = React.useCallback(
    (index: number) => (el: HTMLButtonElement | null) => {
      btnRefs.current[index] = el;
    },
    [],
  );

  function onKeyDown(e: React.KeyboardEvent) {
    const idx = items.findIndex((t) => t.key === value);
    if (idx < 0) return;
    if (e.key === "ArrowRight") {
      const next = (idx + 1) % items.length;
      onChange(items[next].key);
      btnRefs.current[next]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      const prev = (idx - 1 + items.length) % items.length;
      onChange(items[prev].key);
      btnRefs.current[prev]?.focus();
      e.preventDefault();
    } else if (e.key === "Home") {
      onChange(items[0].key);
      btnRefs.current[0]?.focus();
      e.preventDefault();
    } else if (e.key === "End") {
      onChange(items[items.length - 1].key);
      btnRefs.current[items.length - 1]?.focus();
      e.preventDefault();
    }
  }

  return (
    <nav
      role="tablist"
      aria-label={ariaLabel ?? "Page sections"}
      className="flex items-center gap-1 sm:gap-2"
      onKeyDown={onKeyDown}
    >
      {items.map((t, i) => {
        const active = value === t.key;
        return (
            <SegmentedButton
              key={t.key}
            ref={setBtnRef(i) as (el: HTMLButtonElement | null) => void}
            role="tab"
            aria-selected={active}
            aria-controls={`${t.key}-panel`}
            id={`${t.key}-tab`}
            title={t.hint}
            onClick={() => onChange(t.key)}
            className="h-8 sm:h-9 text-label sm:text-ui font-medium tracking-[0.02em] px-3 focus-visible:ghost-2 focus-visible:ghost-ghost"
            isActive={active}
          >
            {t.icon}
            {t.label}
          </SegmentedButton>
        );
      })}
    </nav>
  );
}

/** @deprecated Use the `tabs` prop on `Header` instead. */
export function HeaderTabs<Key extends string = string>({
  tabs,
  activeKey,
  onChange,
  ariaLabel,
}: {
  tabs: HeaderTab<Key>[];
  activeKey: Key;
  onChange: (key: Key) => void;
  ariaLabel?: string;
}) {
  return (
    <TabsNav
      items={tabs}
      value={activeKey}
      onChange={onChange}
      ariaLabel={ariaLabel}
    />
  );
}
