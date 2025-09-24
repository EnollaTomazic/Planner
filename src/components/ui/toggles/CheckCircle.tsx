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

type CCVars = React.CSSProperties & {
  "--cc-color"?: string;
  "--cc-glow"?: string;
};

type Size = "sm" | "md" | "lg";
const SIZE: Record<Size, string> = {
  sm: "h-[var(--space-6)] w-[var(--space-6)] [&_svg]:size-[var(--space-4)]",
  md: "h-[var(--space-8)] w-[var(--space-8)] [&_svg]:size-[var(--space-5)]",
  lg: "h-[var(--control-h-md)] w-[var(--control-h-md)] [&_svg]:size-[var(--space-6)]",
};

export default function CheckCircle({
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

  // Theme-driven tones
  const pink = "hsl(var(--success))";
  const glow = "hsl(var(--success-glow))";

  // Neon phase: ignite / steady-on / powerdown / off
  const effectiveHoverOrFocus = (hovered || focused) && !justCleared;
  const wantsOn = checked || effectiveHoverOrFocus;

  const prev = React.useRef(wantsOn);
  const [phase, setPhase] = React.useState<
    "off" | "ignite" | "steady-on" | "powerdown"
  >(wantsOn ? "steady-on" : "off");

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
  const ccStyle: CCVars | undefined = lit
    ? { "--cc-color": pink, "--cc-glow": glow }
    : undefined;

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
            "relative inline-grid place-items-center rounded-full transition",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:opacity-disabled disabled:pointer-events-none",
            "h-full w-full",
          )}
          data-checked={checked ? "true" : "false"}
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
              "absolute inset-0 rounded-full p-[var(--space-1)] pointer-events-none transition-opacity",
              lit ? "opacity-100" : "opacity-0",
            )}
            style={
              {
                background: `linear-gradient(90deg, ${pink}, hsl(var(--accent)), ${pink})`,
                backgroundSize: "200% 100%",
                WebkitMask:
                  "linear-gradient(hsl(var(--foreground)) 0 0) content-box, linear-gradient(hsl(var(--foreground)) 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                animation:
                  !reduceMotion && lit
                    ? "ccShift 3s linear infinite, ccFlicker 1.4s steps(1,end) infinite"
                    : undefined,
              } as React.CSSProperties
            }
          />

          {/* Scanlines */}
          <span
            aria-hidden
            className={cn(
              "absolute inset-[calc(var(--space-1)/2)] rounded-full pointer-events-none transition-opacity",
              lit ? "opacity-100" : "opacity-0",
            )}
            style={{
              background:
                "repeating-linear-gradient(0deg,hsl(var(--foreground)/0.06)_0_var(--hairline-w),transparent_var(--hairline-w)_calc(var(--space-1)-var(--hairline-w)))",
              mixBlendMode: "overlay",
              animation:
                !reduceMotion && lit
                  ? "ccScan 2.1s linear infinite"
                  : undefined,
            }}
          />

          {/* Bloom */}
          <span
            aria-hidden
            className={cn(
              "absolute -inset-[var(--space-2)] rounded-full pointer-events-none blur-md transition-opacity",
              lit ? "opacity-80" : "opacity-0",
            )}
            style={{
              background: `radial-gradient(60% 60% at 50% 50%, ${glow}, transparent 60%)`,
              mixBlendMode: "screen",
            }}
          />

          {/* Ignite / powerdown flashes */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 rounded-full",
              phase === "ignite" ? "opacity-90" : "opacity-0",
            )}
            style={{
              background:
                "radial-gradient(80% 80% at 50% 50%, hsl(var(--foreground)/0.22), transparent 60%)",
              mixBlendMode: "screen",
              animation:
                !reduceMotion && phase === "ignite"
                  ? "igniteFlicker .62s steps(18,end) 1"
                  : undefined,
            }}
          />
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 rounded-full",
              phase === "powerdown" ? "opacity-60" : "opacity-0",
            )}
            style={{
              background:
                "radial-gradient(120% 120% at 50% 50%, hsl(var(--foreground)/0.14), transparent 60%)",
              mixBlendMode: "screen",
              animation:
                !reduceMotion && phase === "powerdown"
                  ? "powerDown .36s linear 1"
                  : undefined,
            }}
          />

          {/* Tick glyph */}
          <Check
            aria-hidden
              className={cn(
              "relative z-[1] transition-all duration-200",
              lit
                ? "[color:var(--cc-color)] [filter:drop-shadow(0_0_var(--space-2)_var(--cc-glow))] opacity-100"
                : "text-muted-foreground",
            )}
            style={ccStyle}
            strokeWidth={2.5}
          />
        </button>
      </span>

      <style jsx>{`
        @keyframes ccShift {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
        @keyframes ccScan {
          0% {
            transform: translateY(-28%);
          }
          100% {
            transform: translateY(28%);
          }
        }
        @keyframes igniteFlicker {
          0% {
            opacity: 0.1;
            filter: blur(calc(var(--hairline-w) * 0.6));
          }
          8% {
            opacity: 1;
          }
          12% {
            opacity: 0.25;
          }
          20% {
            opacity: 1;
          }
          28% {
            opacity: 0.35;
          }
          40% {
            opacity: 1;
          }
          55% {
            opacity: 0.45;
            filter: blur(calc(var(--hairline-w) * 0.2));
          }
          70% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        @keyframes powerDown {
          0% {
            opacity: 0.8;
            transform: scale(1);
          }
          30% {
            opacity: 0.35;
            transform: scale(0.992) translateY(calc(var(--hairline-w) * 0.2));
          }
          60% {
            opacity: 0.12;
            transform: scale(0.985) translateY(calc(var(--hairline-w) * -0.2));
          }
          100% {
            opacity: 0;
            transform: scale(0.985);
          }
        }
      `}</style>
    </>
  );
}
