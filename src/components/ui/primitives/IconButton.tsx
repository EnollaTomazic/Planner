"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonSizes, type ButtonSize } from "./button";

type Icon = "xs" | "sm" | "md" | "lg";

type Tone = "primary" | "accent" | "info" | "danger";
type Variant = "ring" | "glow" | "solid";

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: ButtonSize;
  iconSize?: Icon;
  tone?: Tone;
  active?: boolean;
  fx?: boolean;
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

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { size = "md", circleSize, iconSize = size, className, ...rest },
    ref
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tone: _tone, active: _active, fx: _fx, variant: _variant, ...props } = rest;
    const finalSize = circleSize ?? size;
    const h = buttonSizes[finalSize].height;
    const sizeClass = `${h} ${h.replace("h-", "w-")}`;
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex items-center justify-center select-none rounded-full border border-[hsl(var(--line)/0.35)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/.6)] bg-transparent hover:bg-[hsl(var(--panel)/0.45)] active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
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
