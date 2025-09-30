import * as React from "react";

import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

import Button, { type ButtonProps } from "./Button";
import type { GlitchOverlayToken } from "./BlobContainer";

type GlitchButtonBaseProps = Omit<
  ButtonProps,
  "variant" | "glitch" | "glitchIntensity"
>;

export interface GlitchButtonProps extends GlitchButtonBaseProps {
  overlayToken?: GlitchOverlayToken;
}

const GlitchButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  GlitchButtonProps
>(
  (
    {
      className,
      tone = "accent",
      overlayToken = "glitch-overlay-button-opacity",
      tactile = true,
      size = "md",
      ...rest
    },
    ref,
  ) => {
    const reduceMotion = usePrefersReducedMotion();
    const buttonProps = rest as ButtonProps;

    return (
      <Button
        {...buttonProps}
        ref={ref}
        size={size}
        tone={tone}
        tactile={tactile}
        variant="secondary"
        glitch
        glitchIntensity={overlayToken}
        className={cn(
          "group/glitch relative isolate overflow-hidden border border-card-hairline/60",
          "bg-[hsl(var(--card)/0.72)] backdrop-blur-[var(--space-2)]",
          "px-[var(--space-6)] font-semibold tracking-[-0.01em]",
          "transition-[transform,box-shadow,filter] duration-quick ease-out motion-reduce:transition-none",
          !reduceMotion &&
            "motion-safe:hover:-translate-y-[var(--spacing-0-25)] motion-safe:active:translate-y-[var(--spacing-0-25)]",
          className,
        )}
      />
    );
  },
);

GlitchButton.displayName = "GlitchButton";

export default GlitchButton;
