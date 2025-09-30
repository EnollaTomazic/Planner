import * as React from "react";

import { cn } from "@/lib/utils";

export type GlitchOverlayOptions = {
  text?: string;
  reduceMotion?: boolean;
  className?: string;
};

export function renderGlitchOverlay({
  text,
  reduceMotion = false,
  className,
}: GlitchOverlayOptions): React.ReactElement {
  const blobAnimationClass = reduceMotion
    ? "motion-safe:animate-none motion-reduce:animate-none"
    : "motion-safe:animate-blob-drift motion-reduce:animate-none";
  const noiseAnimationClass = reduceMotion
    ? "motion-safe:animate-none motion-reduce:animate-none"
    : "motion-safe:animate-glitch-noise motion-reduce:animate-none";

  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-[inherit]",
        className,
      )}
    >
      <span
        className={cn(
          "absolute inset-[-40%] rounded-[inherit] bg-blob-primary opacity-0 blur-3xl",
          "transition-opacity duration-200 ease-out",
          "group-hover/glitch:opacity-80 group-active/glitch:opacity-90",
          "group-focus-visible/glitch:opacity-100 group-focus-within/glitch:opacity-100",
          blobAnimationClass,
        )}
      />
      <span
        className={cn(
          "absolute inset-0 rounded-[inherit] bg-glitch-noise bg-[length:160%] bg-center mix-blend-screen opacity-0",
          "transition-opacity duration-200 ease-out",
          "group-hover/glitch:opacity-50 group-active/glitch:opacity-60",
          "group-focus-visible/glitch:opacity-70 group-focus-within/glitch:opacity-70",
          noiseAnimationClass,
        )}
      />
      {text ? (
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center text-center text-[inherit] font-[inherit] tracking-[inherit]",
            "mix-blend-screen opacity-0",
            "transition-opacity duration-200 ease-out",
            "group-hover/glitch:opacity-90 group-active/glitch:opacity-100",
            "group-focus-visible/glitch:opacity-100 group-focus-within/glitch:opacity-100",
          )}
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}
