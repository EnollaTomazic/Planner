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
  className?: string;
  /** Optional explicit id for the tab button; defaults to `${key}-tab`. */
  id?: string;
  /** Optional override for associated panel id; defaults to `${key}-panel`. */
  controls?: string;
};

type Align = "start" | "center" | "end" | "between";
type Size = "sm" | "md" | "lg";

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
};

const sizeMap: Record<Size, { h: string; px: string; text: string }> = {
  sm: {
    h: "h-[var(--space-6)]",
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
    px: "px-[var(--space-6)]",
    text: "text-body",
  },
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
}: TabBarProps<K>) {
  const uid = useId();
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<K>(() => {
    if (value !== undefined) return value;
    if (defaultValue) return defaultValue;
    return (items.find((i) => !i.disabled)?.key ?? items[0]?.key ?? "") as K;
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

    const enabled = items.filter((i) => !i.disabled);
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
          className="inline-flex max-w-full items-center gap-[var(--space-1)] overflow-x-auto rounded-full border border-border/30 bg-card/60 p-[var(--space-1)] shadow-inner"
        >
          {items.map((item) => {
            const active = item.key === activeKey;
            const tabId = `${uid}-${item.id ?? `${item.key}-tab`}`;
            const panelId = `${uid}-${item.controls ?? `${item.key}-panel`}`;
            return (
              <button
                key={item.key}
                id={linkPanels ? tabId : undefined}
                role="tab"
                type="button"
                disabled={item.disabled}
                aria-selected={active}
                aria-disabled={item.disabled || undefined}
                aria-controls={linkPanels ? panelId : undefined}
                tabIndex={item.disabled ? -1 : active ? 0 : -1}
                ref={(el) => {
                  tabRefs.current[item.key] = el;
                }}
                onClick={() => !item.disabled && commitValue(item.key)}
                className={cn(
                  "relative inline-flex items-center justify-center select-none rounded-full transition-[background,box-shadow,color] duration-[var(--dur-quick)] ease-out",
                  s.h,
                  s.px,
                  s.text,
                  size === "lg" ? "font-medium" : "font-normal",
                  "text-foreground/70 hover:text-foreground shadow-[inset_0_1px_0_hsl(var(--border)/0.2)] hover:bg-[--hover] active:bg-[--active]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--focus] focus-visible:ring-offset-0",
                  "data-[active=true]:text-foreground data-[active=true]:bg-[var(--seg-active-grad)] data-[active=true]:shadow-ring data-[active=true]:hover:bg-[var(--seg-active-grad)] data-[active=true]:active:bg-[var(--seg-active-grad)]",
                  "disabled:opacity-[var(--disabled)] disabled:pointer-events-none",
                  item.className,
                )}
                data-active={active || undefined}
              >
                {item.icon && (
                  <span
                    className={cn(
                      "mr-[var(--space-2)] grid place-items-center",
                      size !== "lg"
                        ? "[&>svg]:h-4 [&>svg]:w-4"
                        : "[&>svg]:h-5 [&>svg]:w-5",
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
          <div className="ml-auto flex items-center gap-[var(--space-2)]">
            {right}
          </div>
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
