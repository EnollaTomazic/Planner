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
  disabled?: boolean;
};

export type BadgeProps<T extends React.ElementType = "span"> =
  BadgeOwnProps<T> &
    Omit<React.ComponentPropsWithoutRef<T>, keyof BadgeOwnProps<T>>;

const sizeMap: Record<Size, string> = {
  xs: "px-[var(--space-2)] py-[var(--space-1)] text-label leading-none",
  sm: "px-[var(--space-3)] py-[var(--space-2)] text-label leading-none",
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
  disabled = false,
  as,
  className,
  children,
  ...rest
}: BadgeProps<T>) {
  const Comp = (as ?? (interactive ? "button" : "span")) as React.ElementType;
  const isStringElement = typeof Comp === "string";
  const isButtonElement = isStringElement && Comp === "button";
  const restProps = rest as Record<string, unknown>;

  const typeProps =
    isButtonElement && !Object.prototype.hasOwnProperty.call(restProps, "type")
      ? { type: "button" as const }
      : {};

  const roleProps =
    interactive && isStringElement && !isButtonElement
      ? {
          role: "button" as const,
          ...(Object.prototype.hasOwnProperty.call(restProps, "tabIndex")
            ? {}
            : { tabIndex: 0 }),
        }
      : {};
  const disabledProps =
    isButtonElement || !isStringElement ? { disabled } : {};

  return (
    <Comp
      {...rest}
      {...typeProps}
      {...roleProps}
      {...disabledProps}
      data-selected={selected ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      aria-disabled={disabled ? "true" : undefined}
      className={cn(
        "inline-flex max-w-full items-center gap-[var(--space-2)] whitespace-nowrap rounded-card r-card-lg font-medium tracking-[-0.01em]",
        "border bg-muted/18",
        "shadow-badge",
        "transition-[background,box-shadow,transform] duration-200 ease-standard",
        sizeMap[size],
        toneBorder[tone],
        interactive &&
          cn(
            "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface-2))] hover:bg-muted/28 active:bg-muted/36 active:translate-y-[var(--space-1)] motion-reduce:active:translate-y-0 data-[disabled=true]:opacity-[var(--disabled)] data-[disabled=true]:cursor-default",
            !isButtonElement && "data-[disabled=true]:pointer-events-none",
          ),
        selected &&
          "bg-primary-soft/36 border-[var(--ring-contrast)] shadow-inset-contrast shadow-glow-xl text-[var(--text-on-accent)]",
        glitch &&
          "shadow-inset-hairline shadow-glow-md hover:shadow-inset-contrast hover:shadow-glow-lg",
        className,
      )}
    >
      {children}
    </Comp>
  );
}
