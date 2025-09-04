/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Size = "xs" | "sm";
type Tone =
  | "neutral"
  | "primary"
  | "accent"
  | "top"
  | "jungle"
  | "mid"
  | "adc"
  | "support";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  size?: Size;
  tone?: Tone;
  interactive?: boolean;
  selected?: boolean;
  glitch?: boolean;
  as?: "span" | "button";
};

const sizeMap: Record<Size, string> = {
  xs: "px-2 py-[3px] text-[11px] leading-none",
  sm: "px-2.5 py-[5px] text-[12px] leading-none",
};

const toneBorder: Record<Tone, string> = {
  neutral: "border-[hsl(var(--card-hairline))]",
  primary: "border-[hsl(var(--ring))]",
  accent: "border-[var(--accent-overlay)]",
  top: "border-[hsl(var(--tone-top))]",
  jungle: "border-[hsl(var(--tone-jg))]",
  mid: "border-[hsl(var(--tone-mid))]",
  adc: "border-[hsl(var(--tone-adc))]",
  support: "border-[hsl(var(--tone-sup))]",
};

export default function Badge({
  size = "sm",
  tone = "neutral",
  interactive = false,
  selected = false,
  glitch = false,
  as = "span",
  className,
  children,
  ...rest
}: BadgeProps) {
  const Comp = as as any;

  return (
    <Comp
      data-selected={selected ? "true" : undefined}
      className={cn(
        "inline-flex max-w-full items-center gap-[6px] whitespace-nowrap rounded-full font-medium tracking-[-0.01em]",
        "border bg-[color-mix(in_oklab,hsl(var(--muted))_18%,transparent)]",
        "shadow-[inset_0_1px_0_hsl(var(--foreground)/.06),0_0_0_.5px_hsl(var(--card-hairline)/.35),0_10px_20px_hsl(var(--shadow-color)/.18)]",
        "transition-[background,box-shadow,transform] duration-150 ease-out",
        sizeMap[size],
        toneBorder[tone],
        interactive && "cursor-pointer",
        interactive && "hover:bg-[color-mix(in_oklab,hsl(var(--muted))_28%,transparent)]",
        selected &&
          "bg-[color-mix(in_oklab,hsl(var(--primary-soft))_36%,transparent)] border-[var(--ring-contrast)] shadow-[0_0_0_1px_var(--ring-contrast)_inset,0_8px_22px_var(--glow-active)] text-[var(--text-on-accent)]",
        glitch &&
          "shadow-[0_0_0_1px_hsl(var(--card-hairline))_inset,0_0_16px_var(--glow-active)] hover:shadow-[0_0_0_1px_var(--ring-contrast)_inset,0_0_20px_var(--glow-active)]",
        className
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}
