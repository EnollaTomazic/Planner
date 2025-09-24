// src/components/ui/SideSelector.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type GameSide = "Blue" | "Red";

type SideIndicatorStyle = React.CSSProperties & {
  "--side-indicator-gradient"?: string;
};

type Props = {
  value?: GameSide;
  onChange?: (v: GameSide) => void;
  className?: string;
  leftLabel?: string; // defaults "Blue"
  rightLabel?: string; // defaults "Red"
  disabled?: boolean;
  loading?: boolean;
};

/**
 * SideSelector — Blue/Red with glitch flicker
 * - Responsive intrinsic size (no fixed width)
 * - Keyboard: Space/Enter toggles; ← → selects
 */
export default function SideSelector({
  value = "Blue",
  onChange,
  className,
  leftLabel = "Blue",
  rightLabel = "Red",
  disabled = false,
  loading = false,
}: Props) {
  const isRight = value === "Red";
  const [flick, setFlick] = React.useState(false);
  const indicatorStyle: SideIndicatorStyle = {
    width: "calc(50% - var(--space-1))",
    transform: `translateX(${isRight ? "100%" : "0"})`,
    "--side-indicator-gradient":
      "linear-gradient(90deg, hsl(var(--primary)/0.35), hsl(var(--accent)/0.35))",
  };

  function toggle() {
    if (disabled || loading) return;
    onChange?.(isRight ? "Blue" : "Red");
    setFlick(true);
    window.setTimeout(() => setFlick(false), 220);
  }

  function onKey(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled || loading) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
    if (e.key === "ArrowLeft") onChange?.("Blue");
    if (e.key === "ArrowRight") onChange?.("Red");
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isRight}
      aria-label="Select side"
      disabled={disabled}
      data-loading={loading || undefined}
      onClick={toggle}
      onKeyDown={onKey}
      className={cn(
        "relative inline-flex select-none items-center overflow-hidden rounded-full",
        "border border-border bg-card",
        "hover:bg-[--hover] active:bg-[--active]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:opacity-disabled disabled:pointer-events-none",
        "data-[loading=true]:opacity-loading data-[loading=true]:pointer-events-none",
        "[--hover:hsl(var(--accent)/0.08)] [--active:hsl(var(--accent)/0.15)]",
        "min-w-[calc(var(--space-8)*3+var(--space-6))]",
        "sm:min-w-[calc(var(--space-8)*4)]",
        "w-full max-w-[calc(var(--space-8)*5)] h-[var(--control-h)]", // responsive default aligned to tokens
        className,
      )}
      data-side={value}
    >
      {/* Glitch flicker overlays */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0",
          "mix-blend-screen",
          flick && "opacity-100 animate-pulse",
        )}
        style={{
          background:
            "radial-gradient(calc(var(--space-8) * 2 - var(--space-2)) calc(var(--space-6) + var(--space-2)) at 25% 50%, hsl(var(--accent-2)/0.08), transparent 60%), radial-gradient(calc(var(--space-8) * 2 - var(--space-2)) calc(var(--space-6) + var(--space-2)) at 75% 50%, hsl(var(--lav-deep)/0.08), transparent 60%)",
        }}
      />

      {/* Sliding indicator */}
      <span
        aria-hidden
        className="absolute top-[var(--space-1)] bottom-[var(--space-1)] left-[var(--space-1)] rounded-full transition-transform duration-200 ease-out [background:var(--side-indicator-gradient)] shadow-[var(--shadow-neo-soft)]"
        style={indicatorStyle}
      />

      {/* Labels */}
      <div className="relative z-10 grid w-full grid-cols-2 text-ui font-mono">
        <div
          className={cn(
            "py-[var(--space-2)] text-center transition-colors",
            !isRight ? "text-foreground/70" : "text-muted-foreground",
          )}
          style={{
            textShadow: !isRight
              ? "0 0 calc(var(--space-3) - var(--spacing-0-5)) hsl(var(--team-blue)/.35)"
              : undefined,
          }}
        >
          {leftLabel}
        </div>
        <div
          className={cn(
            "py-[var(--space-2)] text-center transition-colors",
            isRight ? "text-foreground/70" : "text-muted-foreground",
          )}
          style={{
            textShadow: isRight
              ? "0 0 calc(var(--space-3) - var(--spacing-0-5)) hsl(var(--team-red)/.35)"
              : undefined,
          }}
        >
          {rightLabel}
        </div>
      </div>
    </button>
  );
}
