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
import { NeomorphicFrameStyles } from "./NeomorphicFrameStyles";
import {
  HeaderTabs as HeaderTabsControl,
  type HeaderTabItem,
} from "@/components/tabs/HeaderTabs";
import TabBar, { type TabBarProps } from "./TabBar";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export interface HeaderTab<Key extends string = string>
  extends HeaderTabItem<Key> {
  hint?: string;
}

export type HeaderTabsProps<Key extends string = string> = Omit<
  TabBarProps<Key>,
  "items" | "value" | "defaultValue" | "onValueChange"
> & {
  items: HeaderTab<Key>[];
  value: Key;
  onChange: (key: Key) => void;
};

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
  /** Decorative rail emphasis; defaults to the subtler glow. */
  railVariant?: "subtle" | "loud";
  /** Custom rail classes to opt into alternate treatments (e.g., loud rail). */
  railClassName?: string;
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
  railVariant = "subtle",
  railClassName,
  compact = false,
  tabs,
  variant = "plain",
  underline = true,
  ...rest
}: HeaderProps<Key>) {
  const isNeo = variant === "neo";
  const isMinimal = variant === "minimal";
  const isPlain = variant === "plain";
  const shouldRenderNeomorphicFrameStyles = isNeo || isPlain;
  const plainNeomorphicClasses = isPlain
    ? "rounded-card r-card-lg border border-[hsl(var(--border))/0.45] bg-card/70 shadow-neoSoft backdrop-blur-md hero2-frame hero2-neomorph overflow-hidden"
    : "";

  let tabControl: React.ReactNode = null;
  if (tabs) {
    const {
      items: tabItems,
      value: tabValue,
      onChange: tabOnChange,
      ariaLabel: tabAriaLabel,
      ariaLabelledBy: tabAriaLabelledBy,
      className: tabClassName,
      size: tabSize,
      align: tabAlign,
      right: tabRight,
      showBaseline: tabShowBaseline,
      variant: tabVariant,
      tablistClassName,
      renderItem: tabRenderItem,
      idBase: tabIdBase,
      linkPanels: tabLinkPanels,
      ...tabDomProps
    } = tabs;
    const sanitizedTabAriaLabel =
      typeof tabAriaLabel === "string" && tabAriaLabel.trim().length > 0
        ? tabAriaLabel.trim()
        : undefined;
    const sanitizedTabAriaLabelledBy =
      typeof tabAriaLabelledBy === "string" && tabAriaLabelledBy.trim().length > 0
        ? tabAriaLabelledBy.trim()
        : undefined;
    const sanitizedItems = tabItems.map(({ hint, ...item }) => {
      void hint;
      return item;
    });

    const mergedTabClassName = cx("w-auto max-w-full shrink-0", tabClassName);
    const hasTabBarSpecificProps =
      tabVariant != null ||
      (typeof tablistClassName === "string" && tablistClassName.trim().length > 0) ||
      typeof tabRenderItem === "function";

    if (hasTabBarSpecificProps) {
      tabControl = (
        <TabBar
          items={sanitizedItems}
          value={tabValue}
          onValueChange={tabOnChange}
          ariaLabel={sanitizedTabAriaLabel ?? "Header tabs"}
          ariaLabelledBy={sanitizedTabAriaLabelledBy}
          idBase={tabIdBase}
          linkPanels={tabLinkPanels}
          className={mergedTabClassName}
          size={tabSize}
          align={tabAlign}
          right={tabRight}
          showBaseline={tabShowBaseline}
          variant={tabVariant}
          tablistClassName={tablistClassName}
          renderItem={tabRenderItem}
        />
      );
    } else {
      tabControl = (
        <HeaderTabsControl
          items={sanitizedItems}
          value={tabValue}
          onChange={tabOnChange}
          ariaLabel={sanitizedTabAriaLabel ?? "Header tabs"}
          ariaLabelledBy={sanitizedTabAriaLabelledBy}
          idBase={tabIdBase}
          linkPanels={tabLinkPanels}
          className={mergedTabClassName}
          {...tabDomProps}
        />
      );
    }
  }

  const hasTabs = Boolean(tabControl);
  const hasRight = right != null;
  const hasUtilities = utilities != null;
  const hasNav = nav != null;
  const showRightStack = hasTabs || hasRight || hasUtilities;

  const stickyClasses = sticky ? cx("sticky", topClassName) : "";

  const defaultBarPx = isMinimal ? "var(--space-4)" : "var(--space-3)";
  const defaultBarSmPx = "var(--space-4)";
  const barPadding = cx(
    `px-[var(--header-bar-px,${defaultBarPx})]`,
    `sm:px-[var(--header-bar-sm-px,${defaultBarSmPx})]`,
    compact
      ? "py-[var(--space-3)]"
      : isMinimal
        ? "py-[var(--space-4)]"
        : "py-[var(--space-3)] sm:py-[var(--space-4)]",
  );
  const minHeightClass = compact
    ? "min-h-[var(--control-h-sm)]"
    : "min-h-[var(--space-7)]";

  const defaultBodyPx = isMinimal ? "var(--space-4)" : "var(--space-3)";
  const defaultBodySmPx = "var(--space-4)";
  const bodyPadding = cx(
    `px-[var(--header-body-px,${defaultBodyPx})]`,
    `sm:px-[var(--header-body-sm-px,${defaultBodySmPx})]`,
    isMinimal
      ? "py-[var(--space-4)]"
      : "py-[var(--space-3)] sm:py-[var(--space-4)]",
  );

  return (
    <>
      {shouldRenderNeomorphicFrameStyles ? <NeomorphicFrameStyles /> : null}
      <header
        className={cx(
          "z-[999] relative isolate",
          isNeo &&
            "rounded-card r-card-lg bg-card/70 backdrop-blur-md hero2-neomorph",
          isNeo && "overflow-hidden",
          plainNeomorphicClasses,

          // Neon underline
          underline &&
            "after:absolute after:left-0 after:bottom-0 after:h-px after:w-full after:bg-gradient-to-r after:from-primary after:via-accent after:to-transparent after:z-[2]",

          className,
        )}
        {...rest}
      >
        {/* Top bar */}
        <div
          className={cx(
            stickyClasses,
            "relative flex items-center gap-[var(--space-3)] sm:gap-[var(--space-4)]",
            barPadding,
            minHeightClass,
            shouldRenderNeomorphicFrameStyles && "z-[2]",
            hasNav && "flex-wrap gap-y-[var(--space-2)] sm:flex-nowrap",
            barClassName,
          )}
        >
          {rail ? (
            <div
              className={cx(
                "header-rail pointer-events-none absolute left-0 top-[var(--space-1)] bottom-[var(--space-1)] w-[var(--space-2)] rounded-l-2xl",
                railVariant !== "loud" && "header-rail--subtle",
                railVariant === "loud" && "header-rail--loud",
                railClassName,
              )}
              aria-hidden
            />
          ) : null}

          {/* Left: icon + text */}
          <div
            className={cx(
              "flex min-w-0 flex-1 items-center gap-[var(--space-3)] sm:gap-[var(--space-4)]",
              hasNav && "flex-wrap gap-y-[var(--space-2)] sm:flex-nowrap",
            )}
          >
            <div className="flex min-w-0 items-center gap-[var(--space-2)] sm:gap-[var(--space-3)]">
              {icon ? (
                <span className="shrink-0 opacity-90">{icon}</span>
              ) : null}
              <div className="min-w-0">
                {eyebrow ? (
                  <div className="mb-[var(--space-1)] text-balance break-words text-label font-medium tracking-[0.02em] uppercase text-muted-foreground">
                    {eyebrow}
                  </div>
                ) : null}
                <div className="flex min-w-0 items-baseline gap-[var(--space-2)]">
                  <h1 className="text-balance break-words text-title leading-tight text-foreground sm:text-title-lg font-semibold tracking-[-0.01em]">
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
                  "flex min-w-0 flex-1 items-center gap-[var(--space-1)] overflow-x-auto whitespace-nowrap text-label font-medium text-muted-foreground sm:text-ui sm:overflow-visible",
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
            <div className="ml-auto flex min-w-0 items-center gap-[var(--space-3)] self-start sm:gap-[var(--space-4)]">
              {hasTabs ? tabControl : null}
              {hasRight ? (
                <div className="flex shrink-0 items-center gap-[var(--space-2)]">
                  {right}
                </div>
              ) : null}
              {hasUtilities ? (
                <div
                  className={cx(
                    "flex shrink-0 items-center gap-[var(--space-2)] text-muted-foreground",
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
              shouldRenderNeomorphicFrameStyles && "z-[2]",
              bodyPadding,
              bodyClassName,
            )}
          >
            {children}
          </div>
        ) : null}
      </header>
    </>
  );
}

/** @deprecated Use the `tabs` prop on `Header` instead. */
export function HeaderTabs<Key extends string = string>({
  tabs,
  activeKey,
  onChange,
  ariaLabel,
  ariaLabelledBy,
}: {
  tabs: HeaderTab<Key>[];
  activeKey: Key;
  onChange: (key: Key) => void;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}) {
  const sanitizedAriaLabel =
    typeof ariaLabel === "string" && ariaLabel.trim().length > 0
      ? ariaLabel.trim()
      : undefined;
  const sanitizedAriaLabelledBy =
    typeof ariaLabelledBy === "string" && ariaLabelledBy.trim().length > 0
      ? ariaLabelledBy.trim()
      : undefined;
  const sanitizedItems = tabs.map(({ hint, ...item }) => {
    void hint;
    return item;
  });

  return (
    <HeaderTabsControl
      items={sanitizedItems}
      value={activeKey}
      onChange={onChange}
      ariaLabel={sanitizedAriaLabel ?? "Header tabs"}
      ariaLabelledBy={sanitizedAriaLabelledBy}
    />
  );
}
