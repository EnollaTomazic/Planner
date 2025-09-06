// src/components/ui/CheckCircle.tsx
"use client";

/**
 * CheckCircle — Lavender-Glitch concentric checkbox
 * - Accessible (role="checkbox"), Space/Enter toggles
 * - Ignite / powerdown animation to match NeonIcon / Button
 * - --success / --success-glow tokens with fallbacks
 * - Deselect experience:
 *    • Any uncheck triggers a brief "justCleared" window that suppresses hover/focus glow,
 *      ensuring a visible power-down to the neutral state.
 *    • Clear affordances: mini × button, Alt/Option-click, Backspace/Delete.
 */

import { cn } from "@/lib/utils";
import * as React from "react";

type CCVars = React.CSSProperties & {
  "--cc-color"?: string;
  "--cc-glow"?: string;
};

type Size = "sm" | "md" | "lg";
const SIZE: Record<Size, string> = {
  sm: "h-6 w-6 [&_svg]:h-3.5 [&_svg]:w-3.5",
  md: "h-7 w-7 [&_svg]:h-4   [&_svg]:w-4",
  lg: "h-9 w-9 [&_svg]:h-5   [&_svg]:w-5",
};

export default function CheckCircle({
  checked,
  onChange = () => {},
  size = "md",
  className,
  disabled = false,
  clearable = false,
  onClear,
  altClears = true,
  "aria-label": ariaLabel = "Toggle",
}: {
  checked: boolean;
  onChange?: (next: boolean) => void;
  size?: Size;
  className?: string;
  disabled?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  altClears?: boolean;
  "aria-label"?: string;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);

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
    const t = setTimeout(() => setJustCleared(false), 420);
    return () => clearTimeout(t);
  }, []);

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
  const pink = "hsl(var(--success,316 92% 70%))";
  const glow = "hsl(var(--success-glow,316 92% 52% / 0.6))";

  // Neon phase: ignite / steady-on / powerdown / off
  const effectiveHoverOrFocus = (hovered || focused) && !justCleared;
  const wantsOn = checked || effectiveHoverOrFocus;

  const prev = React.useRef(wantsOn);
  const [phase, setPhase] = React.useState<"off" | "ignite" | "steady-on" | "powerdown">(
    wantsOn ? "steady-on" : "off"
  );

  React.useEffect(() => {
    if (wantsOn !== prev.current) {
      if (wantsOn) {
        setPhase("ignite");
        const t = window.setTimeout(() => setPhase("steady-on"), 620);
        prev.current = wantsOn;
        return () => window.clearTimeout(t);
      } else {
        setPhase("powerdown");
        const t = window.setTimeout(() => setPhase("off"), 360);
        prev.current = wantsOn;
        return () => window.clearTimeout(t);
      }
    }
    prev.current = wantsOn;
  }, [wantsOn]);

  function retriggerIgnite() {
    setPhase("ignite");
    window.setTimeout(() => setPhase(wantsOn ? "steady-on" : "off"), 620);
  }

  function clearSelection() {
    onClear?.();
    onChange(false);
    markJustCleared();
  }

  function onKey(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if ((e.key === "Backspace" || e.key === "Delete") && checked) {
      e.preventDefault();
      clearSelection();
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
      <span className={cn("relative inline-grid place-items-center", SIZE[size], className)}>
        <button
          ref={btnRef}
          type="button"
          role="checkbox"
          aria-checked={checked}
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={(e) => {
            if (disabled) return;
            if (altClears && e.altKey && checked) {
              clearSelection();
              return;
            }
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
            "relative inline-grid place-items-center rounded-full outline-none transition",
            "focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
            "disabled:opacity-50 disabled:pointer-events-none",
            "h-full w-full"
          )}
          data-checked={checked ? "true" : "false"}
        >
          {/* Base */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full ring-1 ring-[hsl(var(--border))] bg-[hsl(var(--card)/.35)]"
          />

          {/* Neon rim */}
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 rounded-full p-[1.5px] pointer-events-none transition-opacity",
              lit ? "opacity-100" : "opacity-0"
            )}
            style={{
              background: `linear-gradient(90deg, ${pink}, hsl(var(--accent)), ${pink})`,
              backgroundSize: "200% 100%",
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              animation: lit ? "ccShift 3s linear infinite, ccFlicker 1.4s steps(1,end) infinite" : undefined,
            } as React.CSSProperties}
          />

          {/* Scanlines */}
          <span
            aria-hidden
            className={cn(
              "absolute inset-[2px] rounded-full pointer-events-none transition-opacity",
              lit ? "opacity-100" : "opacity-0"
            )}
            style={{
              background:
                "repeating-linear-gradient(0deg, rgba(255,255,255,.06) 0 1px, transparent 1px 3px)",
              mixBlendMode: "overlay",
              animation: lit ? "ccScan 2.1s linear infinite" : undefined,
            }}
          />

          {/* Bloom */}
          <span
            aria-hidden
            className={cn(
              "absolute -inset-2 rounded-full pointer-events-none blur-[10px] transition-opacity",
              lit ? "opacity-80" : "opacity-0"
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
              phase === "ignite" ? "opacity-90" : "opacity-0"
            )}
            style={{
              background:
                "radial-gradient(80% 80% at 50% 50%, rgba(255,255,255,.22), transparent 60%)",
              mixBlendMode: "screen",
              animation: phase === "ignite" ? "igniteFlicker .62s steps(18,end) 1" : undefined,
            }}
          />
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 rounded-full",
              phase === "powerdown" ? "opacity-60" : "opacity-0"
            )}
            style={{
              background:
                "radial-gradient(120% 120% at 50% 50%, rgba(255,255,255,.14), transparent 60%)",
              mixBlendMode: "screen",
              animation: phase === "powerdown" ? "powerDown .36s linear 1" : undefined,
            }}
          />

          {/* Tick glyph */}
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className={cn(
              "relative z-[1] transition-all duration-200",
              lit
                ? "[color:var(--cc-color)] [filter:drop-shadow(0_0_8px_var(--cc-glow))] opacity-100"
                : "text-muted-foreground/60 opacity-80"
            )}
            style={ccStyle}
          >
            <path
              d="M20 7L10 17l-4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Mini clear button */}
        {clearable && checked && !disabled && (
          <button
            type="button"
            aria-label="Clear selection"
            title="Clear"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              clearSelection();
            }}
            className={cn(
              "absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full",
              "border border-[hsl(var(--card-hairline))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]",
              "shadow-sm hover:shadow-[0_0_10px_hsl(var(--ring)/.45)]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
            )}
          >
            <svg viewBox="0 0 18 18" className="h-3.5 w-3.5" aria-hidden>
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span aria-hidden className="ccx-chroma" />
            <span aria-hidden className="ccx-flicker" />
          </button>
        )}
      </span>

      <style jsx>{`
        @keyframes ccShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes ccScan {
          0% { transform: translateY(-28%); }
          100% { transform: translateY(28%); }
        }
        @keyframes igniteFlicker {
          0%{ opacity:.1; filter:blur(.6px) }
          8%{ opacity:1 }
          12%{ opacity:.25 }
          20%{ opacity:1 }
          28%{ opacity:.35 }
          40%{ opacity:1 }
          55%{ opacity:.45; filter:blur(.2px) }
          70%{ opacity:1 }
          100%{ opacity:0 }
        }
        @keyframes powerDown {
          0%{ opacity:.8; transform:scale(1) }
          30%{ opacity:.35; transform:scale(.992) translateY(.2px) }
          60%{ opacity:.12; transform:scale(.985) translateY(-.2px) }
          100%{ opacity:0; transform:scale(.985) }
        }
        .ccx-chroma,
        .ccx-flicker {
          position: absolute;
          inset: -1px;
          border-radius: 9999px;
          pointer-events: none;
        }
        .ccx-chroma {
          padding: 1px;
          background: conic-gradient(
            from 180deg,
            hsl(262 83% 58% / .0),
            hsl(262 83% 58% / .6),
            hsl(192 90% 50% / .6),
            hsl(320 85% 60% / .6),
            hsl(262 83% 58% / .0)
          );
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          opacity: .5;
          animation: ccxHue 6s linear infinite, ccxJit 2s steps(6,end) infinite;
        }
        .ccx-flicker {
          inset: -2px;
          background: radial-gradient(120% 120% at 50% 50%, hsl(var(--ring)/.18), transparent 60%);
          filter: blur(6px);
          mix-blend-mode: screen;
          opacity: .25;
          animation: ccxFlick 3s steps(20,end) infinite;
        }
        @keyframes ccxHue { to { filter: hue-rotate(360deg) } }
        @keyframes ccxJit {
          0%,100% { transform: translate(0,0) }
          50% { transform: translate(.2px,.2px) }
        }
        @keyframes ccxFlick {
          0%, 8%, 10%, 100% { opacity: .18; }
          9% { opacity: .45; }
          44% { opacity: .24; }
          45% { opacity: .42; }
          78% { opacity: .22; }
        }
      `}</style>
    </>
  );
}
