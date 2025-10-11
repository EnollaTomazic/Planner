// src/components/ui/SideSelector.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./SideSelector.module.css";

export type GameSide = "Blue" | "Red";

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
export function SideSelector({
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
  const flickTimeoutRef = React.useRef<number | null>(null);

  function triggerFlick() {
    if (flickTimeoutRef.current) {
      window.clearTimeout(flickTimeoutRef.current);
    }
    setFlick(true);
    flickTimeoutRef.current = window.setTimeout(() => setFlick(false), 220);
  }

  React.useEffect(() => {
    return () => {
      if (flickTimeoutRef.current) {
        window.clearTimeout(flickTimeoutRef.current);
      }
    };
  }, []);

  function toggle() {
    if (disabled || loading) return;
    onChange?.(isRight ? "Blue" : "Red");
    triggerFlick();
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
        styles.root,
        className,
      )}
      data-side={value}
    >
      {/* Glitch flicker overlays */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 mix-blend-screen",
          styles.flicker,
        )}
        data-flick={flick || undefined}
      />

      {/* Sliding indicator */}
      <span
        aria-hidden
        className={cn(
          "absolute top-[var(--space-1)] bottom-[var(--space-1)] left-[var(--space-1)] rounded-full",
          styles.indicator,
        )}
      />

      {/* Labels */}
      <div className="relative z-10 grid w-full grid-cols-2 text-ui font-mono">
        <div
          className={cn(
            "py-[var(--space-2)] text-center transition-colors",
            styles.label,
            styles.leftLabel,
            !isRight ? "text-foreground/70" : "text-muted-foreground",
          )}
          data-active={!isRight ? "true" : undefined}
        >
          {leftLabel}
        </div>
        <div
          className={cn(
            "py-[var(--space-2)] text-center transition-colors",
            styles.label,
            styles.rightLabel,
            isRight ? "text-foreground/70" : "text-muted-foreground",
          )}
          data-active={isRight ? "true" : undefined}
        >
          {rightLabel}
        </div>
      </div>
    </button>
  );
}
