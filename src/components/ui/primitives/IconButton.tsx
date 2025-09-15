"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ButtonSize } from "./Button";

export type IconButtonSize = ButtonSize | "xl" | "xs";
type Icon = "xs" | "sm" | "md" | "lg" | "xl";

type Tone = "primary" | "accent" | "info" | "danger";
type Variant = "ring" | "glow" | "solid";

/**
 * Props for the {@link IconButton} component.
 * @property loading - When `true`, the button is disabled and `data-loading` is set.
 */
type AccessibleLabelProps =
  | {
      "aria-label": string;
      title?: string;
    }
  | {
      title: string;
      "aria-label"?: string;
    };

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
  xs: "[&_svg]:size-3",
  sm: "[&_svg]:size-4",
  md: "[&_svg]:size-5",
  lg: "[&_svg]:size-6",
  xl: "[&_svg]:size-7",
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
    xs: "h-8 w-8",
    sm: "h-9 w-9",
    md: "h-10 w-10",
    lg: "h-11 w-11",
    xl: "h-12 w-12",
  };
  return sizeMap[s];
};

const variantBase: Record<Variant, string> = {
  ring: "border bg-card/35 hover:bg-[--hover] [--hover:hsl(var(--panel)/0.45)]",
  solid: "border",
  glow: "border bg-card/35 hover:bg-[--hover] [--hover:hsl(var(--panel)/0.45)] shadow-glow-current",
};

const toneClasses: Record<Variant, Record<Tone, string>> = {
  ring: {
    primary: "border-line/35 text-foreground",
    accent: "border-accent/35 text-accent",
    info: "border-accent-2/35 text-accent-2",
    danger: "border-danger/35 text-danger",
  },
  solid: {
    primary:
      "border-transparent bg-foreground/15 text-foreground [--hover:hsl(var(--foreground)/0.25)] [--active:hsl(var(--foreground)/0.35)]",
    accent:
      "border-transparent bg-accent/15 text-accent [--hover:hsl(var(--accent)/0.25)] [--active:hsl(var(--accent)/0.35)]",
    info: "border-transparent bg-accent-2/15 text-accent-2 [--hover:hsl(var(--accent-2)/0.25)] [--active:hsl(var(--accent-2)/0.35)]",
    danger:
      "border-transparent bg-danger/15 text-danger [--hover:hsl(var(--danger)/0.25)] [--active:hsl(var(--danger)/0.35)]",
  },
  glow: {
    primary: "border-foreground/35 text-foreground",
    accent: "border-accent/35 text-accent",
    info: "border-accent-2/35 text-accent-2",
    danger: "border-danger/35 text-danger",
  },
};

const hasTextContent = (node: React.ReactNode): boolean => {
  if (node === null || node === undefined) return false;
  if (typeof node === "boolean") return false;
  if (typeof node === "string") return node.trim().length > 0;
  if (typeof node === "number") return true;
  if (Array.isArray(node)) return node.some((item) => hasTextContent(item));
  if (React.isValidElement(node)) {
    return hasTextContent(node.props.children);
  }
  return false;
};

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      size = "md",
      iconSize,
      className,
      tone = "primary",
      variant = "ring",
      loading,
      disabled,
      children,
      title,
      "aria-label": ariaLabel,
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
    const effectiveAriaLabel = normalizedAriaLabel ?? normalizedTitle;
    const ariaLabelledBy = (rest as { "aria-labelledby"?: string })[
      "aria-labelledby"
    ];
    const hasExternalLabel =
      typeof ariaLabelledBy === "string" && ariaLabelledBy.trim().length > 0;
    const iconOnly = !hasTextContent(children);
    const shouldWarn = iconOnly && !effectiveAriaLabel && !hasExternalLabel;

    React.useEffect(() => {
      if (process.env.NODE_ENV === "production") return;
      if (!shouldWarn) return;
      console.error(
        "IconButton requires an `aria-label` or `title` when rendering icon-only content.",
      );
    }, [shouldWarn]);

    return (
      <motion.button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex items-center justify-center select-none rounded-full transition-colors duration-[var(--dur-quick)] ease-out motion-reduce:transition-none hover:bg-[--hover] active:bg-[--active] focus-visible:[outline:none] focus-visible:ring-2 focus-visible:ring-[--focus] disabled:opacity-[var(--disabled)] disabled:pointer-events-none data-[loading=true]:opacity-[var(--loading)]",
          variantBase[variant],
          toneClasses[variant][tone],
          sizeClass,
          iconMap[appliedIconSize],
          className,
        )}
        data-loading={loading}
        disabled={disabled || loading}
        whileHover={reduceMotion ? undefined : { scale: 1.05 }}
        whileTap={reduceMotion ? undefined : { scale: 0.95 }}
        aria-label={effectiveAriaLabel}
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
