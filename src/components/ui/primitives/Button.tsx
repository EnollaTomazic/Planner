"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import Spinner from "../feedback/Spinner";
import { neuRaised, neuInset } from "./Neu";

export const buttonSizes = {
  sm: {
    height: "h-[var(--control-h-sm)]",
    padding: "px-[var(--space-4)]",
    text: "text-label",
    gap: "gap-[var(--space-1)]",
    icon: "[&_svg]:size-4",
  },
  md: {
    height: "h-[var(--control-h-md)]",
    padding: "px-[var(--space-4)]",
    text: "text-ui",
    gap: "gap-[var(--space-2)]",
    icon: "[&_svg]:size-5",
  },
  lg: {
    height: "h-[var(--control-h-lg)]",
    padding: "px-[var(--space-6)]",
    text: "text-title",
    gap: "gap-[var(--space-4)]",
    icon: "[&_svg]:size-8",
  },
} as const;

export type ButtonSize = keyof typeof buttonSizes;

type Tone = "primary" | "accent" | "info" | "danger";

const spinnerSizes: Record<ButtonSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

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

const primaryToneInteractionTokens =
  "[--hover:hsl(var(--accent)/0.14)] [--active:hsl(var(--accent)/0.2)]";

export const toneClasses: Record<
  NonNullable<ButtonProps["variant"]>,
  Record<Tone, string>
> = {
  primary: {
    primary: `text-foreground ${primaryToneInteractionTokens}`,
    accent: `text-accent ${primaryToneInteractionTokens}`,
    info: `text-accent-2 ${primaryToneInteractionTokens}`,
    danger: `text-danger ${primaryToneInteractionTokens}`,
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
      "shadow-glow-sm bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent-foreground))] border-[hsl(var(--accent)/0.35)] hover:shadow-glow-md active:translate-y-px active:shadow-btn-primary-active",
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
    const spinnerSize = spinnerSizes[size];
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

    const contentClasses = cn(
      contentClass ?? cn("inline-flex items-center", s.gap),
      loading && "opacity-0",
    );

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
        aria-busy={loading ? true : undefined}
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
        {loading ? (
          <span className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <Spinner size={spinnerSize} />
          </span>
        ) : null}
        <span className={contentClasses}>
          {children as React.ReactNode}
        </span>
      </motion.button>
    );
  },
);

Button.displayName = "Button";
export default Button;
