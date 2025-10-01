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
    const prefersReducedMotion = useReducedMotion();
    const [forcedReduceMotion, setForcedReduceMotion] = React.useState(() => {
      if (typeof document === "undefined") {
        return false;
      }

      return document.documentElement.classList.contains("no-animations");
    });
    React.useEffect(() => {
      if (typeof document === "undefined") {
        return;
      }

      const root = document.documentElement;
      const syncForcedReduceMotion = () => {
        setForcedReduceMotion(root.classList.contains("no-animations"));
      };

      syncForcedReduceMotion();

      if (typeof MutationObserver === "undefined") {
        return;
      }

      const observer = new MutationObserver(syncForcedReduceMotion);
      observer.observe(root, { attributes: true, attributeFilter: ["class"] });

      return () => {
        observer.disconnect();
      };
    }, []);
    const shouldReduceMotion = prefersReducedMotion || forcedReduceMotion;
    const overlayVar = resolveTokenVar(overlayToken);
    const noiseVar = resolveTokenVar(noiseToken);
    const activeNoiseVar = noiseActiveToken
      ? resolveTokenVar(noiseActiveToken)
      : undefined;
    const overlayTarget = `calc(var(--glitch-intensity-subtle, 1) * ${overlayVar})`;
    const noiseTarget = `calc(var(--glitch-intensity-subtle, 1) * ${noiseVar})`;
    const activeNoiseTarget = activeNoiseVar
      ? `calc(var(--glitch-intensity, 1) * ${activeNoiseVar})`
      : `calc(var(--glitch-intensity, 1) * ${noiseVar})`;

    const mergedStyle: StyleWithCustomVars = {
      ...(style as StyleWithCustomVars | undefined),
      "--blob-overlay-target": overlayTarget,
      "--blob-noise-target": noiseTarget,
    };

    if (!mergedStyle["--blob-noise-active-target"]) {
      mergedStyle["--blob-noise-active-target"] = activeNoiseTarget;
    }

    const blobAnimationClass = cn(
      "motion-reduce:animate-none",
      animate && !shouldReduceMotion && "motion-safe:animate-blob-drift",
    );

    const noiseAnimationClass = cn(
      "motion-reduce:animate-none",
      animate && !shouldReduceMotion && "motion-safe:animate-glitch-noise",
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
            "absolute inset-0 rounded-[inherit] bg-gradient-blob-primary opacity-0 blur-[var(--space-4)] transition-opacity duration-quick ease-out",
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
