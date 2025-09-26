"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { hasTextContent } from "@/lib/react";
import { cn } from "@/lib/utils";
import { neuInset, neuRaised } from "./Neu";

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
  Omit<MotionButtonProps, "children"> &
    AccessibleLabelProps & {
      size?: IconButtonSize;
      iconSize?: Icon;
      tone?: Tone;
      variant?: Variant;
      loading?: boolean;
      children?: React.ReactNode;
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
  primary:
    "[--hover:theme('colors.interaction.foreground.tintHover')] [--active:theme('colors.interaction.foreground.tintActive')]",
  accent:
    "[--hover:theme('colors.interaction.accent.tintHover')] [--active:theme('colors.interaction.accent.tintActive')]",
  info:
    "[--hover:theme('colors.interaction.info.tintHover')] [--active:theme('colors.interaction.info.tintActive')]",
  danger:
    "[--hover:theme('colors.interaction.danger.tintHover')] [--active:theme('colors.interaction.danger.tintActive')]",
} satisfies Record<Tone, string>;

const toneInteractionTokens = {
  primary:
    "[--hover:theme('colors.interaction.primary.hover')] [--active:theme('colors.interaction.primary.active')]",
  accent:
    "[--hover:theme('colors.interaction.accent.hover')] [--active:theme('colors.interaction.accent.active')]",
  info:
    "[--hover:theme('colors.interaction.info.hover')] [--active:theme('colors.interaction.info.active')]",
  danger:
    "[--hover:theme('colors.interaction.danger.hover')] [--active:theme('colors.interaction.danger.active')]",
} satisfies Record<Tone, string>;

const colorVar: Record<Tone, string> = {
  primary: "--primary",
  accent: "--accent",
  info: "--accent-2",
  danger: "--danger",
};

const toneForegroundVar: Record<Tone, string> = {
  primary: "--primary-foreground",
  accent: "--accent-foreground",
  info: "--accent-2-foreground",
  danger: "--danger-foreground",
};

type VariantConfig = {
  className: string;
  style?: CSSProperties;
};

const getPrimaryShadows = (tone: Tone): CSSProperties => {
  const toneVar = colorVar[tone];

  return {
    "--glow-active": `hsl(var(${toneVar}) / 0.35)`,
    "--btn-primary-hover-shadow":
      `0 var(--spacing-0-5) calc(var(--space-3) / 2) calc(-1 * var(--spacing-0-25)) hsl(var(${toneVar}) / 0.25)`,
    "--btn-primary-active-shadow":
      `inset 0 0 0 var(--spacing-0-25) hsl(var(${toneVar}) / 0.6)`,
    "--btn-primary-shadow-rest": "0 0 calc(var(--space-4) / 2) var(--glow-active)",
    "--btn-primary-shadow-hover": "0 0 var(--space-4) var(--glow-active)",
    "--btn-primary-shadow-active": "var(--btn-primary-active-shadow)",
  } as CSSProperties;
};

const primaryVariantBase = (tone: Tone): VariantConfig => ({
  className: cn(
    "border transition-[box-shadow,background-color,color] shadow-[var(--btn-primary-shadow-rest)] hover:shadow-[var(--btn-primary-shadow-hover)] active:shadow-[var(--btn-primary-shadow-active)]",
    toneInteractionTokens[tone],
  ),
  style: getPrimaryShadows(tone),
});

const getSecondaryShadows = (): CSSProperties =>
  ({
    "--btn-secondary-shadow-rest": neuRaised(),
    "--btn-secondary-shadow-hover": neuRaised(15),
    "--btn-secondary-shadow-active": neuInset(9),
  }) as CSSProperties;

const secondaryVariantBase: VariantConfig = {
  className:
    "border transition-[box-shadow,background-color,color] shadow-[var(--btn-secondary-shadow-rest)] hover:shadow-[var(--btn-secondary-shadow-hover)] active:shadow-[var(--btn-secondary-shadow-active)]",
  style: getSecondaryShadows(),
};

const variantBase: Record<Variant, (tone: Tone) => VariantConfig> = {
  ghost: (tone) => ({
    className: cn("border bg-card/35 hover:bg-[--hover]", toneTintTokens[tone]),
  }),
  primary: primaryVariantBase,
  secondary: () => secondaryVariantBase,
};

const toneClasses: Record<Variant, Record<Tone, string>> = {
  ghost: {
    primary: "border-[hsl(var(--line)/0.35)] text-foreground",
    accent: "border-accent/35 text-on-accent",
    info: "border-accent-2/35 text-on-accent",
    danger: "border-danger/35 text-danger",
  },
  primary: {
    primary: cn(
      "border-[hsl(var(--primary)/0.35)] bg-primary-soft",
      `text-[hsl(var(${toneForegroundVar.primary}))]`,
    ),
    accent: cn(
      "border-[hsl(var(--accent)/0.35)] bg-[hsl(var(--accent)/0.12)]",
      "text-on-accent",
    ),
    info: cn(
      "border-[hsl(var(--accent-2)/0.35)] bg-[hsl(var(--accent-2)/0.12)]",
      "text-on-accent",
    ),
    danger: cn(
      "border-[hsl(var(--danger)/0.35)] bg-[hsl(var(--danger)/0.12)]",
      "text-[hsl(var(--danger-surface-foreground))]",
    ),
  },
  secondary: {
    primary:
      "text-muted-foreground bg-panel/60 [--hover:hsl(var(--primary)/0.25)] [--active:hsl(var(--primary)/0.35)] hover:text-foreground active:text-foreground focus-visible:text-foreground",
    accent:
      "text-on-accent bg-accent/30 [--hover:hsl(var(--accent)/0.25)] [--active:hsl(var(--accent)/0.2)]",
    info:
      "text-on-accent bg-accent-2/25 [--hover:hsl(var(--accent-2)/0.2)] [--active:hsl(var(--accent-2)/0.15)]",
    danger: cn(
      toneInteractionTokens.danger,
      "text-[hsl(var(--danger-tint-foreground))] bg-danger/25",
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
      style: styleProp,
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

    const { className: variantClass, style: variantStyle } = variantBase[variant](tone);
    const mergedStyle = variantStyle
      ? { ...variantStyle, ...(styleProp ?? {}) }
      : styleProp;

    return (
      <motion.button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex items-center justify-center select-none rounded-[var(--radius-full)] transition-colors duration-quick ease-out motion-reduce:transition-none hover:bg-[--hover] active:bg-[--active] focus-visible:ring-2 focus-visible:ring-[var(--ring-contrast)] focus-visible:shadow-[var(--shadow-glow-md)] focus-visible:[outline:var(--spacing-0-5)_solid_var(--ring-contrast)] focus-visible:[outline-offset:var(--spacing-0-5)] disabled:opacity-disabled disabled:pointer-events-none data-[loading=true]:opacity-loading",
          variantClass,
          toneClasses[variant][tone],
          sizeClass,
          iconMap[appliedIconSize],
          className,
        )}
        style={mergedStyle}
        data-loading={loading}
        disabled={disabled || loading}
        whileHover={reduceMotion ? undefined : { scale: 1.05 }}
        whileTap={reduceMotion ? undefined : { scale: 0.95 }}
        aria-label={resolvedAriaLabel}
        aria-labelledby={normalizedAriaLabelledBy}
        title={normalizedTitle}
        {...rest}
      >
        {children}
      </motion.button>
    );
  },
);

IconButton.displayName = "IconButton";
export default IconButton;
