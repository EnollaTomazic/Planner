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
  xs: "[&>svg]:size-4",
  sm: "[&>svg]:size-5",
  md: "[&>svg]:size-6",
  lg: "[&>svg]:size-7",
  xl: "[&>svg]:size-8",
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
  ring: "border bg-card/35 hover:bg-[--hover] [--hover:hsl(var(--panel)/0.45)]",
  solid: "border",
  glow: "border bg-card/35 hover:bg-[--hover] [--hover:hsl(var(--panel)/0.45)] shadow-[0_0_8px_currentColor]",
};

const toneClasses: Record<Variant, Record<Tone, string>> = {
  ring: {
    primary: "border-line/35 text-foreground",
    accent: "border-accent/35 text-accent",
    info: "border-accent-2/35 text-accent-2",
    danger: "border-danger/35 text-danger",
  },
  solid: {
    primary:
      "border-transparent bg-foreground/15 text-foreground [--hover:hsl(var(--foreground)/0.25)] [--active:hsl(var(--foreground)/0.35)]",
    accent:
      "border-transparent bg-accent/15 text-accent [--hover:hsl(var(--accent)/0.25)] [--active:hsl(var(--accent)/0.35)]",
    info: "border-transparent bg-accent-2/15 text-accent-2 [--hover:hsl(var(--accent-2)/0.25)] [--active:hsl(var(--accent-2)/0.35)]",
    danger:
      "border-transparent bg-danger/15 text-danger [--hover:hsl(var(--danger)/0.25)] [--active:hsl(var(--danger)/0.35)]",
  },
  glow: {
    primary: "border-foreground/35 text-foreground",
    accent: "border-accent/35 text-accent",
    info: "border-accent-2/35 text-accent-2",
    danger: "border-danger/35 text-danger",
  },
};

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      size = "md",
      iconSize = size as Icon,
      className,
      tone = "primary",
      variant = "ring",
      ...props
    },
    ref,
  ) => {
    const sizeClass = getSizeClass(size);
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex items-center justify-center select-none rounded-full transition hover:bg-[--hover] active:bg-[--active] active:scale-95 focus-visible:[outline:none] focus-visible:ring-2 focus-visible:ring-[--focus] disabled:opacity-[var(--disabled)] disabled:pointer-events-none data-[loading=true]:opacity-[var(--loading)]",
          variantBase[variant],
          toneClasses[variant][tone],
          sizeClass,
          iconMap[iconSize],
          className,
        )}
        {...props}
      >
        {props.children}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
export default IconButton;
