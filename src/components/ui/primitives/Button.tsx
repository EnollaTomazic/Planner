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
      "text-accent bg-accent/15 [--hover:hsl(var(--accent)/0.25)] [--active:hsl(var(--accent)/0.35)]",
    info: "text-accent-2 bg-accent-2/15 [--hover:hsl(var(--accent-2)/0.25)] [--active:hsl(var(--accent-2)/0.35)]",
    danger:
      "text-danger bg-danger/15 [--hover:hsl(var(--danger)/0.25)] [--active:hsl(var(--danger)/0.35)]",
  },
  ghost: {
    primary:
      "text-foreground [--hover:hsl(var(--foreground)/0.1)] [--active:hsl(var(--foreground)/0.2)]",
    accent:
      "text-accent [--hover:hsl(var(--accent)/0.1)] [--active:hsl(var(--accent)/0.2)]",
    info: "text-accent-2 [--hover:hsl(var(--accent-2)/0.1)] [--active:hsl(var(--accent-2)/0.2)]",
    danger:
      "text-danger [--hover:hsl(var(--danger)/0.1)] [--active:hsl(var(--danger)/0.2)]",
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
      "bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent-foreground))] border-[hsl(var(--accent)/0.35)] hover:bg-[hsl(var(--accent)/0.14)] hover:shadow-[0_2px_6px_-1px_hsl(var(--accent)/0.25)] active:translate-y-px active:shadow-[inset_0_0_0_1px_hsl(var(--accent)/0.6)]",
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
      ...rest
    },
    ref,
  ) => {
    const reduceMotion = useReducedMotion();
    const isDisabled = disabled || loading;
    const s = buttonSizes[size];
    const base = cn(
      "relative inline-flex items-center justify-center rounded-2xl border font-medium tracking-[0.02em] transition-all duration-[var(--dur-quick)] ease-out motion-reduce:transition-none hover:bg-[--hover] active:bg-[--active] focus-visible:[outline:none] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] disabled:opacity-[var(--disabled)] disabled:pointer-events-none data-[loading=true]:opacity-[var(--loading)]",
      s.height,
      s.padding,
      s.text,
      s.gap,
      s.icon,
      className,
    );

    const {
      className: variantClass,
      whileHover,
      whileTap,
      overlay,
      contentClass,
    } = variants[variant];

    return (
      <motion.button
        ref={ref}
        type={type}
        className={cn(base, variantClass, toneClasses[variant][tone])}
        data-loading={loading}
        disabled={isDisabled}
        whileHover={
          reduceMotion
            ? undefined
            : variant === "primary"
              ? {
                  scale: 1.03,
                  boxShadow: `${neuRaised(16)},0 0 8px hsl(var(${colorVar[tone]})/.3)`,
                }
              : whileHover
        }
        whileTap={reduceMotion ? undefined : whileTap}
        {...rest}
      >
        {variant === "primary" ? (
          <span
            className={cn(
              "absolute inset-0 pointer-events-none rounded-2xl",
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
