"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  vibe?: "glitch" | "lift" | "none";
  loading?: boolean;
  block?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  pill?: boolean;
};

const sizeMap: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

const gapMap: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "gap-1.5",
  md: "gap-2",
  lg: "gap-2.5",
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

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center select-none font-medium transition",
          "focus-visible:outline-none",
          "bg-[var(--btn-bg)] text-[var(--btn-fg)]",
          "hover:shadow-[0_0_8px_var(--neon),0_0_16px_var(--neon-soft)]",
          "focus-visible:shadow-[0_0_8px_var(--neon),0_0_16px_var(--neon-soft)]",
          "active:shadow-[0_0_8px_var(--neon),0_0_16px_var(--neon-soft)] active:scale-95",
          "disabled:opacity-50 disabled:pointer-events-none",
          sizeMap[size],
          gapMap[size],
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
