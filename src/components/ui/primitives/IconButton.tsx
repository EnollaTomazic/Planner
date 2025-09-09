"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ButtonSize } from "./Button";

export type IconButtonSize = ButtonSize | "xl" | "xs";
type Icon = "xs" | "sm" | "md" | "lg" | "xl";

type Tone = "primary" | "accent" | "info" | "danger";
type Variant = "ring" | "glow" | "solid";

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: IconButtonSize;
  iconSize?: Icon;
  tone?: Tone;
  variant?: Variant;
};

const iconMap: Record<Icon, string> = {
  xs: "[&>svg]:h-6 [&>svg]:w-6",
  sm: "[&>svg]:h-7 [&>svg]:w-7",
  md: "[&>svg]:h-8 [&>svg]:w-8",
  lg: "[&>svg]:h-9 [&>svg]:w-9",
  xl: "[&>svg]:h-10 [&>svg]:w-10",
};
const getSizeClass = (s: IconButtonSize) => {
  const sizeMap: Record<IconButtonSize, string> = {
    xs: "h-8 w-8",
    sm: "h-9 w-9",
    md: "h-10 w-10",
    lg: "h-11 w-11",
    xl: "h-12 w-12",
  };
  return sizeMap[s];
};

const variantBase: Record<Variant, string> = {
  ring: "border bg-transparent hover:bg-panel/45",
  solid: "border",
  glow: "border bg-transparent hover:bg-panel/45 shadow-[0_0_8px_currentColor]",
};

const toneClasses: Record<Variant, Record<Tone, string>> = {
  ring: {
    primary:
      "border-line/35 text-foreground",
    accent:
      "border-accent/35 text-accent",
    info:
      "border-accent-2/35 text-accent-2",
    danger:
      "border-danger/35 text-danger",
  },
  solid: {
    primary:
      "border-transparent bg-foreground/15 hover:bg-foreground/25 text-foreground",
    accent:
      "border-transparent bg-accent/15 hover:bg-accent/25 text-accent",
    info:
      "border-transparent bg-accent-2/15 hover:bg-accent-2/25 text-accent-2",
    danger:
      "border-transparent bg-danger/15 hover:bg-danger/25 text-danger",
  },
  glow: {
    primary:
      "border-foreground/35 text-foreground",
    accent:
      "border-accent/35 text-accent",
    info:
      "border-accent-2/35 text-accent-2",
    danger:
      "border-danger/35 text-danger",
  },
};

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { size = "md", iconSize = size as Icon, className, tone = "primary", variant = "ring", ...props },
    ref
  ) => {
    const sizeClass = getSizeClass(size);
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
