"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type BaseSize = "sm" | "md" | "lg" | "xl";
type Size = "xs" | BaseSize;
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

const baseSizeMap: Record<BaseSize, string> = {
  sm: "px-[var(--space-2)] py-[var(--space-1)] text-label leading-none [&_svg]:size-[var(--icon-size-xs)]",
  md: "px-[var(--space-3)] py-[var(--space-2)] text-label leading-none [&_svg]:size-[var(--icon-size-sm)]",
  lg: "px-[var(--space-4)] py-[var(--space-2)] text-ui leading-none [&_svg]:size-[var(--icon-size-md)]",
  xl: "px-[var(--space-5)] py-[var(--space-3)] text-title leading-none [&_svg]:size-[var(--icon-size-xl)]",
};

const sizeMap: Record<Size, string> = {
  xs: baseSizeMap.sm,
  ...baseSizeMap,
};

const toneBorder: Record<Tone, string> = {
  neutral: "border-card-hairline",
  primary: "border-ring",
  accent: "border-accent-overlay",
  top: "border-tone-top",
  jungle: "border-tone-jg",
  mid: "border-tone-mid",
  bot: "border-tone-bot",
  support: "border-tone-sup",
};

export default function Badge<T extends React.ElementType = "span">(
  props: BadgeProps<T>,
) {
  const {
    size = "md",
    tone = "neutral",
    interactive = false,
    selected,
    glitch = false,
    disabled = false,
    as,
    className,
    children,
    ...rest
  } = props;
  const Comp = (as ?? (interactive ? "button" : "span")) as React.ElementType;
  const isStringElement = typeof Comp === "string";
  const isButtonElement = isStringElement && Comp === "button";
  const isToggleBadge = Object.prototype.hasOwnProperty.call(props, "selected");
  const isSelected = selected ?? false;
  const {
    onKeyDown: userOnKeyDown,
    onClick: userOnClick,
    ...restProps
  } = rest as typeof rest & {
    onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
    onClick?: React.MouseEventHandler<HTMLElement>;
  };

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
  const mergedOnKeyDown: React.KeyboardEventHandler<HTMLElement> | undefined =
    interactive && !isButtonElement
      ? (event) => {
          userOnKeyDown?.(event);
          if (event.defaultPrevented || disabled) {
            return;
          }

          if (
            event.key === "Enter" ||
            event.key === " " ||
            event.key === "Space" ||
            event.key === "Spacebar"
          ) {
            event.preventDefault();
            const element = event.currentTarget as HTMLElement | null;
            element?.click();
          }
        }
      : userOnKeyDown;

  return (
    <Comp
      {...restProps}
      {...typeProps}
      {...roleProps}
      {...disabledProps}
      onClick={userOnClick}
      onKeyDown={mergedOnKeyDown}
      data-selected={isSelected ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      aria-disabled={disabled ? "true" : undefined}
      aria-pressed={interactive && isToggleBadge ? isSelected : undefined}
      className={cn(
        "inline-flex max-w-full items-center gap-[var(--space-2)] whitespace-nowrap rounded-card r-card-lg font-medium tracking-[-0.01em]",
        "border bg-muted/18",
        "shadow-outline-subtle",
        "transition-[background,box-shadow,transform] duration-140 ease-out",
        sizeMap[size],
        toneBorder[tone],
        interactive &&
          cn(
            "cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--ring-contrast)] focus-visible:shadow-[var(--shadow-glow-md)] focus-visible:[outline:var(--spacing-0-5)_solid_var(--ring-contrast)] focus-visible:[outline-offset:var(--spacing-0-5)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface-2))] hover:bg-muted/28 active:bg-muted/36 active:translate-y-[var(--space-1)] motion-reduce:active:translate-y-0 data-[disabled=true]:opacity-disabled data-[disabled=true]:cursor-default",
            !isButtonElement && "data-[disabled=true]:pointer-events-none",
          ),
        isSelected &&
          "bg-primary-soft/36 border-ring-contrast shadow-glow-xl text-on-accent",
        glitch &&
          "shadow-inset-hairline hover:shadow-inset-contrast hover:shadow-glow-lg focus-visible:shadow-inset-contrast focus-visible:shadow-glow-lg",
        className,
      )}
    >
      {children}
    </Comp>
  );
}
