import * as React from "react";

import { cn } from "@/lib/utils";

export type NoiseLevel = "none" | "subtle" | "moderate";

const noiseOverlayOpacity: Record<Exclude<NoiseLevel, "none">, string> = {
  subtle: "opacity-[var(--card-noise-opacity,0.32)]",
  moderate: "opacity-[var(--card-noise-opacity,0.48)]",
};

export interface NoiseOverlayProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  level?: NoiseLevel;
}

export function NoiseOverlay({ level = "subtle", className, ...props }: NoiseOverlayProps) {
  if (level === "none") {
    return null;
  }

  const opacityClass = noiseOverlayOpacity[level];

  return (
    <span
      aria-hidden
      data-noise-overlay="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-[-1] overflow-hidden rounded-[inherit]",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-[inherit] bg-[radial-gradient(180deg_at_16%_8%,hsl(var(--accent-1)/0.22),transparent_62%),radial-gradient(160deg_at_80%_-6%,hsl(var(--accent-2)/0.2),transparent_60%),linear-gradient(180deg,hsl(var(--card)/0.18),transparent_70%))]",
          opacityClass,
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-[inherit] bg-glitch-noise-primary mix-blend-soft-light",
          opacityClass,
        )}
      />
    </span>
  );
}
