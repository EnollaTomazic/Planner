"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Spinner from "../feedback/Spinner";
import styles from "./Toggle.module.css";

type Side = "Left" | "Right";

const STATE_TOKEN_CLASSES =
  "[--toggle-hover-surface:hsl(var(--accent)/0.16)] [--toggle-active-surface:hsl(var(--accent)/0.26)] [--toggle-focus-ring:var(--ring-contrast)] [--toggle-focus-glow:var(--shadow-glow-md)]";

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
        styles.root,
        "group relative inline-flex h-[var(--control-h-md)] items-center rounded-full border",
        "w-[calc(var(--space-8)*4)]",
        "border-border bg-card overflow-hidden",
        "hover:bg-[--toggle-hover-surface] active:bg-[--toggle-active-surface]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--toggle-focus-ring)] focus-visible:shadow-[var(--toggle-focus-glow)]",
        "disabled:opacity-disabled disabled:pointer-events-none",
        "data-[loading=true]:opacity-loading data-[loading=true]:pointer-events-none",
        "before:pointer-events-none before:absolute before:inset-[calc(var(--space-1)/2)] before:rounded-full before:bg-[var(--card-overlay-scanlines)] before:opacity-0 before:transition-opacity before:duration-motion-sm before:ease-out",
        "hover:before:opacity-70 focus-visible:before:opacity-80 active:before:opacity-90",
        STATE_TOKEN_CLASSES,
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
        className={cn(
          styles.indicator,
          "absolute top-[var(--space-1)] bottom-[var(--space-1)] left-[var(--space-1)] rounded-full transition-transform duration-motion-sm ease-motion-glitch motion-reduce:transition-none group-active:scale-95 group-disabled:opacity-disabled group-data-[loading=true]:opacity-loading group-focus-visible:ring-2 group-focus-visible:ring-[var(--toggle-focus-ring)] group-hover:[--toggle-indicator-shadow:var(--shadow-glow-md)] group-active:[--toggle-indicator-shadow:var(--shadow-glow-lg)] group-focus-visible:[--toggle-indicator-shadow:var(--shadow-glow-lg)]",
        )}
      />

      {/* Labels */}
      <span
        id={leftId}
        className={cn(
          styles.leftLabel,
          "relative z-10 flex-1 text-center font-mono text-ui transition-colors",
          !isRight ? "text-foreground/70" : "text-muted-foreground",
        )}
        data-active={!isRight}
      >
        {leftLabel}
      </span>
      <span
        id={rightId}
        className={cn(
          styles.rightLabel,
          "relative z-10 flex-1 text-center font-mono text-ui transition-colors",
          isRight ? "text-foreground/70" : "text-muted-foreground",
        )}
        data-active={isRight}
      >
        {rightLabel}
      </span>
    </button>
  );
}
