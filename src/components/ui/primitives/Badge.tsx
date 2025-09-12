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
  | "bot"
  | "support";

type BadgeOwnProps<T extends React.ElementType = "span"> = {
  size?: Size;
  tone?: Tone;
  interactive?: boolean;
  selected?: boolean;
  glitch?: boolean;
  as?: T;
};

export type BadgeProps<T extends React.ElementType = "span"> =
  BadgeOwnProps<T> &
    Omit<React.ComponentPropsWithoutRef<T>, keyof BadgeOwnProps<T>>;

const sizeMap: Record<Size, string> = {
  xs: "px-2 py-1 text-xs leading-none",
  sm: "px-3 py-2 text-xs leading-none",
};

const toneBorder: Record<Tone, string> = {
  neutral: "border-card-hairline",
  primary: "border-ring",
  accent: "border-[var(--accent-overlay)]",
  top: "border-tone-top",
  jungle: "border-tone-jg",
  mid: "border-tone-mid",
  bot: "border-tone-bot",
  support: "border-tone-sup",
};

export default function Badge<T extends React.ElementType = "span">({
  size = "sm",
  tone = "neutral",
  interactive = false,
  selected = false,
  glitch = false,
  as,
  className,
  children,
  ...rest
}: BadgeProps<T>) {
  const Comp = as ?? "span";

  return (
    <Comp
      data-selected={selected ? "true" : undefined}
      className={cn(
        "inline-flex max-w-full items-center gap-2 whitespace-nowrap rounded-full font-medium tracking-[-0.01em]",
        "border bg-muted/18",
        "shadow-[inset_0_1px_0_hsl(var(--foreground)/.06),0_0_0_.5px_hsl(var(--card-hairline)/.35),0_10px_20px_hsl(var(--shadow-color)/.18)]",
        "transition-[background,box-shadow,transform] duration-140 ease-out",
        sizeMap[size],
        toneBorder[tone],
        interactive && "cursor-pointer",
        interactive && "hover:bg-muted/28",
        selected &&
          "bg-primary-soft/36 border-[var(--ring-contrast)] shadow-[0_0_0_1px_var(--ring-contrast)_inset] shadow-glow-xl text-[var(--text-on-accent)]",
        glitch &&
          "shadow-[0_0_0_1px_hsl(var(--card-hairline))_inset] shadow-glow-md hover:shadow-[0_0_0_1px_var(--ring-contrast)_inset] hover:shadow-glow-lg",
        className,
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}
