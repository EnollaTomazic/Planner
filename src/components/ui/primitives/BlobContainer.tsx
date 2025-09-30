"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export type GlitchOverlayToken =
  | "glitch-overlay-button-opacity"
  | "glitch-overlay-button-opacity-reduced"
  | "glitch-overlay-opacity-card";

export type GlitchNoiseToken = "glitch-noise-level" | "glitch-static-opacity";

type StyleWithCustomVars = React.CSSProperties & {
  "--blob-overlay-target"?: string;
  "--blob-noise-target"?: string;
  "--blob-noise-active-target"?: string;
};

export type BlobContainerProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "style"
> & {
  overlayToken?: GlitchOverlayToken;
  noiseToken?: GlitchNoiseToken;
  noiseActiveToken?: GlitchNoiseToken;
  animate?: boolean;
  withNoise?: boolean;
  style?: React.CSSProperties;
};

const resolveTokenVar = (token: string) => `var(--${token})`;

const BlobContainer = React.forwardRef<HTMLSpanElement, BlobContainerProps>(
  (
    {
      className,
      overlayToken = "glitch-overlay-button-opacity",
      noiseToken = "glitch-noise-level",
      noiseActiveToken,
      animate = true,
      withNoise = true,
      style,
      ...rest
    },
    ref,
  ) => {
    const reduceMotion = useReducedMotion();
    const overlayVar = resolveTokenVar(overlayToken);
    const noiseVar = resolveTokenVar(noiseToken);
    const activeNoiseVar = noiseActiveToken
      ? resolveTokenVar(noiseActiveToken)
      : undefined;

    const mergedStyle: StyleWithCustomVars = {
      ...(style as StyleWithCustomVars | undefined),
      "--blob-overlay-target": overlayVar,
      "--blob-noise-target": noiseVar,
    };

    if (activeNoiseVar) {
      mergedStyle["--blob-noise-active-target"] = activeNoiseVar;
    } else if (!mergedStyle["--blob-noise-active-target"]) {
      mergedStyle["--blob-noise-active-target"] = noiseVar;
    }

    const blobAnimationClass = cn(
      "motion-reduce:animate-none",
      animate && !reduceMotion && "motion-safe:animate-blob-drift",
    );

    const noiseAnimationClass = cn(
      "motion-reduce:animate-none",
      animate && !reduceMotion && "motion-safe:animate-glitch-noise",
    );

    return (
      <span
        aria-hidden
        ref={ref}
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]",
          className,
        )}
        style={mergedStyle}
        {...rest}
      >
        <span
          className={cn(
            "absolute inset-0 rounded-[inherit] bg-blob-primary opacity-0 blur-[var(--space-4)] transition-opacity duration-quick ease-out",
            blobAnimationClass,
            "group-hover/glitch:opacity-[var(--blob-overlay-target)] group-focus-visible/glitch:opacity-[var(--blob-overlay-target)] group-focus-within/glitch:opacity-[var(--blob-overlay-target)] group-active/glitch:opacity-[var(--blob-overlay-target)]",
          )}
        />
        {withNoise ? (
          <span
            className={cn(
              "absolute inset-0 rounded-[inherit] bg-glitch-noise bg-cover opacity-0 mix-blend-screen transition-opacity duration-quick ease-out",
              noiseAnimationClass,
              "group-hover/glitch:opacity-[var(--blob-noise-target)] group-focus-visible/glitch:opacity-[var(--blob-noise-target)] group-focus-within/glitch:opacity-[var(--blob-noise-target)] group-active/glitch:opacity-[var(--blob-noise-active-target,var(--blob-noise-target))]",
            )}
          />
        ) : null}
      </span>
    );
  },
);

BlobContainer.displayName = "BlobContainer";

export default BlobContainer;
