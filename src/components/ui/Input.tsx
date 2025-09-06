// src/components/ui/Input.tsx
"use client";

import * as React from "react";
import { cn, slugify } from "@/lib/utils";

type InputSize = "sm" | "md" | "lg";

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  tone?: "default" | "pill";
  size?: InputSize | number;
  indent?: boolean;
  helperText?: string;
  errorText?: string;
  leadingIcon?: React.ReactNode;
  trailingAction?: React.ReactNode;
  success?: boolean;
};

const SIZE: Record<InputSize, string> = {
  sm: "h-11",
  md: "h-11",
  lg: "h-11",
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    helperText,
    errorText,
    leadingIcon,
    trailingAction,
    success,
    disabled,
    id,
    tone = "default",
    size = "sm",
    indent = false,
    ...props
  },
  ref
) {
  const auto = React.useId();
  const fromAria = slugify(props["aria-label"] as string | undefined);
  const finalId = id || auto;
  const finalName = props.name || fromAria || finalId;
  const describedBy = errorText ? `${finalId}-error` : helperText ? `${finalId}-helper` : undefined;
  return (
    <div className="space-y-1">
      <div
        className={cn(
          "group relative inline-flex w-full items-center rounded-[16px] border border-[hsl(var(--border)/0.25)] bg-[hsl(var(--card)/0.6)] backdrop-blur-[2px] shadow-[0_0_0_1px_hsl(var(--border)/0.12)] transition-[box-shadow,transform] duration-150 ease-out before:content-[''] before:scanlines before:opacity-5 after:content-[''] after:noise",
          "hover:border-[hsl(var(--border)/0.35)] hover:shadow-[0_0_0_1px_hsl(var(--border)/0.2)]",
          "focus-within:ring-2 focus-within:ring-[hsl(var(--accent)/0.28)] focus-within:ring-offset-2 focus-within:ring-offset-[hsl(var(--background))] focus-within:shadow-[0_0_24px_hsl(var(--accent)/0.14)] jitter",
          tone === "pill" && "rounded-full",
          errorText && "border-[hsl(var(--destructive)/0.55)] focus-within:ring-[hsl(var(--destructive)/0.35)]",
          success && "border-[hsl(var(--success)/0.45)] focus-within:ring-[hsl(var(--success)/0.28)]",
          (disabled || props.readOnly) && "opacity-60 cursor-not-allowed focus-within:ring-0 focus-within:shadow-none",
          className
        )}
      >
        {leadingIcon && (
          <span className="pl-3.5 text-[hsl(var(--muted-foreground))] group-focus-within:text-[hsl(var(--accent))] flex items-center">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={finalId}
          name={finalName}
          disabled={disabled}
          aria-invalid={errorText ? "true" : props["aria-invalid"]}
          aria-describedby={describedBy}
          size={typeof size === "number" ? size : undefined}
          className={cn(
            "flex-1 px-3.5 text-sm bg-transparent placeholder:text-[hsl(var(--muted-foreground))/0.8] text-[hsl(var(--foreground))] caret-[hsl(var(--accent))] outline-none disabled:cursor-not-allowed",
            typeof size === "string" ? SIZE[size] : "h-11",
            indent && !leadingIcon && "pl-10"
          )}
          {...props}
        />
        {trailingAction && (
          <span className="pr-3.5 text-[hsl(var(--muted-foreground))] group-focus-within:text-[hsl(var(--accent))] flex items-center">
            {trailingAction}
          </span>
        )}
      </div>
      {(helperText || errorText) && (
        <p
          id={errorText ? `${finalId}-error` : helperText ? `${finalId}-helper` : undefined}
          className={cn(
            "text-xs mt-1 line-clamp-2",
            errorText
              ? "text-[hsl(var(--destructive))]"
              : "text-[hsl(var(--muted-foreground))]"
          )}
        >
          {errorText || helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
