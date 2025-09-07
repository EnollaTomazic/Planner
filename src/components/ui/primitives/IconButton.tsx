"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ButtonSize } from "./Button";

type Icon = "xs" | "sm" | "md" | "lg";

type Tone = "primary" | "accent" | "info" | "danger";
type Variant = "ring" | "glow" | "solid";

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: ButtonSize;
  iconSize?: Icon;
  tone?: Tone;
  variant?: Variant;
  /** @deprecated use size */
  circleSize?: ButtonSize;
};

const iconMap: Record<Icon, string> = {
  xs: "[&>svg]:h-3.5 [&>svg]:w-3.5",
  sm: "[&>svg]:h-4 [&>svg]:w-4",
  md: "[&>svg]:h-5 [&>svg]:w-5",
  lg: "[&>svg]:h-6 [&>svg]:w-6",
};

const sizeMap: Record<ButtonSize, string> = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-7 w-7",
};

const variantBase: Record<Variant, string> = {
  ring: "border bg-transparent hover:bg-[hsl(var(--panel)/0.45)]",
  solid: "border",
  glow: "border bg-transparent hover:bg-[hsl(var(--panel)/0.45)]",
};

const toneClasses: Record<Variant, Record<Tone, string>> = {
  ring: {
    primary:
      "border-[hsl(var(--line)/0.35)] text-[hsl(var(--foreground))]",
    accent:
      "border-[hsl(var(--accent)/0.35)] text-[hsl(var(--accent))]",
    info:
      "border-[hsl(var(--accent-2)/0.35)] text-[hsl(var(--accent-2))]",
    danger:
      "border-[hsl(var(--danger)/0.35)] text-[hsl(var(--danger))]",
  },
  solid: {
    primary:
      "border-transparent bg-[hsl(var(--foreground)/0.15)] hover:bg-[hsl(var(--foreground)/0.25)] text-[hsl(var(--foreground))]",
    accent:
      "border-transparent bg-[hsl(var(--accent)/0.15)] hover:bg-[hsl(var(--accent)/0.25)] text-[hsl(var(--accent))]",
    info:
      "border-transparent bg-[hsl(var(--accent-2)/0.15)] hover:bg-[hsl(var(--accent-2)/0.25)] text-[hsl(var(--accent-2))]",
    danger:
      "border-transparent bg-[hsl(var(--danger)/0.15)] hover:bg-[hsl(var(--danger)/0.25)] text-[hsl(var(--danger))]",
  },
  glow: {
    primary:
      "border-[hsl(var(--foreground)/0.35)] text-[hsl(var(--foreground))] shadow-[0_0_8px_hsl(var(--foreground)/0.3)]",
    accent:
      "border-[hsl(var(--accent)/0.35)] text-[hsl(var(--accent))] shadow-[0_0_8px_hsl(var(--accent)/0.3)]",
    info:
      "border-[hsl(var(--accent-2)/0.35)] text-[hsl(var(--accent-2))] shadow-[0_0_8px_hsl(var(--accent-2)/0.3)]",
    danger:
      "border-[hsl(var(--danger)/0.35)] text-[hsl(var(--danger))] shadow-[0_0_8px_hsl(var(--danger)/0.3)]",
  },
};

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      size = "sm",
      circleSize,
      iconSize = size as Icon,
      className,
      tone = "primary",
      variant = "ring",
      ...props
    },
    ref
  ) => {
    const finalSize = circleSize ?? size;
    const sizeClass = sizeMap[finalSize];
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex items-center justify-center select-none rounded-full transition focus-visible:[outline:none] focus-visible:ring-2 focus-visible:ring-[--theme-ring] active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
          variantBase[variant],
          toneClasses[variant][tone],
          sizeClass,
          iconMap[iconSize],
          className
        )}
        {...props}
      >
        {props.children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
export default IconButton;
