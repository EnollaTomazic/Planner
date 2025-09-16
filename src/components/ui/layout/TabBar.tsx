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

export type TabItem<K extends string = string> = {
  key: K;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: React.ReactNode;
  /** When true, the tab enters a loading state and becomes inert. */
  loading?: boolean;
  className?: string;
  /** Optional explicit id for the tab button; defaults to `${key}-tab`. */
  id?: string;
  /** Optional override for associated panel id; defaults to `${key}-panel`. */
  controls?: string;
};

type Align = "start" | "center" | "end" | "between";
type Size = "sm" | "md" | "lg";
type Variant = "default" | "neo";

export type TabBarProps<K extends string = string> = {
  items: TabItem<K>[];
  value?: K;
  defaultValue?: K;
  onValueChange?: (key: K) => void;
  size?: Size;
  align?: Align;
  className?: string;
  right?: React.ReactNode;
  ariaLabel?: string;
  showBaseline?: boolean;
  linkPanels?: boolean;
  variant?: Variant;
};

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

const tablistBase = cn(
  "inline-flex max-w-full items-center gap-[var(--space-1)] overflow-x-auto rounded-full border p-[var(--space-1)]",
  "bg-[var(--tablist-bg)] shadow-[var(--tablist-shadow)] transition-[background,box-shadow] duration-[var(--dur-quick)] ease-out",
  "motion-reduce:transition-none",
);

const tablistVariants: Record<Variant, string> = {
  default: cn(
    "border-border/30",
    "[--tablist-bg:hsl(var(--card)/0.6)]",
    "[--tablist-shadow:inset_0_1px_0_hsl(var(--highlight)/0.05),inset_0_-1px_0_hsl(var(--border)/0.14)]",
    "[--hover:theme('colors.interaction.foreground.tintHover')]",
    "[--active:theme('colors.interaction.foreground.tintActive')]",
    "[--focus:hsl(var(--ring))]",
  ),
  neo: cn(
    "hero2-frame border-border/40 backdrop-blur-[2px]",
    "[--tablist-bg:linear-gradient(145deg,hsl(var(--card)/0.92),hsl(var(--panel)/0.82))]",
    "[--tablist-shadow:inset_4px_4px_10px_hsl(var(--panel)/0.85),inset_-4px_-4px_10px_hsl(var(--highlight)/0.07),0_18px_32px_hsl(var(--shadow-color)/0.28)]",
    "[--hover:transparent]",
    "[--active:transparent]",
    "[--focus:hsl(var(--ring))]",
  ),
};

const tabBase = cn(
  "relative inline-flex select-none items-center justify-center rounded-full",
  "bg-[var(--tab-bg)] text-foreground/75",
  "transition-[color,background,box-shadow] duration-[var(--dur-quick)] ease-out motion-reduce:transition-none",
  "shadow-[var(--tab-shadow)] hover:shadow-[var(--tab-shadow-hover)] active:shadow-[var(--tab-shadow-active)]",
  "hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--focus] focus-visible:ring-offset-0",
  "data-[active=true]:bg-[var(--tab-bg-active)] data-[active=true]:hover:bg-[var(--tab-bg-active)] data-[active=true]:active:bg-[var(--tab-bg-active)]",
  "data-[active=true]:text-foreground data-[active=true]:shadow-[var(--tab-shadow-active)]",
  "disabled:opacity-[var(--disabled)] disabled:pointer-events-none",
  "data-[loading=true]:opacity-[var(--loading)] data-[loading=true]:pointer-events-none data-[loading=true]:cursor-progress",
);

const tabVariants: Record<Variant, string> = {
  default: cn(
    "text-foreground/70",
    "[--tab-bg:transparent]",
    "[--tab-bg-active:var(--seg-active-grad)]",
    "[--tab-shadow:inset_0_1px_0_hsl(var(--border)/0.2)]",
    "[--tab-shadow-hover:inset_0_1px_0_hsl(var(--border)/0.28)]",
    "[--tab-shadow-active:0_0_0_1px_hsl(var(--ring)/0.35),0_12px_22px_hsl(var(--ring-muted)/0.18)]",
    "hover:bg-[--hover] active:bg-[--active]",
  ),
  neo: cn(
    "text-foreground/80",
    "[--tab-bg:linear-gradient(145deg,hsl(var(--card)/0.94),hsl(var(--panel)/0.82))]",
    "[--tab-bg-active:var(--seg-active-grad)]",
    "[--tab-shadow:inset_3px_3px_8px_hsl(var(--panel)/0.82),inset_-3px_-3px_8px_hsl(var(--highlight)/0.07),0_12px_24px_hsl(var(--shadow-color)/0.22)]",
    "[--tab-shadow-hover:inset_2px_2px_6px_hsl(var(--panel)/0.78),inset_-2px_-2px_6px_hsl(var(--highlight)/0.06),0_16px_28px_hsl(var(--shadow-color)/0.25)]",
    "[--tab-shadow-active:0_0_0_1px_hsl(var(--ring)/0.55),0_18px_36px_hsl(var(--shadow-color)/0.3)]",
    "hover:bg-[var(--tab-bg)] active:bg-[var(--tab-bg)]",
    "data-[active=true]:ring-1 data-[active=true]:ring-[hsl(var(--ring)/0.6)]",
  ),
};

export default function TabBar<K extends string = string>({
  items,
  value,
  defaultValue,
  onValueChange,
  size = "md",
  align = "start",
  className,
  right,
  ariaLabel,
  showBaseline = false,
  linkPanels = true,
  variant = "default",
}: TabBarProps<K>) {
  const uid = useId();
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<K>(() => {
    if (value !== undefined) return value;
    if (defaultValue) return defaultValue;
    return (
      items.find((i) => !i.disabled && !i.loading)?.key ?? items[0]?.key ?? ""
    ) as K;
  });

  const activeKey = isControlled ? (value as K) : internal;

  const commitValue = React.useCallback(
    (next: K) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const tabRefs = React.useRef<Record<K, HTMLButtonElement | null>>({} as Record<
    K,
    HTMLButtonElement | null
  >);

  const commitAndFocus = React.useCallback(
    (next: K) => {
      commitValue(next);
      tabRefs.current[next]?.focus();
    },
    [commitValue],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();

    const enabled = items.filter((i) => !i.disabled && !i.loading);
    const curIndex = enabled.findIndex((i) => i.key === activeKey);
    if (enabled.length === 0) return;

    if (e.key === "Home") return commitAndFocus(enabled[0].key);
    if (e.key === "End")
      return commitAndFocus(enabled[enabled.length - 1].key);

    if (e.key === "ArrowLeft") {
      const next = curIndex <= 0 ? enabled.length - 1 : curIndex - 1;
      return commitAndFocus(enabled[next].key);
    }
    if (e.key === "ArrowRight") {
      const next = curIndex >= enabled.length - 1 ? 0 : curIndex + 1;
      return commitAndFocus(enabled[next].key);
    }
  };

  const justify = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  }[align];

  const s = sizeMap[size];

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
          aria-label={ariaLabel}
          aria-orientation="horizontal"
          onKeyDown={onKeyDown}
          data-variant={variant}
          className={cn(tablistBase, tablistVariants[variant])}
        >
          {items.map((item) => {
            const active = item.key === activeKey;
            const tabId = `${uid}-${item.id ?? `${item.key}-tab`}`;
            const panelId = `${uid}-${item.controls ?? `${item.key}-panel`}`;
            const isLoading = Boolean(item.loading);
            const isDisabled = Boolean(item.disabled || isLoading);
            return (
              <button
                key={item.key}
                id={linkPanels ? tabId : undefined}
                role="tab"
                type="button"
                disabled={isDisabled}
                aria-selected={active}
                aria-disabled={isDisabled || undefined}
                aria-controls={linkPanels ? panelId : undefined}
                aria-busy={isLoading || undefined}
                tabIndex={isDisabled ? -1 : active ? 0 : -1}
                ref={(el) => {
                  tabRefs.current[item.key] = el;
                }}
                data-loading={isLoading || undefined}
                onClick={() => {
                  if (isDisabled) return;
                  commitValue(item.key);
                }}
                className={cn(
                  tabBase,
                  s.h,
                  s.px,
                  s.text,
                  size === "lg" ? "font-medium" : "font-normal",
                  tabVariants[variant],
                  item.className,
                )}
                data-active={active || undefined}
              >
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
                <span className="truncate">{item.label}</span>
                {item.badge != null && (
                  <span className="ml-[var(--space-2)] inline-flex items-center justify-center rounded-full px-[var(--space-2)] py-[var(--space-1)] text-label leading-none bg-primary-soft text-foreground">
                    {item.badge}
                  </span>
                )}
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
