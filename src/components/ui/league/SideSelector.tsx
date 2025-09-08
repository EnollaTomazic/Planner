// src/components/ui/SideSelector.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type GameSide = "Blue" | "Red";

type Props = {
  value?: GameSide;
  onChange?: (v: GameSide) => void;
  className?: string;
  leftLabel?: string;  // defaults "Blue"
  rightLabel?: string; // defaults "Red"
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
}: Props) {
  const isRight = value === "Red";
  const [flick, setFlick] = React.useState(false);

  function toggle() {
    onChange?.(isRight ? "Blue" : "Red");
    setFlick(true);
    window.setTimeout(() => setFlick(false), 220);
  }

  function onKey(e: React.KeyboardEvent<HTMLButtonElement>) {
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
      onClick={toggle}
      onKeyDown={onKey}
      className={cn(
        "relative inline-flex select-none items-center overflow-hidden rounded-full",
        "border border-[hsl(var(--border))] bg-[hsl(var(--card))]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
        "min-w-[14rem] sm:min-w-[16rem] w-full max-w-xs h-10", // responsive default
        className
      )}
      data-side={value}
    >
      {/* Glitch flicker overlays */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0",
          "mix-blend-screen",
          flick && "opacity-100 animate-pulse"
        )}
        style={{
          background:
            "radial-gradient(120px 40px at 25% 50%, hsl(var(--accent-2)/0.08), transparent 60%), radial-gradient(120px 40px at 75% 50%, hsl(var(--lav-deep)/0.08), transparent 60%)",
        }}
      />

      {/* Sliding indicator */}
      <span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 rounded-full transition-transform duration-200 ease-[var(--ease-out, cubic-bezier(.2,.8,.2,1))]"
        style={{
          width: "calc(50% - 4px)",
          transform: `translateX(${isRight ? "calc(100% + 2px)" : "0"})`,
          background: "linear-gradient(90deg, hsl(var(--primary)/.35), hsl(var(--accent)/.35))",
          boxShadow: "0 10px 30px hsl(var(--shadow-color) / .25)",
        }}
      />

      {/* Labels */}
      <div className="relative z-10 grid w-full grid-cols-2 text-sm font-mono">
        <div
          className={cn(
            "py-2 text-center transition-colors",
            !isRight ? "text-white/70" : "text-[hsl(var(--muted-foreground))]"
          )}
          style={{ textShadow: !isRight ? "0 0 10px hsl(200 100% 60% / .35)" : undefined }}
        >
          {leftLabel}
        </div>
        <div
          className={cn(
            "py-2 text-center transition-colors",
            isRight ? "text-white/70" : "text-[hsl(var(--muted-foreground))]"
          )}
          style={{ textShadow: isRight ? "0 0 10px hsl(0 85% 60% / .35)" : undefined }}
        >
          {rightLabel}
        </div>
      </div>
    </button>
  );
}
