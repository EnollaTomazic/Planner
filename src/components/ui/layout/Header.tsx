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
import TabSelector, {
  type TabItem,
  type TabSelectorProps,
} from "@/components/ui/TabSelector";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export interface HeaderTab<Key extends string = string>
  extends TabItem<Key> {
  hint?: string;
}

export interface HeaderTabsProps<Key extends string = string>
  extends Omit<
    TabSelectorProps<Key>,
    "tabs" | "value" | "defaultValue" | "onValueChange"
  > {
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
  /** Primary navigation rendered to the left of tabs. */
  nav?: React.ReactNode;
  /** Right slot for actions (renders alongside tabs). */
  right?: React.ReactNode;
  /** Utility controls rendered at the far right (e.g., theme toggle, profile). */
  utilities?: React.ReactNode;
  children?: React.ReactNode;
  /** Still overridable, but true by default */
  sticky?: boolean;
  /** Offset from top; matches `--header-stack` when under SiteChrome */
  topClassName?: string;
  barClassName?: string;
  bodyClassName?: string;
  rail?: boolean;
  /** Reduce vertical padding and height, ideal for denser layouts. */
  compact?: boolean;
  /** Built-in top-right segmented tabs (preferred). */
  tabs?: HeaderTabsProps<Key>;
  /** Optional card-style framing. */
  variant?: "plain" | "neo" | "minimal";
  /** Show neon underline */
  underline?: boolean;
}

export default function Header<Key extends string = string>({
  eyebrow,
  heading,
  subtitle,
  icon,
  nav,
  right,
  utilities,
  children,
  sticky = true,
  topClassName = "top-[var(--header-stack)]", // sync with --header-stack token
  className,
  barClassName,
  bodyClassName,
  rail = true,
  compact = false,
  tabs,
  variant = "plain",
  underline = true,
  ...rest
}: HeaderProps<Key>) {
  const isNeo = variant === "neo";
  const isMinimal = variant === "minimal";

  let tabControl: React.ReactNode = null;
  if (tabs) {
    const {
      items: tabItems,
      value: tabValue,
      onChange: tabOnChange,
      ariaLabel: tabAriaLabel,
      size: tabSize,
      align: tabAlign,
      className: tabClassName,
      ...tabSelectorRest
    } = tabs;

    tabControl = (
      <TabSelector
        tabs={tabItems}
        value={tabValue}
        onValueChange={tabOnChange}
        ariaLabel={tabAriaLabel}
        size={tabSize ?? "sm"}
        align={tabAlign ?? "end"}
        className={cx("w-auto max-w-full shrink-0", tabClassName)}
        {...tabSelectorRest}
      />
    );
  }

  const hasTabs = Boolean(tabControl);
  const hasRight = right != null;
  const hasUtilities = utilities != null;
  const hasNav = nav != null;
  const showRightStack = hasTabs || hasRight || hasUtilities;

  const barPadding = compact
    ? isMinimal
      ? "px-4 py-[var(--space-3)]"
      : "px-3 sm:px-4 py-[var(--space-3)]"
    : isMinimal
      ? "px-4 py-4"
      : "px-3 sm:px-4 py-3 sm:py-4";
  const minHeightClass = compact
    ? "min-h-[var(--control-h-sm)]"
    : "min-h-12";

  return (
    <header
      className={cx(
        "z-[999] relative isolate",
        isNeo &&
          "rounded-card r-card-lg bg-card/70 backdrop-blur-md shadow-[0_0_10px_hsl(var(--ring)/.25),0_0_20px_hsl(var(--accent)/.15)]",
        isNeo && "overflow-hidden",

        // Neon underline
        underline &&
          "after:absolute after:left-0 after:bottom-0 after:h-px after:w-full after:bg-gradient-to-r after:from-primary after:via-accent after:to-transparent",

        className,
      )}
      {...rest}
    >
      {/* Top bar */}
      <div
        className={cx(
          sticky && cx("sticky", topClassName),
          "relative flex items-center gap-3 sm:gap-4",
          barPadding,
          minHeightClass,
          hasNav && "flex-wrap gap-y-2 sm:flex-nowrap",
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
        <div
          className={cx(
            "flex min-w-0 flex-1 items-center gap-3 sm:gap-4",
            hasNav && "flex-wrap gap-y-2 sm:flex-nowrap",
          )}
        >
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
          {hasNav ? (
            <div
              className={cx(
                "flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap text-xs font-medium text-muted-foreground sm:text-sm sm:overflow-visible",
                "[&_[data-state=active]]:text-foreground [&_[data-state=active]]:opacity-100",
                "[&_[data-state=inactive]]:text-muted-foreground [&_[data-state=inactive]:hover]:text-foreground [&_[data-state=inactive]:focus-visible]:text-foreground",
              )}
              data-slot="primary-nav"
            >
              {nav}
            </div>
          ) : null}
        </div>

        {/* Right slot / tabs */}
        {showRightStack ? (
          <div className="ml-auto flex min-w-0 items-center gap-3 sm:gap-4">
            {hasTabs ? tabControl : null}
            {hasRight ? (
              <div className="flex shrink-0 items-center gap-2">{right}</div>
            ) : null}
            {hasUtilities ? (
              <div
                className={cx(
                  "flex shrink-0 items-center gap-2 text-muted-foreground",
                  "[&_[data-state=active]]:text-foreground [&_[data-state=open]]:text-foreground",
                )}
                data-slot="utilities"
              >
                {utilities}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Body under the bar */}
      {children ? (
        <div
          className={cx(
            "relative",
            isMinimal ? "px-4 py-4" : "px-3 py-3 sm:px-4 sm:py-4",
            bodyClassName,
          )}
        >
          {children}
        </div>
      ) : null}
    </header>
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
    <TabSelector
      tabs={tabs}
      value={activeKey}
      onValueChange={onChange}
      ariaLabel={ariaLabel}
      align="end"
      size="sm"
    />
  );
}
