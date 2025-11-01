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
import Link from "next/link";
import { NAV_ITEMS } from "@/config/nav";
import { withBasePath } from "@/lib/utils";
import { NeomorphicFrameStyles } from "./NeomorphicFrameStyles";
import {
  HeaderTabs as HeaderTabsControl,
  type HeaderTabItem,
} from "@/components/tabs/HeaderTabs";
import { type TabBarProps, TabBar } from "./TabBar";
import { ThemeToggle } from "@/components/ui/theme/ThemeToggle";
import {
  resolveUIVariant,
  type DeprecatedUIVariant,
  type UIVariant,
} from "@/components/ui/variants";

const HEADER_VARIANTS = ["default", "neo", "quiet"] as const satisfies readonly UIVariant[];
type HeaderVariant = (typeof HEADER_VARIANTS)[number];

const deriveNavKey = (href: string) => {
  if (!href || href === "/") {
    return "home";
  }

  return href
    .replace(/^\//, "")
    .replace(/\/+/g, "-")
    .replace(/[^a-z0-9-]/gi, "-")
    .toLowerCase();
};

export const PRIMARY_PAGE_NAV = NAV_ITEMS.map((item) => ({
  key: deriveNavKey(item.href),
  label: item.label,
  href: item.href,
})) satisfies ReadonlyArray<HeaderNavItem>;

export type PrimaryPageNavKey = (typeof PRIMARY_PAGE_NAV)[number]["key"];

export interface HeaderNavItem {
  key: string;
  label: React.ReactNode;
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  active?: boolean;
  icon?: React.ReactNode;
}

export interface HeaderActionsConfig {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function createTabsControl<Key extends string = string>(
  tabs: HeaderTabsProps<Key> | undefined,
  defaultLabel: string,
  { defaultClassName }: { defaultClassName?: string } = {},
) {
  if (!tabs) {
    return null;
  }

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

  const mergedTabClassName = cx(
    "w-auto max-w-full shrink-0",
    defaultClassName,
    tabClassName,
  );
  const hasTabBarSpecificProps =
    tabVariant != null ||
    (typeof tablistClassName === "string" && tablistClassName.trim().length > 0) ||
    typeof tabRenderItem === "function";

  if (hasTabBarSpecificProps) {
    return (
      <TabBar
        items={sanitizedItems}
        value={tabValue}
        onValueChange={tabOnChange}
        ariaLabel={sanitizedTabAriaLabel ?? defaultLabel}
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
  }

  return (
    <HeaderTabsControl
      items={sanitizedItems}
      value={tabValue}
      onChange={tabOnChange}
      ariaLabel={sanitizedTabAriaLabel ?? defaultLabel}
      ariaLabelledBy={sanitizedTabAriaLabelledBy}
      idBase={tabIdBase}
      linkPanels={tabLinkPanels}
      className={mergedTabClassName}
      {...tabDomProps}
    />
  );
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
  navItems?: HeaderNavItem[];
  navItemsLabel?: string;
  /** Primary navigation rendered to the left of tabs. */
  nav?: React.ReactNode;
  /** Right slot for actions (renders alongside tabs). */
  right?: React.ReactNode;
  /** Configurable actions cluster rendered next to tabs. */
  actions?: React.ReactNode | HeaderActionsConfig;
  /** Utility controls rendered at the far right (e.g., theme toggle, profile). */
  utilities?: React.ReactNode;
  showThemeToggle?: boolean;
  search?: React.ReactNode;
  subTabs?: HeaderTabsProps<Key>;
  children?: React.ReactNode;
  /** Still overridable, but true by default */
  sticky?: boolean;
  /** Offset from top; matches `--header-stack` when under SiteChrome */
  topClassName?: string;
  barClassName?: string;
  bodyClassName?: string;
  /** @deprecated Decorative rails were removed. */
  rail?: boolean;
  /** @deprecated Decorative rails were removed. */
  railTone?: "subtle" | "loud";
  /** @deprecated Decorative rails were removed. */
  railVariant?: "subtle" | "loud";
  /** @deprecated Decorative rails were removed. */
  railClassName?: string;
  /** Reduce vertical padding and height, ideal for denser layouts. */
  compact?: boolean;
  /** Built-in top-right segmented tabs (preferred). */
  tabs?: HeaderTabsProps<Key>;
  /** Optional card-style framing. */
  variant?: HeaderVariant | Extract<DeprecatedUIVariant, "plain">;
  /** Show neon underline */
  underline?: boolean;
  /** Controls the underline gradient tone. Defaults to a neutral treatment. */
  underlineTone?: "brand" | "neutral";
}

export function Header<Key extends string = string>({
  eyebrow,
  heading,
  subtitle,
  icon,
  navItems,
  navItemsLabel,
  nav,
  right,
  actions,
  utilities,
  showThemeToggle = false,
  search,
  subTabs,
  children,
  sticky = true,
  topClassName = "top-[var(--header-stack)]", // sync with --header-stack token
  className,
  barClassName,
  bodyClassName,
  rail: _deprecatedRail = true,
  railTone: _deprecatedRailTone,
  railVariant: _deprecatedRailVariant,
  railClassName: _deprecatedRailClassName,
  compact = false,
  tabs,
  variant = "default",
  underline = true,
  underlineTone = "neutral",
  ...rest
}: HeaderProps<Key>) {
  void _deprecatedRail;
  void _deprecatedRailTone;
  void _deprecatedRailVariant;
  void _deprecatedRailClassName;
  const resolvedVariant = resolveUIVariant<HeaderVariant>(variant, {
    allowed: HEADER_VARIANTS,
    fallback: "default",
  });
  const isNeo = resolvedVariant === "neo";
  const isQuiet = resolvedVariant === "quiet";
  const shouldRenderNeomorphicFrameStyles = isNeo;
  const shouldUseTranslucentSurface = resolvedVariant === "default";
  const translucentSurfaceClasses = shouldUseTranslucentSurface
    ? "border-b border-card-hairline-60 bg-surface/80 backdrop-blur"
    : "";

  const tabControl = createTabsControl(tabs, "Header tabs");
  const subTabControl = createTabsControl(subTabs, "Header secondary tabs", {
    defaultClassName: "w-full",
  });

  const navLabel =
    typeof navItemsLabel === "string" && navItemsLabel.trim().length > 0
      ? navItemsLabel.trim()
      : "Primary navigation";
  const navNode = React.useMemo(() => {
    if (nav) {
      return nav;
    }
    if (!navItems || navItems.length === 0) {
      return null;
    }

    return (
      <nav aria-label={navLabel} className="flex items-center gap-[var(--space-1)]">
        {navItems.map((item) => {
          const key = item.key;
          const active = Boolean(item.active);
          const content = (
            <span className="flex items-center gap-[var(--space-1)]">
              {item.icon ? (
                <span aria-hidden className="inline-flex shrink-0 text-muted-foreground">
                  {item.icon}
                </span>
              ) : null}
              <span>{item.label}</span>
            </span>
          );

          const className = cx(
            "flex items-center gap-[var(--space-1)] rounded-full px-[var(--space-3)] py-[var(--space-1)] text-label font-medium transition-colors",
            active
              ? "bg-card/70 text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground focus-visible:text-foreground",
          );

          if (item.href) {
            const href = withBasePath(item.href, { skipForNextLink: true });
            return (
              <Link
                key={key}
                href={href}
                className={className}
                aria-current={active ? "page" : undefined}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={key}
              type="button"
              onClick={item.onClick}
              className={className}
              data-state={active ? "active" : "inactive"}
            >
              {content}
            </button>
          );
        })}
      </nav>
    );
  }, [nav, navItems, navLabel]);

  const resolvedActions = React.useMemo(() => {
    if (actions !== undefined) {
      if (
        actions === null ||
        React.isValidElement(actions) ||
        typeof actions !== "object" ||
        (!("leading" in actions) && !("trailing" in actions))
      ) {
        return actions as React.ReactNode;
      }

      const { leading, trailing } = actions as HeaderActionsConfig;
      return (
        <div className="flex items-center gap-[var(--space-2)]">
          {leading}
          {trailing}
        </div>
      );
    }

    return right;
  }, [actions, right]);

  const themeToggleNode = showThemeToggle ? (
    <ThemeToggle className="shrink-0" ariaLabel="Theme" />
  ) : null;

  const utilitiesNode = React.useMemo(() => {
    if (!utilities && !themeToggleNode) {
      return null;
    }

    return (
      <>
        {utilities}
        {themeToggleNode}
      </>
    );
  }, [themeToggleNode, utilities]);

  const hasTabs = Boolean(tabControl);
  const hasSubTabs = Boolean(subTabControl);
  const hasActions = resolvedActions != null;
  const hasUtilities = utilitiesNode != null;
  const hasSearch = search != null;
  const hasNav = navNode != null;
  const showRightStack = hasTabs || hasActions || hasUtilities || hasSearch;
  const hasChildren = children != null;
  const shouldRenderBody = hasSubTabs || hasChildren;

  const stickyClasses = sticky ? cx("sticky", topClassName) : "";

  const defaultBarPx = isQuiet ? "var(--space-4)" : "var(--space-3)";
  const defaultBarSmPx = "var(--space-4)";
  const barPadding = cx(
    `px-[var(--header-bar-px,${defaultBarPx})]`,
    `sm:px-[var(--header-bar-sm-px,${defaultBarSmPx})]`,
    compact
      ? "py-[var(--space-3)]"
      : isQuiet
        ? "py-[var(--space-4)]"
        : "py-[var(--space-3)] sm:py-[var(--space-4)]",
  );
  const minHeightClass = compact
    ? "min-h-[var(--control-h-sm)]"
    : "min-h-[var(--space-7)]";

  const defaultBodyPx = isQuiet ? "var(--space-4)" : "var(--space-3)";
  const defaultBodySmPx = "var(--space-4)";
  const bodyPadding = cx(
    `px-[var(--header-body-px,${defaultBodyPx})]`,
    `sm:px-[var(--header-body-sm-px,${defaultBodySmPx})]`,
    isQuiet
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
          translucentSurfaceClasses,

          // Underline accent
          underline &&
            cx(
              "after:absolute after:left-0 after:bottom-0 after:h-px after:w-full after:bg-gradient-to-r after:z-[2]",
              underlineTone === "brand"
                ? "after:from-primary after:via-accent after:to-transparent"
                : "after:from-card-hairline after:via-card-hairline-70 after:to-transparent",
            ),

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
                {navNode}
              </div>
            ) : null}
          </div>

          {/* Right slot / tabs */}
          {showRightStack ? (
            <div className="ml-auto flex min-w-0 items-center gap-[var(--space-3)] self-start sm:gap-[var(--space-4)]">
              {hasTabs ? tabControl : null}
              {hasSearch ? (
                <div className="flex min-w-0 items-center gap-[var(--space-2)]">
                  {search}
                </div>
              ) : null}
              {hasActions ? (
                <div className="flex shrink-0 items-center gap-[var(--space-2)]">
                  {resolvedActions}
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
                  {utilitiesNode}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Body under the bar */}
        {shouldRenderBody ? (
          <div
            className={cx(
              "relative flex flex-col gap-[var(--space-3)]",
              shouldRenderNeomorphicFrameStyles && "z-[2]",
              bodyPadding,
              bodyClassName,
            )}
          >
            {hasSubTabs ? (
              <div className="w-full overflow-x-auto">{subTabControl}</div>
            ) : null}
            {hasChildren ? children : null}
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
