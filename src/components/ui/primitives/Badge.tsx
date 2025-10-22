"use client";

import * as React from "react";

import { useOrganicDepthEnabled } from "@/lib/depth-theme-context";
import { cn } from "@/lib/utils";

import { BlobContainer } from "./BlobContainer";
import styles from "./Badge.module.css";
import neumorphicStyles from "../neumorphic.module.css";

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

const toneInteraction: Record<Tone, string> = {
  neutral: "[--hover:hsl(var(--muted)/0.28)] [--active:hsl(var(--muted)/0.36)]",
  primary: "[--hover:hsl(var(--primary)/0.22)] [--active:hsl(var(--primary)/0.3)]",
  accent: "[--hover:hsl(var(--accent)/0.22)] [--active:hsl(var(--accent)/0.32)]",
  top: "[--hover:hsl(var(--tone-top)/0.24)] [--active:hsl(var(--tone-top)/0.34)]",
  jungle: "[--hover:hsl(var(--tone-jg)/0.24)] [--active:hsl(var(--tone-jg)/0.34)]",
  mid: "[--hover:hsl(var(--tone-mid)/0.24)] [--active:hsl(var(--tone-mid)/0.34)]",
  bot: "[--hover:hsl(var(--tone-bot)/0.24)] [--active:hsl(var(--tone-bot)/0.34)]",
  support: "[--hover:hsl(var(--tone-sup)/0.24)] [--active:hsl(var(--tone-sup)/0.34)]",
};

export function Badge<T extends React.ElementType = "span">(
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
    ["data-text"]: providedGlitchText,
    ...restProps
  } = rest as typeof rest & {
    onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
    onClick?: React.MouseEventHandler<HTMLElement>;
    "data-text"?: string;
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

  const organicDepth = useOrganicDepthEnabled();
  const glitchText = glitch
    ? providedGlitchText ??
      (typeof children === "string" ? children : undefined)
    : providedGlitchText;

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
      data-text={glitchText}
      className={cn(
        neumorphicStyles.neu,
        styles.root,
        organicDepth && styles.organicBadge,
        "relative inline-flex max-w-full items-center gap-[var(--space-2)] whitespace-nowrap font-medium tracking-[0.02em]",
        "border",
        sizeMap[size],
        toneBorder[tone],
        interactive &&
          cn(
            styles.interactive,
            toneInteraction[tone],
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:shadow-[var(--shadow-control-hover)]",
            "data-[disabled=true]:cursor-default",
            !isButtonElement && "data-[disabled=true]:pointer-events-none",
          ),
        isSelected &&
          "bg-primary-soft/36 border-ring-contrast shadow-glow-xl text-on-accent",
        glitch &&
          cn(styles.glitch, "group/glitch isolate"),
        "data-[disabled=true]:opacity-disabled",
        className,
      )}
    >
      {glitch ? (
        <BlobContainer overlayToken="glitch-overlay-button-opacity-reduced" />
      ) : null}
      {children}
    </Comp>
  );
}
