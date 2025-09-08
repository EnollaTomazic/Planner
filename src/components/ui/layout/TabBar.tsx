// src/components/ui/layout/TabBar.tsx
"use client";

/**
 * TabBar — Lavender-Glitch borderless tabs with neon text and sliding indicator
 * - Text-only buttons (white/70 default and active) with neon glow.
 * - Smooth indicator; keyboard: ← → Home End; role="tablist".
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export type TabItem = {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: React.ReactNode;
  className?: string;
};

type Align = "start" | "center" | "end" | "between";
type Size = "sm" | "md" | "lg";

export type TabBarProps = {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (key: string) => void;
  size?: Size;
  align?: Align;
  className?: string;
  right?: React.ReactNode;
  ariaLabel?: string;
  showBaseline?: boolean;
};

const sizeMap: Record<Size, { h: string; px: string; text: string }> = {
  sm: { h: "h-8", px: "px-3", text: "text-sm" },
  md: { h: "h-10", px: "px-4", text: "text-sm" },
  lg: { h: "h-11", px: "px-5", text: "text-base" },
};

export default function TabBar({
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
}: TabBarProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<string>(() => {
    if (value !== undefined) return value;
    if (defaultValue) return defaultValue;
    return items.find((i) => !i.disabled)?.key ?? items[0]?.key ?? "";
  });

  const activeKey = isControlled ? (value as string) : internal;

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const tabRefs = React.useRef(new Map<string, HTMLButtonElement | null>());
  const indicatorRef = React.useRef<HTMLDivElement | null>(null);

  const setTabRef = React.useCallback(
    (key: string) => (el: HTMLButtonElement | null) => {
      tabRefs.current.set(key, el);
    },
    [],
  );

  const commitValue = React.useCallback(
    (next: string) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const recalcIndicator = React.useCallback(() => {
    const el = tabRefs.current.get(activeKey);
    const bar = indicatorRef.current;
    const wrap = containerRef.current;
    if (!el || !bar || !wrap) return;

    const wrapRect = wrap.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    const left = elRect.left - wrapRect.left;
    const width = elRect.width;

    bar.style.transform = `translateX(${left}px)`;
    bar.style.width = `${Math.max(0, width)}px`;
    bar.style.opacity = "1";
  }, [activeKey]);

  React.useEffect(() => {
    recalcIndicator();
  }, [activeKey, recalcIndicator, items.length]);
  React.useEffect(() => {
    const onResize = () => recalcIndicator();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [recalcIndicator]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();

    const enabled = items.filter((i) => !i.disabled);
    const curIndex = enabled.findIndex((i) => i.key === activeKey);
    if (enabled.length === 0) return;

    if (e.key === "Home") return commitValue(enabled[0].key);
    if (e.key === "End") return commitValue(enabled[enabled.length - 1].key);

    if (e.key === "ArrowLeft") {
      const next = curIndex <= 0 ? enabled.length - 1 : curIndex - 1;
      return commitValue(enabled[next].key);
    }
    if (e.key === "ArrowRight") {
      const next = curIndex >= enabled.length - 1 ? 0 : curIndex + 1;
      return commitValue(enabled[next].key);
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
    <div
      className={cn("relative w-full", className)}
      ref={containerRef}
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
    >
      <div className={cn("flex items-center", justify, "gap-3")}>
        {/* Tabs group */}
        <div
          role="tablist"
          aria-orientation="horizontal"
          className="relative flex items-center flex-wrap gap-1.5"
        >
          {items.map((item) => {
            const active = item.key === activeKey;
            return (
              <button
                key={item.key}
                ref={setTabRef(item.key)}
                role="tab"
                type="button"
                aria-selected={active}
                aria-disabled={item.disabled || undefined}
                tabIndex={item.disabled ? -1 : active ? 0 : -1}
                onClick={() => !item.disabled && commitValue(item.key)}
                className={cn(
                  "relative inline-flex items-center select-none rounded-full transition-[color,opacity,text-shadow] duration-200",
                  "bg-transparent border-0",
                  s.h,
                  s.px,
                  s.text,
                  size === "lg" ? "font-medium" : "font-normal",
                  "text-foreground hover:text-foreground data-[active=true]:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-0",
                  item.disabled && "opacity-40 pointer-events-none",
                  item.className,
                )}
                data-active={active || undefined}
                style={
                  active
                    ? { textShadow: "0 0 10px hsl(var(--ring))" }
                    : undefined
                }
              >
                {item.icon && (
                  <span
                    className={cn(
                      "mr-2 grid place-items-center",
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
                  <span className="ml-2 inline-flex items-center justify-center rounded-full text-xs leading-none px-2 py-1 bg-[hsl(var(--primary-soft))] text-foreground">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Sliding indicator */}
          <div
            ref={indicatorRef}
            aria-hidden
            className={cn(
              "pointer-events-none absolute -bottom-1 h-[2px] rounded-full opacity-0",
              "[background:var(--seg-active-grad,linear-gradient(90deg,hsl(var(--primary))_0%,hsl(var(--accent))_100%))]",
              "transition-[transform,width,opacity] duration-200 ease-out",
              "shadow-ring",
            )}
          />
        </div>

        {/* Right slot */}
        {right && (
          <div className="ml-auto flex items-center gap-2">{right}</div>
        )}
      </div>

      {/* Optional baseline divider */}
      {showBaseline && (
        <div
          aria-hidden
          className="absolute -bottom-[9px] left-0 right-0 h-px opacity-70 [background:linear-gradient(90deg,transparent,hsla(var(--ring),0.5),transparent)]"
        />
      )}
    </div>
  );
}
