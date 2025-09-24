"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import Spinner from "../feedback/Spinner";

type Side = "Left" | "Right";

type ToggleLabelStyle = CSSProperties & {
  "--glow-active"?: string;
};

type ToggleIndicatorStyle = CSSProperties & {
  "--toggle-indicator-gradient"?: string;
};

const createLabelGlow = (color: string): ToggleLabelStyle => ({
  "--glow-active": color,
  textShadow: "var(--shadow-glow-md)",
});

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
  const id = React.useId();
  const leftId = `${id}-left`;
  const rightId = `${id}-right`;
  const indicatorStyle: ToggleIndicatorStyle = {
    width: "calc(50% - var(--space-1))",
    transform: `translateX(${isRight ? "100%" : "0"})`,
    "--toggle-indicator-gradient": "var(--seg-active-grad)",
  };
  const leftLabelStyle = !isRight
    ? createLabelGlow("hsl(var(--team-blue) / 0.35)")
    : undefined;
  const rightLabelStyle = isRight
    ? createLabelGlow("hsl(var(--team-red) / 0.35)")
    : undefined;

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
      aria-labelledby={`${leftId} ${rightId}`}
      aria-busy={loading || undefined}
      disabled={disabled}
      data-loading={loading || undefined}
      onClick={toggle}
      onKeyDown={onKeyDown}
      className={cn(
        "group relative inline-flex h-[var(--control-h-md)] items-center rounded-full border",
        "w-[calc(var(--space-8)*4)]",
        "border-border bg-card overflow-hidden",
        "hover:bg-[--hover] active:bg-[--active]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:opacity-disabled disabled:pointer-events-none",
        "data-[loading=true]:opacity-loading data-[loading=true]:pointer-events-none",
        "[--hover:hsl(var(--accent)/0.08)] [--active:hsl(var(--accent)/0.15)]",
        className,
      )}
      data-side={value}
    >
      {loading ? (
        <span className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <Spinner size="sm" className="border-border border-t-transparent opacity-80" />
        </span>
      ) : null}
      {/* Sliding indicator */}
      <span
        aria-hidden
        className="absolute top-[var(--space-1)] bottom-[var(--space-1)] left-[var(--space-1)] rounded-full transition-transform duration-quick ease-snap motion-reduce:transition-none group-active:scale-95 group-disabled:opacity-disabled group-data-[loading=true]:opacity-loading group-focus-visible:ring-2 group-focus-visible:ring-ring [background:var(--toggle-indicator-gradient,var(--seg-active-grad))] shadow-[var(--shadow-neo-soft)]"
        style={indicatorStyle}
      />

      {/* Labels */}
      <span
        id={leftId}
        className={cn(
          "relative z-10 flex-1 text-center font-mono text-ui transition-colors",
          !isRight ? "text-foreground/70" : "text-muted-foreground",
        )}
        style={leftLabelStyle}
      >
        {leftLabel}
      </span>
      <span
        id={rightId}
        className={cn(
          "relative z-10 flex-1 text-center font-mono text-ui transition-colors",
          isRight ? "text-foreground/70" : "text-muted-foreground",
        )}
        style={rightLabelStyle}
      >
        {rightLabel}
      </span>
    </button>
  );
}
