// src/components/ui/CheckCircle.tsx
"use client";

/**
 * CheckCircle — Lavender-Glitch concentric checkbox
 * - Accessible (role="checkbox"), Space/Enter toggles
 * - Ignite / powerdown animation to match NeonIcon / Button
 * - --success / --success-glow tokens from theme variables
 * - Deselect experience:
 *    • Any uncheck triggers a brief "justCleared" window that suppresses hover/focus glow,
 *      ensuring a visible power-down to the neutral state.
 *    • Backspace/Delete also unchecks when focused.
 */

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { Check } from "lucide-react";
import * as React from "react";

import styles from "./CheckCircle.module.css";

type Size = "sm" | "md" | "lg";
const SIZE: Record<Size, string> = {
  sm: "h-[var(--control-h-sm)] w-[var(--control-h-sm)] [&_svg]:size-[calc(var(--control-h-sm)/2)]",
  md: "h-[var(--control-h-md)] w-[var(--control-h-md)] [&_svg]:size-[calc(var(--control-h-md)/2)]",
  lg: "h-[var(--control-h-lg)] w-[var(--control-h-lg)] [&_svg]:size-[calc(var(--control-h-lg)/2)]",
};

export function CheckCircle({
  checked,
  onChange = () => {},
  size = "sm",
  className,
  disabled = false,
  "aria-label": ariaLabel = "Toggle",
}: {
  checked: boolean;
  onChange?: (next: boolean) => void;
  size?: Size;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  const justClearedTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const igniteTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearJustClearedTimeout = React.useCallback(() => {
    if (justClearedTimeoutRef.current !== null) {
      clearTimeout(justClearedTimeoutRef.current);
      justClearedTimeoutRef.current = null;
    }
  }, []);

  const clearIgniteTimeout = React.useCallback(() => {
    if (igniteTimeoutRef.current !== null) {
      clearTimeout(igniteTimeoutRef.current);
      igniteTimeoutRef.current = null;
    }
  }, []);

  // Hover/focus tracking
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  // Brief suppression after an uncheck so it visibly powers down
  const [justCleared, setJustCleared] = React.useState(false);
  const markJustCleared = React.useCallback(() => {
    setJustCleared(true);
    // Reset hover/focus and blur so we guarantee the off animation shows
    setHovered(false);
    setFocused(false);
    btnRef.current?.blur();
    clearJustClearedTimeout();
    justClearedTimeoutRef.current = setTimeout(() => {
      setJustCleared(false);
      justClearedTimeoutRef.current = null;
    }, 420);
    return clearJustClearedTimeout;
  }, [clearJustClearedTimeout]);

  // If our checked state flips off from an external source while hovered or
  // focused, ensure we still run the "just cleared" power-down sequence so the
  // neon rim doesn't remain lit.
  const prevChecked = React.useRef(checked);
  React.useEffect(() => {
    let cleanup: (() => void) | undefined;
    if (prevChecked.current && !checked && !justCleared) {
      cleanup = markJustCleared();
    }
    prevChecked.current = checked;
    return cleanup;
  }, [checked, markJustCleared, justCleared]);

  // Neon phase: ignite / steady-on / powerdown / off
  const effectiveHoverOrFocus = (hovered || focused) && !justCleared;
  const wantsOn = checked || effectiveHoverOrFocus;

  const prev = React.useRef(wantsOn);
  const [phase, setPhase] = React.useState<"off" | "ignite" | "steady-on" | "powerdown">(
    wantsOn ? "steady-on" : "off",
  );

  React.useEffect(() => {
    if (wantsOn !== prev.current) {
      if (wantsOn) {
        setPhase("ignite");
        const t = setTimeout(() => setPhase("steady-on"), 620);
        prev.current = wantsOn;
        return () => clearTimeout(t);
      } else {
        setPhase("powerdown");
        const t = setTimeout(() => setPhase("off"), 360);
        prev.current = wantsOn;
        return () => clearTimeout(t);
      }
    }
    prev.current = wantsOn;
  }, [wantsOn]);

  const retriggerIgnite = React.useCallback(() => {
    setPhase("ignite");
    clearIgniteTimeout();
    igniteTimeoutRef.current = setTimeout(() => {
      setPhase(wantsOn ? "steady-on" : "off");
      igniteTimeoutRef.current = null;
    }, 620);
  }, [clearIgniteTimeout, wantsOn]);

  React.useEffect(
    () => () => {
      clearIgniteTimeout();
      clearJustClearedTimeout();
    },
    [clearIgniteTimeout, clearJustClearedTimeout],
  );

  function onKey(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if ((e.key === "Backspace" || e.key === "Delete") && checked) {
      e.preventDefault();
      onChange(false);
      markJustCleared();
      return;
    }
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange(!checked);
      if (checked) markJustCleared();
    }
  }

  const lit = phase === "ignite" || phase === "steady-on";

  return (
    <>
      <span
        className={cn(
          "relative inline-grid place-items-center",
          SIZE[size],
          className,
        )}
      >
        <button
          ref={btnRef}
          type="button"
          role="checkbox"
          aria-checked={checked}
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            onChange(!checked);
            if (checked) markJustCleared();
          }}
          onKeyDown={onKey}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPointerDown={retriggerIgnite}
          className={cn(
            styles.button,
            "relative inline-grid place-items-center rounded-full transition",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:opacity-disabled disabled:pointer-events-none",
            "h-full w-full",
          )}
          data-checked={checked ? "true" : "false"}
          data-phase={phase}
          data-lit={lit}
        >
          {/* Base */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full ring-1 ring-border bg-card/35"
          />

          {/* Neon rim */}
          <span
            aria-hidden
            className={cn(
              styles.rim,
              !reduceMotion && lit && styles.rimAnimated,
            )}
          />

          {/* Scanlines */}
          <span
            aria-hidden
            className={cn(
              styles.scanlines,
              !reduceMotion && lit && styles.scanlinesAnimated,
            )}
          />

          {/* Bloom */}
          <span aria-hidden className={styles.bloom} />

          {/* Ignite / powerdown flashes */}
          <span
            aria-hidden
            className={cn(
              styles.ignite,
              !reduceMotion && phase === "ignite" && styles.igniteAnimated,
            )}
          />
          <span
            aria-hidden
            className={cn(
              styles.powerdown,
              !reduceMotion && phase === "powerdown" && styles.powerdownAnimated,
            )}
          />

          {/* Tick glyph */}
          <Check
            aria-hidden
            className={cn(styles.check, "text-muted-foreground")}
            strokeWidth="var(--icon-stroke-150, 2.5)"
          />
        </button>
      </span>
    </>
  );
}
