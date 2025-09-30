"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { hasTextContent } from "@/lib/react";
import { cn } from "@/lib/utils";
import neumorphicStyles from "../neumorphic.module.css";
import BlobContainer, { type GlitchOverlayToken } from "./BlobContainer";
import DripEdge from "./DripEdge";
import styles from "./IconButton.module.css";

export type IconButtonSize = "sm" | "md" | "lg" | "xl";
type Icon = "xs" | "sm" | "md" | "lg" | "xl";

type Tone = "primary" | "accent" | "info" | "danger";
type Variant = "primary" | "secondary" | "ghost";

type RequireAtLeastOne<T, Keys extends keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> &
      Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

/**
 * Props for the {@link IconButton} component.
 * @property loading - When `true`, the button is disabled and `data-loading` is set.
 */
type AccessibleLabelProps = RequireAtLeastOne<
  {
    "aria-label"?: string;
    "aria-labelledby"?: string;
    title?: string;
  },
  "aria-label" | "aria-labelledby" | "title"
>;

type MotionButtonProps = React.ComponentProps<typeof motion.button>;

export type IconButtonProps =
  Omit<MotionButtonProps, "children" | "style"> &
    AccessibleLabelProps & {
      size?: IconButtonSize;
      iconSize?: Icon;
      tone?: Tone;
      variant?: Variant;
      loading?: boolean;
      children?: React.ReactNode;
      glitch?: boolean;
      glitchIntensity?: GlitchOverlayToken;
    };

const iconMap: Record<Icon, string> = {
  xs: "[&_svg]:size-[calc(var(--control-h-xs)/2)]",
  sm: "[&_svg]:size-[calc(var(--control-h-sm)/2)]",
  md: "[&_svg]:size-[calc(var(--control-h-md)/2)]",
  lg: "[&_svg]:size-[calc(var(--control-h-lg)/2)]",
  xl: "[&_svg]:size-[calc(var(--control-h-xl)/2)]",
};
const defaultIcon: Record<IconButtonSize, Icon> = {
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
};
const getSizeClass = (s: IconButtonSize) => {
  const sizeMap: Record<IconButtonSize, string> = {
    sm: "h-[var(--control-h-sm)] w-[var(--control-h-sm)]",
    md: "h-[var(--control-h-md)] w-[var(--control-h-md)]",
    lg: "h-[var(--control-h-lg)] w-[var(--control-h-lg)]",
    xl: "h-[var(--control-h-xl)] w-[var(--control-h-xl)]",
  };
  return sizeMap[s];
};

const toneTintTokens = {
  primary: "[--hover:hsl(var(--foreground)/0.1)] [--active:hsl(var(--foreground)/0.2)]",
  accent: "[--hover:hsl(var(--accent)/0.25)] [--active:hsl(var(--accent)/0.35)]",
  info: "[--hover:hsl(var(--accent-2)/0.25)] [--active:hsl(var(--accent-2)/0.35)]",
  danger: "[--hover:hsl(var(--danger)/0.1)] [--active:hsl(var(--danger)/0.2)]",
} satisfies Record<Tone, string>;

const toneInteractionTokens = {
  primary: "[--hover:hsl(var(--primary)/0.14)] [--active:hsl(var(--primary)/0.2)]",
  accent: "[--hover:hsl(var(--accent)/0.14)] [--active:hsl(var(--accent)/0.2)]",
  info: "[--hover:hsl(var(--accent-2)/0.14)] [--active:hsl(var(--accent-2)/0.2)]",
  danger: "[--hover:hsl(var(--danger)/0.14)] [--active:hsl(var(--danger)/0.2)]",
} satisfies Record<Tone, string>;

const toneForegroundVar: Record<Tone, string> = {
  primary: "--primary-foreground",
  accent: "--accent-foreground",
  info: "--accent-2-foreground",
  danger: "--danger-foreground",
};

const primaryShadowVars: Record<Tone, string> = {
  primary:
    "[--glow-active:hsl(var(--primary)/0.35)] [--btn-primary-hover-shadow:0_var(--spacing-0-5)_calc(var(--space-3)/2)_calc(-1*var(--spacing-0-25))_hsl(var(--primary)/0.25)] [--btn-primary-active-shadow:inset_0_0_0_var(--spacing-0-25)_hsl(var(--primary)/0.6)]",
  accent:
    "[--glow-active:hsl(var(--accent)/0.35)] [--btn-primary-hover-shadow:0_var(--spacing-0-5)_calc(var(--space-3)/2)_calc(-1*var(--spacing-0-25))_hsl(var(--accent)/0.25)] [--btn-primary-active-shadow:inset_0_0_0_var(--spacing-0-25)_hsl(var(--accent)/0.6)]",
  info:
    "[--glow-active:hsl(var(--accent-2)/0.35)] [--btn-primary-hover-shadow:0_var(--spacing-0-5)_calc(var(--space-3)/2)_calc(-1*var(--spacing-0-25))_hsl(var(--accent-2)/0.25)] [--btn-primary-active-shadow:inset_0_0_0_var(--spacing-0-25)_hsl(var(--accent-2)/0.6)]",
  danger:
    "[--glow-active:hsl(var(--danger)/0.35)] [--btn-primary-hover-shadow:0_var(--spacing-0-5)_calc(var(--space-3)/2)_calc(-1*var(--spacing-0-25))_hsl(var(--danger)/0.25)] [--btn-primary-active-shadow:inset_0_0_0_var(--spacing-0-25)_hsl(var(--danger)/0.6)]",
};

const secondarySurfaceTokens: Record<Tone, string> = {
  primary: "[--hover:hsl(var(--primary)/0.25)] [--active:hsl(var(--primary)/0.35)]",
  accent: "[--hover:hsl(var(--accent)/0.25)] [--active:hsl(var(--accent)/0.2)]",
  info: "[--hover:hsl(var(--accent-2)/0.2)] [--active:hsl(var(--accent-2)/0.15)]",
  danger: "[--hover:hsl(var(--danger)/0.14)] [--active:hsl(var(--danger)/0.2)]",
};

const primaryVariantBase = (tone: Tone): string =>
  cn(
    "border transition-[box-shadow,background-color,color] shadow-glow-sm hover:shadow-btn-primary-hover active:shadow-btn-primary-active",
    toneInteractionTokens[tone],
    primaryShadowVars[tone],
  );

const variantBase: Record<Variant, (tone: Tone) => string> = {
  ghost: (tone) =>
    cn(
      "border transition-[box-shadow,background-color,color]",
      toneTintTokens[tone],
    ),
  primary: primaryVariantBase,
  secondary: () =>
    "border transition-[box-shadow,background-color,color] shadow-control hover:shadow-control-hover active:shadow-inner-md",
};

const toneClasses: Record<Variant, Record<Tone, string>> = {
  ghost: {
    primary: cn(
      "border-[hsl(var(--line)/0.35)] text-foreground",
      "[--neu-surface:hsl(var(--card)/0.35)]",
    ),
    accent: cn(
      "border-accent/35 text-on-accent",
      "[--neu-surface:hsl(var(--accent)/0.2)]",
    ),
    info: cn(
      "border-accent-2/35 text-on-accent",
      "[--neu-surface:hsl(var(--accent-2)/0.2)]",
    ),
    danger: cn(
      "border-danger/35 text-danger",
      "[--neu-surface:hsl(var(--danger)/0.12)]",
    ),
  },
  primary: {
    primary: cn(
      "border-[hsl(var(--primary)/0.35)] [--neu-surface:hsl(var(--primary-soft))]",
      `text-[hsl(var(${toneForegroundVar.primary}))]`,
    ),
    accent: cn(
      "border-[hsl(var(--accent)/0.35)] [--neu-surface:hsl(var(--accent)/0.12)]",
      "text-on-accent",
    ),
    info: cn(
      "border-[hsl(var(--accent-2)/0.35)] [--neu-surface:hsl(var(--accent-2)/0.12)]",
      "text-on-accent",
    ),
    danger: cn(
      "border-[hsl(var(--danger)/0.35)] [--neu-surface:hsl(var(--danger)/0.12)]",
      "text-[hsl(var(--danger-surface-foreground))]",
    ),
  },
  secondary: {
    primary: cn(
      secondarySurfaceTokens.primary,
      "text-muted-foreground hover:text-foreground active:text-foreground focus-visible:text-foreground",
      "[--neu-surface:hsl(var(--panel)/0.6)]",
    ),
    accent: cn(
      secondarySurfaceTokens.accent,
      "text-on-accent",
      "[--neu-surface:hsl(var(--accent)/0.3)]",
    ),
    info: cn(
      secondarySurfaceTokens.info,
      "text-on-accent",
      "[--neu-surface:hsl(var(--accent-2)/0.25)]",
    ),
    danger: cn(
      secondarySurfaceTokens.danger,
      "text-[hsl(var(--danger-tint-foreground))]",
      "[--neu-surface:hsl(var(--danger)/0.25)]",
    ),
  },
};

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      size = "md",
      iconSize,
      className,
      tone = "primary",
      variant = "ghost",
      loading,
      disabled,
      children,
      title,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      glitch = false,
      glitchIntensity = "glitch-overlay-button-opacity",
      ...rest
    },
    ref,
  ) => {
    const reduceMotion = useReducedMotion();
    const sizeClass = getSizeClass(size);
    const appliedIconSize = iconSize ?? defaultIcon[size];
    const trimmedAriaLabel =
      typeof ariaLabel === "string" ? ariaLabel.trim() : undefined;
    const trimmedTitle = typeof title === "string" ? title.trim() : undefined;
    const normalizedAriaLabel =
      trimmedAriaLabel && trimmedAriaLabel.length > 0
        ? trimmedAriaLabel
        : undefined;
    const normalizedTitle =
      trimmedTitle && trimmedTitle.length > 0 ? trimmedTitle : undefined;
    const trimmedAriaLabelledBy =
      typeof ariaLabelledBy === "string" ? ariaLabelledBy.trim() : undefined;
    const normalizedAriaLabelledBy =
      trimmedAriaLabelledBy && trimmedAriaLabelledBy.length > 0
        ? trimmedAriaLabelledBy
        : undefined;
    const iconOnly = !hasTextContent(children);
    const shouldWarn =
      iconOnly &&
      !normalizedAriaLabel &&
      !normalizedAriaLabelledBy &&
      !normalizedTitle;

    const resolvedAriaLabel =
      normalizedAriaLabel ??
      (iconOnly && !normalizedAriaLabelledBy ? normalizedTitle : undefined);

    React.useEffect(() => {
      if (process.env.NODE_ENV === "production") return;
      if (!shouldWarn) return;
      console.error(
        "IconButton requires an accessible name (`aria-label`, `aria-labelledby`, or `title`) when rendering icon-only content.",
      );
    }, [shouldWarn]);

    const variantClass = variantBase[variant](tone);

    const glitchText = glitch
      ? resolvedAriaLabel ?? normalizedTitle ?? undefined
      : resolvedAriaLabel ?? normalizedTitle ?? undefined;

    const domProps = { ...rest } as Record<string, unknown>;
    if ("data-text" in domProps) {
      delete domProps["data-text"];
    }

    return (
      <motion.button
        ref={ref}
        type="button"
        className={cn(
          neumorphicStyles.neu,
          styles.root,
          glitch && "glitch-wrapper",
          glitch && styles.glitch,
          glitch && "group/glitch isolate overflow-hidden",
          "inline-flex items-center justify-center select-none rounded-[var(--radius-full)] transition-colors duration-quick ease-out motion-reduce:transition-none hover:bg-[--hover] active:bg-[--active] focus-visible:ring-2 focus-visible:ring-[var(--ring-contrast)] focus-visible:shadow-[var(--shadow-glow-md)] focus-visible:[outline:var(--spacing-0-5)_solid_var(--ring-contrast)] focus-visible:[outline-offset:var(--spacing-0-5)] disabled:opacity-disabled disabled:pointer-events-none data-[loading=true]:opacity-loading",
          "[--neu-radius:var(--radius-full)]",
          variantClass,
          toneClasses[variant][tone],
          sizeClass,
          iconMap[appliedIconSize],
          className,
        )}
        data-loading={loading}
        data-variant={variant}
        data-tone={tone}
        data-glitch={glitch ? "true" : undefined}
        data-text={glitch ? glitchText : undefined}
        disabled={disabled || loading}
        whileHover={reduceMotion ? undefined : { scale: 1.05 }}
        whileTap={reduceMotion ? undefined : { scale: 0.95 }}
        aria-label={resolvedAriaLabel}
        aria-labelledby={normalizedAriaLabelledBy}
        title={normalizedTitle}
        {...(domProps as typeof rest)}
      >
        {glitch ? <BlobContainer overlayToken={glitchIntensity} /> : null}
        {variant === "primary" ? (
          <DripEdge
            className="absolute inset-0 z-0"
            overlayToken={glitchIntensity}
            tone={tone}
          />
        ) : null}
        <span className="relative z-10 inline-flex items-center justify-center">
          {children}
        </span>
      </motion.button>
    );
  },
);

IconButton.displayName = "IconButton";
export default IconButton;
