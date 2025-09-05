"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const buttonSizes = {
  sm: {
    height: "h-8",
    padding: "px-3",
    text: "text-xs",
    gap: "gap-1.5",
  },
  md: {
    height: "h-10",
    padding: "px-4",
    text: "text-sm",
    gap: "gap-2",
  },
  lg: {
    height: "h-12",
    padding: "px-6",
    text: "text-base",
    gap: "gap-2.5",
  },
} as const;

export type ButtonSize = keyof typeof buttonSizes;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: ButtonSize;
  vibe?: "glitch" | "lift" | "none";
  loading?: boolean;
  block?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  pill?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      size = "md",
      loading = false,
      block = false,
      disabled,
      children,
      type = "button",
      leftIcon,
      rightIcon,
      pill = true,
      ...rest
    },
    ref
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { variant: _variant, vibe: _vibe, ...props } = rest;
    const isDisabled = disabled || loading;
    const rounded = pill ? "rounded-full" : "rounded-md";
    const s = buttonSizes[size];

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "glitch-scanlines inline-flex items-center justify-center select-none font-medium transition",
          "focus-visible:outline-none",
          "bg-[var(--btn-bg)] text-[var(--btn-fg)]",
          "hover:shadow-[0_0_8px_var(--neon),0_0_16px_var(--neon-soft)]",
          "focus-visible:shadow-[0_0_8px_var(--neon),0_0_16px_var(--neon-soft)]",
          "active:shadow-[0_0_8px_var(--neon),0_0_16px_var(--neon-soft)] active:scale-95",
          "disabled:opacity-50 disabled:pointer-events-none",
          s.height,
          s.padding,
          s.text,
          s.gap,
          rounded,
          block && "w-full",
          className
        )}
        {...props}
      >
        {leftIcon ? (
          <span className="inline-grid place-items-center btn-icon">
            {leftIcon}
          </span>
        ) : null}
        <span className="leading-none">{children}</span>
        {rightIcon ? (
          <span className="inline-grid place-items-center btn-icon">
            {rightIcon}
          </span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
