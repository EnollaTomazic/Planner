"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { neuRaised, neuInset } from "./Neu";

export const buttonSizes = {
  sm: {
    height: "h-9",
    padding: "px-4",
    text: "text-sm",
    gap: "gap-1",
    icon: "[&>svg]:size-4",
  },
  md: {
    height: "h-10",
    padding: "px-5",
    text: "text-base",
    gap: "gap-2",
    icon: "[&>svg]:size-5",
  },
  lg: {
    height: "h-11",
    padding: "px-6",
    text: "text-lg",
    gap: "gap-3",
    icon: "[&>svg]:size-6",
  },
} as const;

export type ButtonSize = keyof typeof buttonSizes;

type Tone = "primary" | "accent" | "info" | "danger";

export type ButtonProps = React.ComponentProps<typeof motion.button> & {
  size?: ButtonSize;
  variant?: "primary" | "secondary" | "ghost";
  tone?: Tone;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      size = "md",
      variant = "secondary",
      tone = "primary",
      children,
      type = "button",
      ...rest
    },
    ref
  ) => {
    const s = buttonSizes[size];
    const base = cn(
      "relative inline-flex items-center justify-center rounded-2xl border border-accent-strong font-medium transition-all duration-200 focus-visible:[outline:none] focus-visible:ring-2 focus-visible:ring-accent-strong disabled:opacity-50 disabled:pointer-events-none",
      s.height,
      s.padding,
      s.text,
      s.gap,
      s.icon,
      className,
    );

    const colorVar: Record<Tone, string> = {
      primary: "--text",
      accent: "--accent",
      info: "--accent-weak",
      danger: "--status-error",
    };

    const toneClasses: Record<
      NonNullable<ButtonProps["variant"]>,
      Record<Tone, string>
    > = {
      primary: {
        primary: "text-text",
        accent: "text-accent",
        info: "text-accent-weak",
        danger: "text-status-error",
      },
      secondary: {
        primary: "text-text",
        accent:
          "text-accent bg-accent/15 hover:bg-accent/25",
        info:
          "text-accent-weak bg-accent-weak/15 hover:bg-accent-weak/25",
        danger:
          "text-status-error bg-status-error/15 hover:bg-status-error/25",
      },
      ghost: {
        primary:
          "text-text hover:bg-text/10",
        accent:
          "text-accent hover:bg-accent/10",
        info:
          "text-accent-weak hover:bg-accent-weak/10",
        danger:
          "text-status-error hover:bg-status-error/10",
      },
    };

    const variants: Record<
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
        className: "bg-surface-alt/85 overflow-hidden shadow-neo",
        whileTap: {
          scale: 0.96,
          boxShadow: neuInset(10) as CSSProperties["boxShadow"],
        },
        contentClass: "relative z-10 inline-flex items-center gap-2",
      },
      secondary: {
        className: "bg-surface-alt/80 shadow-neo",
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

    const { className: variantClass, whileHover, whileTap, overlay, contentClass } =
      variants[variant];

    return (
      <motion.button
        ref={ref}
        type={type}
        className={cn(base, variantClass, toneClasses[variant][tone])}
        whileHover={
          variant === "primary"
            ? {
                scale: 1.03,
                boxShadow: `${neuRaised(16)},0 0 8px hsl(var(${colorVar[tone]})/.3)`,
              }
            : whileHover
        }
        whileTap={whileTap}
        {...rest}
      >
        {variant === "primary" ? (
          <span
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background: `linear-gradient(90deg, hsl(var(${colorVar[tone]})/.18), hsl(var(${colorVar[tone]})/.18))`,
            }}
          />
        ) : (
          overlay
        )}
        {contentClass ? (
          <span className={contentClass}>{children as React.ReactNode}</span>
        ) : (
          children as React.ReactNode
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export default Button;
