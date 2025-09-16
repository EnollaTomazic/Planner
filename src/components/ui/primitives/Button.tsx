"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { neuRaised, neuInset } from "./Neu";

export const buttonSizes = {
  sm: {
    height: "h-9",
    padding: "px-4",
    text: "text-label",
    gap: "gap-1",
    icon: "[&_svg]:size-4",
  },
  md: {
    height: "h-10",
    padding: "px-4",
    text: "text-ui",
    gap: "gap-2",
    icon: "[&_svg]:size-5",
  },
  lg: {
    height: "h-11",
    padding: "px-8",
    text: "text-title",
    gap: "gap-4",
    icon: "[&_svg]:size-8",
  },
} as const;

export type ButtonSize = keyof typeof buttonSizes;

type Tone = "primary" | "accent" | "info" | "danger";

/**
 * Props for the {@link Button} component.
 * @property loading - When `true`, the button is disabled and `data-loading` is set.
 */
export type ButtonProps = React.ComponentProps<typeof motion.button> & {
  size?: ButtonSize;
  variant?: "primary" | "secondary" | "ghost";
  tone?: Tone;
  loading?: boolean;
};

export const colorVar: Record<Tone, string> = {
  primary: "--foreground",
  accent: "--accent",
  info: "--accent-2",
  danger: "--danger",
};

export const toneClasses: Record<
  NonNullable<ButtonProps["variant"]>,
  Record<Tone, string>
> = {
  primary: {
    primary: "text-foreground",
    accent: "text-accent",
    info: "text-accent-2",
    danger: "text-danger",
  },
  secondary: {
    primary: "text-foreground",
    accent:
      "text-accent bg-accent/15 [--hover:var(--btn-accent-strong-hover)] [--active:var(--btn-accent-strong-active)]",
    info:
      "text-accent-2 bg-accent-2/15 [--hover:var(--btn-accent-2-strong-hover)] [--active:var(--btn-accent-2-strong-active)]",
    danger:
      "text-danger bg-danger/15 [--hover:var(--btn-danger-strong-hover)] [--active:var(--btn-danger-strong-active)]",
  },
  ghost: {
    primary:
      "text-foreground [--hover:var(--btn-foreground-subtle-hover)] [--active:var(--btn-foreground-subtle-active)]",
    accent:
      "text-accent [--hover:var(--btn-accent-subtle-hover)] [--active:var(--btn-accent-subtle-active)]",
    info:
      "text-accent-2 [--hover:var(--btn-accent-2-subtle-hover)] [--active:var(--btn-accent-2-subtle-active)]",
    danger:
      "text-danger [--hover:var(--btn-danger-subtle-hover)] [--active:var(--btn-danger-subtle-active)]",
  },
};

export const variants: Record<
  NonNullable<ButtonProps["variant"]>,
  {
    className: string;
    whileHover?: HTMLMotionProps<"button">["whileHover"];
    whileTap?: HTMLMotionProps<"button">["whileTap"];
    overlay?: React.ReactNode;
    contentClass?: string;
  }
> = {
  primary: {
    className:
      "shadow-glow-sm bg-button-primary-surface text-[hsl(var(--accent-foreground))] border-button-primary-border hover:shadow-glow-md active:translate-y-px active:shadow-btn-primary-active [--hover:var(--btn-primary-hover)]",
    whileTap: {
      scale: 0.97,
    },
    contentClass: "relative z-10 inline-flex items-center gap-2",
  },
  secondary: {
    className: "bg-panel/80 shadow-neo",
    whileHover: { scale: 1.02, boxShadow: neuRaised(15) },
    whileTap: {
      scale: 0.97,
      boxShadow: neuInset(9) as CSSProperties["boxShadow"],
    },
  },
  ghost: {
    className: "bg-transparent",
    whileTap: { scale: 0.97 },
  },
} as const;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      size = "md",
      variant = "secondary",
      tone = "primary",
      children,
      type = "button",
      loading,
      disabled,
      style,
      ...rest
    },
    ref,
  ) => {
    const reduceMotion = useReducedMotion();
    const isDisabled = disabled || loading;
    const s = buttonSizes[size];
    const base = cn(
      "relative inline-flex items-center justify-center rounded-[var(--control-radius)] border font-medium tracking-[0.02em] transition-all duration-[var(--dur-quick)] ease-out motion-reduce:transition-none hover:bg-[--hover] active:bg-[--active] focus-visible:[outline:none] focus-visible:ring-2 focus-visible:ring-[--focus] disabled:opacity-[var(--disabled)] disabled:pointer-events-none data-[loading=true]:opacity-[var(--loading)]",
      s.height,
      s.padding,
      s.text,
      s.gap,
      s.icon,
      className,
    );

    const {
      className: variantClass,
      whileHover: variantHover,
      whileTap,
      overlay,
      contentClass,
    } = variants[variant];

    const hoverAnimation = reduceMotion
      ? undefined
      : variant === "primary"
        ? { scale: 1.03 }
        : variantHover;

    let resolvedStyle = style;

    if (variant === "primary") {
      const glowStyles = {
        "--glow-active": `hsl(var(${colorVar[tone]}) / 0.35)`,
      } as CSSProperties;
      resolvedStyle = {
        ...glowStyles,
        ...(style ?? {}),
      };
    }

    return (
      <motion.button
        ref={ref}
        type={type}
        className={cn(base, variantClass, toneClasses[variant][tone])}
        data-loading={loading}
        disabled={isDisabled}
        style={resolvedStyle}
        whileHover={hoverAnimation}
        whileTap={reduceMotion ? undefined : whileTap}
        {...rest}
      >
        {variant === "primary" ? (
          <span
            className={cn(
              "absolute inset-0 pointer-events-none rounded-[inherit]",
              `bg-[linear-gradient(90deg,hsl(var(${colorVar[tone]})/.18),hsl(var(${colorVar[tone]})/.18))]`,
            )}
          />
        ) : (
          overlay
        )}
        {contentClass ? (
          <span className={contentClass}>{children as React.ReactNode}</span>
        ) : (
          (children as React.ReactNode)
        )}
      </motion.button>
    );
  },
);

Button.displayName = "Button";
export default Button;
