// src/components/ui/layout/TabBar.tsx
"use client";

/**
 * TabBar — segmented pills with soft depth
 * - Inset shadow segments; active uses accent gradient with glow.
 * - Keyboard: ← → Home End; role="tablist".
 * - Panels should set `aria-labelledby` to the controlling tab id.
 */

import * as React from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { useRovingTabState } from "@/components/tabs/useRovingTabState";
import styles from "./TabBar.module.css";
import segmentedButtonStyles from "../primitives/SegmentedButton.module.css";

export type TabItem<K extends string = string> = {
  key: K;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  badge?: React.ReactNode;
  className?: string;
  /** Optional explicit id for the tab button; defaults to `${key}-tab`. */
  id?: string;
  /** Optional override for associated panel id; defaults to `${key}-panel`. */
  controls?: string;
};

type Align = "start" | "center" | "end" | "between";
type Size = "sm" | "md" | "lg";
type Variant = "default" | "neo" | "glitch";

type WithExtras<
  K extends string,
  Extra extends Record<string, unknown> | undefined,
> = Extra extends Record<string, unknown> ? TabItem<K> & Extra : TabItem<K>;

export type TabElementProps = React.HTMLAttributes<HTMLElement> & {
  role: "tab";
  tabIndex: number;
  "aria-selected": boolean;
  "aria-controls"?: string;
  "aria-disabled"?: boolean;
  "aria-busy"?: boolean;
  "data-active"?: boolean;
  "data-loading"?: boolean;
  "data-disabled"?: boolean;
  "data-variant"?: Variant;
  "data-selected"?: string;
  "data-glitch"?: string;
  "data-depth"?: string;
};

export type TabRenderContext<
  K extends string = string,
  Item extends TabItem<K> = TabItem<K>,
> = {
  item: Item;
  active: boolean;
  disabled: boolean;
  loading: boolean;
  select: () => void;
  ref: React.RefCallback<HTMLElement>;
  props: TabElementProps;
  defaultChildren: React.ReactNode;
  size: Size;
  variant: Variant;
};

export type TabBarA11yProps =
  | {
      ariaLabel: string;
      ariaLabelledBy?: string;
    }
  | {
      ariaLabel?: string;
      ariaLabelledBy: string;
    };

type TabBarBaseProps<
  K extends string = string,
  Extra extends Record<string, unknown> | undefined = undefined,
> = {
  items: Array<WithExtras<K, Extra>>;
  value?: K;
  defaultValue?: K;
  onValueChange?: (key: K) => void;
  size?: Size;
  align?: Align;
  className?: string;
  right?: React.ReactNode;
  showBaseline?: boolean;
  linkPanels?: boolean;
  variant?: Variant;
  tablistClassName?: string;
  renderItem?: (
    context: TabRenderContext<K, WithExtras<K, Extra>>,
  ) => React.ReactNode;
  /**
   * Base string applied to tab and panel ids when linking panels.
   * Defaults to an auto-generated React id to ensure uniqueness.
   */
  idBase?: string;
};

export type TabBarProps<
  K extends string = string,
  Extra extends Record<string, unknown> | undefined = undefined,
> = TabBarBaseProps<K, Extra> & TabBarA11yProps;

const sizeMap: Record<Size, { h: string; px: string; text: string }> = {
  sm: {
    h: "h-[var(--space-8)]",
    px: "px-[var(--space-3)]",
    text: "text-ui",
  },
  md: {
    h: "h-[var(--control-h-md)]",
    px: "px-[var(--space-4)]",
    text: "text-ui",
  },
  lg: {
    h: "h-[var(--control-h-lg)]",
    px: "px-[var(--space-8)]",
    text: "text-body",
  },
};

export default function TabBar<
  K extends string = string,
  Extra extends Record<string, unknown> | undefined = undefined,
>({
  items,
  value,
  defaultValue,
  onValueChange,
  size = "md",
  align = "start",
  className,
  right,
  ariaLabel,
  ariaLabelledBy,
  showBaseline = false,
  linkPanels = true,
  variant = "default",
  tablistClassName,
  renderItem,
  idBase,
}: TabBarProps<K, Extra>) {
  const ariaLabelAttr =
    typeof ariaLabel === "string" && ariaLabel.trim().length > 0
      ? ariaLabel.trim()
      : undefined;
  const ariaLabelledByAttr =
    typeof ariaLabelledBy === "string" && ariaLabelledBy.trim().length > 0
      ? ariaLabelledBy.trim()
      : undefined;

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if (!ariaLabelAttr && !ariaLabelledByAttr) {
        console.warn(
          "TabBar requires an ariaLabel or ariaLabelledBy prop to describe the tablist.",
        );
      }
    }
  }, [ariaLabelAttr, ariaLabelledByAttr]);

  const uid = useId();
  const baseId = idBase ?? uid;
  const { activeKey, setActiveValue, registerTab, onKeyDown } =
    useRovingTabState({
      items,
      value,
      defaultValue,
      onValueChange,
    });

  const justify = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  }[align];

  const s = sizeMap[size];
  const isNeo = variant === "neo";
  const isGlitch = variant === "glitch";

  const neoVariantClassName = isNeo ? styles.neoTablist : undefined;
  const defaultVariantClassName = !isNeo && !isGlitch ? styles.defaultTablist : undefined;

  const containerVariant = isNeo
    ? "hero2-frame border-border/45 bg-[var(--neo-tablist-bg)] shadow-[var(--neo-tablist-shadow)] [--hover:var(--neo-tab-bg)] [--active:var(--neo-tab-bg)] [--focus:var(--theme-ring)]"
    : "[--focus:var(--theme-ring)]";

  const containerClasses = cn(
    "inline-flex max-w-full items-center overflow-x-auto",
    isGlitch
      ? "gap-[var(--space-2)] py-[var(--space-2)]"
      : "gap-[var(--space-1)] rounded-[var(--control-radius)] border p-[var(--space-1)]",
    containerVariant,
    tablistClassName,
  );

  const tabVariant = isNeo
    ? "bg-[var(--neo-tab-bg)] shadow-[var(--shadow-raised)] hover:shadow-[var(--shadow-raised-hover,var(--shadow-raised))] active:shadow-[var(--shadow-inset)] data-[active=true]:shadow-[var(--shadow-inset)] data-[active=true]:hover:shadow-[var(--shadow-inset)] data-[active=true]:active:shadow-[var(--shadow-inset)] data-[active=true]:ring-1 data-[active=true]:ring-ring/60"
    : isGlitch
      ? ""
      : styles.defaultTab;

  return (
    <div className={cn("relative w-full", className)}>
      <div
        className={cn(
          "flex flex-wrap items-center",
          justify,
          "gap-[var(--space-3)]",
        )}
      >
        {/* Tabs group */}
        <div
          role="tablist"
          aria-label={ariaLabelAttr}
          aria-labelledby={ariaLabelledByAttr}
          aria-orientation="horizontal"
          onKeyDown={onKeyDown}
          data-variant={variant}
          className={cn(containerClasses, neoVariantClassName, defaultVariantClassName)}
        >
          {items.map((item) => {
            const active = item.key === activeKey;
            const tabId = `${baseId}-${item.id ?? `${item.key}-tab`}`;
            const panelId = `${baseId}-${item.controls ?? `${item.key}-panel`}`;
            const isLoading = Boolean(item.loading);
            const isDisabled = Boolean(item.disabled || isLoading);
            const select = () => {
              if (isDisabled) return;
              setActiveValue(item.key);
            };
            const setRef: React.RefCallback<HTMLElement> = (el) => {
              registerTab(item.key, el);
            };
            const defaultChildren = (
              <>
                {item.icon && (
                  <span
                    className={cn(
                      "mr-[var(--space-2)] grid place-items-center",
                      size !== "lg"
                        ? "[&>svg]:h-[var(--space-4)] [&>svg]:w-[var(--space-4)]"
                        : "[&>svg]:h-[var(--space-5)] [&>svg]:w-[var(--space-5)]",
                    )}
                  >
                    {item.icon}
                  </span>
                )}
                <span className={cn("truncate", isGlitch && "relative z-10")}>{
                  item.label
                }</span>
                {item.badge != null && (
                  <span className="ml-[var(--space-2)] inline-flex items-center justify-center rounded-full px-[var(--space-2)] py-[var(--space-1)] text-label leading-none bg-primary-soft text-foreground">
                    {item.badge}
                  </span>
                )}
              </>
            );

            const baseClass = isGlitch
              ? cn(
                  segmentedButtonStyles.root,
                  "font-mono text-ui",
                  size === "lg" ? "text-body" : "text-ui",
                  active && segmentedButtonStyles.glitch,
                  active && "glitch-wrapper group/glitch is-active",
                  isDisabled && "pointer-events-none opacity-disabled",
                  item.className,
                )
              : cn(
                  "relative inline-flex items-center justify-center select-none rounded-[var(--control-radius)] transition-[background,box-shadow,color] duration-quick ease-out",
                  s.h,
                  s.px,
                  s.text,
                  size === "lg" ? "font-medium" : "font-normal",
                  "text-foreground/85 hover:text-foreground hover:bg-[--hover] active:bg-[--active]",
                  tabVariant,
                  "focus-visible:ring-2 focus-visible:ring-[var(--ring-contrast)] focus-visible:[--focus-ring-shadow:var(--shadow-glow-md)] focus-visible:[outline:var(--spacing-0-5)_solid_var(--ring-contrast)] focus-visible:[outline-offset:var(--spacing-0-5)]",
                  "data-[active=true]:text-foreground data-[active=true]:bg-[var(--seg-active-grad)] data-[active=true]:hover:bg-[var(--seg-active-grad)] data-[active=true]:active:bg-[var(--seg-active-grad)]",
                  "disabled:opacity-disabled disabled:pointer-events-none",
                  "data-[loading=true]:opacity-loading data-[loading=true]:pointer-events-none",
                  item.className,
                );

            const tabProps: TabElementProps = {
              id: linkPanels ? tabId : undefined,
              role: "tab",
              "aria-selected": active,
              "aria-disabled": isDisabled || undefined,
              "aria-busy": isLoading || undefined,
              "aria-controls": linkPanels ? panelId : undefined,
              tabIndex: isDisabled ? -1 : active ? 0 : -1,
              "data-active": active || undefined,
              "data-loading": isLoading || undefined,
              "data-disabled": isDisabled || undefined,
              "data-variant": variant,
              "data-selected": active ? "true" : undefined,
              "data-glitch": isGlitch && active ? "true" : undefined,
              "data-depth": isGlitch ? "raised" : undefined,
              className: baseClass,
              onClick: (event) => {
                if (isDisabled) {
                  event.preventDefault();
                  event.stopPropagation();
                  return;
                }
                select();
              },
            };

            const context: TabRenderContext<K, WithExtras<K, Extra>> = {
              item,
              active,
              disabled: isDisabled,
              loading: isLoading,
              select,
              ref: setRef,
              props: tabProps,
              defaultChildren,
              size,
              variant,
            };

            const customNode = renderItem?.(context);
            if (customNode != null) {
              return <React.Fragment key={item.key}>{customNode}</React.Fragment>;
            }

            return (
              <button
                key={item.key}
                type="button"
                disabled={isDisabled}
                {...tabProps}
                ref={setRef as React.Ref<HTMLButtonElement>}
              >
                {defaultChildren}
              </button>
            );
          })}
        </div>

        {/* Right slot */}
        {right && (
          <div className="ml-auto flex items-center gap-[var(--space-2)]">{right}</div>
        )}
      </div>

      {/* Optional baseline divider */}
      {showBaseline && (
        <div
          aria-hidden
          className="absolute -bottom-2.5 left-0 right-0 h-px opacity-70 [background:linear-gradient(90deg,transparent,hsla(var(--ring),0.5),transparent)]"
        />
      )}
    </div>
  );
}
