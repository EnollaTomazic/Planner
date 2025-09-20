"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { hasTextContent } from "@/lib/react";
import { cn } from "@/lib/utils";
import { colorVar, toneClasses as buttonToneClasses } from "./Button";
import type { ButtonSize } from "./Button";

export type IconButtonSize = ButtonSize | "xl" | "xs";
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
  xs: "[&_svg]:size-[var(--space-3)]",
  sm: "[&_svg]:size-[var(--space-4)]",
  md: "[&_svg]:size-[var(--space-5)]",
  lg: "[&_svg]:size-[var(--space-6)]",
  xl: "[&_svg]:size-[var(--space-7)]",
};
const defaultIcon: Record<IconButtonSize, Icon> = {
  xs: "xs",
  sm: "xs",
  md: "sm",
  lg: "md",
  xl: "lg",
};
const getSizeClass = (s: IconButtonSize) => {
  const sizeMap: Record<IconButtonSize, string> = {
    xs: "h-[var(--space-5)] w-[var(--space-5)]",
    sm: "h-[var(--control-h-sm)] w-[var(--control-h-sm)]",
    md: "h-[var(--control-h-md)] w-[var(--control-h-md)]",
    lg: "h-[var(--control-h-lg)] w-[var(--control-h-lg)]",
    xl: "h-[var(--space-8)] w-[var(--space-8)]",
  };
  return sizeMap[s];
};

const toneTextColor: Record<Tone, string> = {
  primary: "text-foreground",
  accent: "text-[var(--text-on-accent)]",
  info: "text-[var(--text-on-accent)]",
  danger: "text-danger-foreground",
};

const secondaryBorders: Record<Tone, string> = {
  primary: "border-line/35",
  accent: `border-[hsl(var(${colorVar.accent})/0.45)]`,
  info: `border-[hsl(var(${colorVar.info})/0.45)]`,
  danger: `border-[hsl(var(${colorVar.danger})/0.4)]`,
};

const variantBase: Record<Variant, (tone: Tone) => string> = {
  primary: (tone) =>
    cn(
      "border",
      tone === "primary"
        ? "bg-primary-soft"
        : `bg-[hsl(var(${colorVar[tone]})/0.12)]`,
      `border-[hsl(var(${colorVar[tone]})/0.35)]`,
      toneTextColor[tone],
    ),
  secondary: () => "border bg-panel/80",
  ghost: () => "border border-transparent bg-transparent",
};

const toneClasses: Record<Variant, Record<Tone, string>> = {
  primary: {
    primary: buttonToneClasses.primary.primary,
    accent: buttonToneClasses.primary.accent,
    info: buttonToneClasses.primary.info,
    danger: buttonToneClasses.primary.danger,
  },
  secondary: {
    primary: cn(secondaryBorders.primary, buttonToneClasses.secondary.primary),
    accent: cn(secondaryBorders.accent, buttonToneClasses.secondary.accent),
    info: cn(secondaryBorders.info, buttonToneClasses.secondary.info),
    danger: cn(secondaryBorders.danger, buttonToneClasses.secondary.danger),
  },
  ghost: {
    primary: buttonToneClasses.ghost.primary,
    accent: buttonToneClasses.ghost.accent,
    info: buttonToneClasses.ghost.info,
    danger: buttonToneClasses.ghost.danger,
  },
};

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      size = "md",
      iconSize,
      className,
      tone = "primary",
      variant = "secondary",
      loading,
      disabled,
      children,
      title,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
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

    return (
      <motion.button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex items-center justify-center select-none rounded-full transition-colors duration-[var(--dur-quick)] ease-out motion-reduce:transition-none hover:bg-[--hover] active:bg-[--active] focus-visible:[outline:none] focus-visible:ring-2 focus-visible:ring-[var(--focus)] disabled:opacity-[var(--disabled)] disabled:pointer-events-none data-[loading=true]:opacity-[var(--loading)]",
          variantBase[variant](tone),
          toneClasses[variant][tone],
          sizeClass,
          iconMap[appliedIconSize],
          className,
        )}
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
