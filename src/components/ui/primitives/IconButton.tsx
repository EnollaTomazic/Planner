"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonSizes, type ButtonSize } from "./Button";

export type IconButtonSize = ButtonSize | "xl" | "xs";
type Icon = "xs" | "sm" | "md" | "lg" | "xl";

type Tone = "primary" | "accent" | "info" | "danger";
type Variant = "ring" | "glow" | "solid";

type ButtonAttributes = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "aria-labelledby" | "title"
>;

type AccessibleLabel =
  | { "aria-label": string; "aria-labelledby"?: string; title?: string }
  | { "aria-label"?: string; "aria-labelledby": string; title?: string }
  | { "aria-label"?: string; "aria-labelledby"?: string; title: string };

export type IconButtonProps = ButtonAttributes &
  {
    size?: IconButtonSize;
    iconSize?: Icon;
    tone?: Tone;
    variant?: Variant;
  } &
  AccessibleLabel;

const iconMap: Record<Icon, string> = {
  xs: "[&>svg]:h-5 [&>svg]:w-5",
  sm: "[&>svg]:h-6 [&>svg]:w-6",
  md: "[&>svg]:h-7 [&>svg]:w-7",
  lg: "[&>svg]:h-8 [&>svg]:w-8",
  xl: "[&>svg]:h-9 [&>svg]:w-9",
};

const getSizeClass = (s: IconButtonSize) => {
  const toNum = (h: string) => Number(h.replace("h-", ""));
  if (s === "xs") {
    const n = toNum(buttonSizes.sm.height) - 1;
    return `h-${n} w-${n}`;
  }
  if (s === "xl") {
    const n = toNum(buttonSizes.lg.height) + 1;
    return `h-${n} w-${n}`;
  }
  const n = toNum(buttonSizes[s as ButtonSize].height);
  return `h-${n} w-${n}`;
};

const variantBase: Record<Variant, string> = {
  ring: "border bg-transparent hover:bg-panel/45",
  solid: "border",
  glow: "border bg-transparent hover:bg-panel/45 shadow-[0_0_8px_currentColor]",
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
      "border-[hsl(var(--foreground)/0.35)] text-[hsl(var(--foreground))]",
    accent:
      "border-[hsl(var(--accent)/0.35)] text-[hsl(var(--accent))]",
    info:
      "border-[hsl(var(--accent-2)/0.35)] text-[hsl(var(--accent-2))]",
    danger:
      "border-[hsl(var(--danger)/0.35)] text-[hsl(var(--danger))]",
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
      children,
      ...rest
    },
    ref,
  ) => {
    const sizeClass = sizeMap[size];
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
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
export default IconButton;
