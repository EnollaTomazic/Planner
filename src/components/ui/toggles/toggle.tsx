"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Side = "Left" | "Right";

export default function Toggle({
  leftLabel = "Left",
  rightLabel = "Right",
  value = "Left",
  onChange,
  className,
  disabled = false,
  loading = false,
}: {
  leftLabel?: string;
  rightLabel?: string;
  value?: Side;
  onChange?: (v: Side) => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  const isRight = value === "Right";

  function toggle() {
    if (disabled || loading) return;
    onChange?.(isRight ? "Left" : "Right");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled || loading) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
    if (e.key === "ArrowLeft") onChange?.("Left");
    if (e.key === "ArrowRight") onChange?.("Right");
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isRight}
      aria-label={`${leftLabel} / ${rightLabel}`}
      disabled={disabled}
      data-loading={loading || undefined}
      onClick={toggle}
      onKeyDown={onKeyDown}
      className={cn(
        "relative inline-flex w-[16rem] h-10 items-center rounded-full border",
        "border-border bg-card overflow-hidden",
        "hover:bg-[--hover] active:bg-[--active]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:opacity-[var(--disabled)] disabled:pointer-events-none",
        "data-[loading=true]:opacity-[var(--loading)] data-[loading=true]:pointer-events-none",
        "[--hover:hsl(var(--accent)/0.08)] [--active:hsl(var(--accent)/0.15)]",
        className,
      )}
      data-side={value}
    >
      {/* Sliding indicator */}
      <span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 rounded-full transition-transform duration-200 ease-[var(--ease-out,cubic-bezier(.2,.8,.2,1))]"
        style={{
          width: "calc(50% - 4px)",
          transform: `translateX(${isRight ? "calc(100% + 2px)" : "0"})`,
          background:
            "linear-gradient(90deg, hsl(var(--primary)/.35), hsl(var(--accent)/.35))",
          boxShadow: "0 10px 30px hsl(var(--shadow-color) / .25)",
        }}
      />

      {/* Labels */}
      <span
        className={cn(
          "relative z-10 flex-1 text-center font-mono text-sm transition-colors",
          !isRight ? "text-foreground/70" : "text-muted-foreground",
        )}
        style={{
          textShadow: !isRight ? "0 0 10px hsl(200 100% 60% / .35)" : undefined,
        }}
      >
        {leftLabel}
      </span>
      <span
        className={cn(
          "relative z-10 flex-1 text-center font-mono text-sm transition-colors",
          isRight ? "text-foreground/70" : "text-muted-foreground",
        )}
        style={{
          textShadow: isRight ? "0 0 10px hsl(0 85% 60% / .35)" : undefined,
        }}
      >
        {rightLabel}
      </span>
    </button>
  );
}
