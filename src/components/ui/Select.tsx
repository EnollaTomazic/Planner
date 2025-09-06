// src/components/ui/Select.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  helperText?: string;
  errorText?: string;
  success?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, helperText, errorText, success, disabled, id, children, ...props },
  ref
) {
  function slug(s?: string) {
    return (s ?? "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .slice(0, 64);
  }

  const auto = React.useId();
  const fromAria = slug(props["aria-label"] as string | undefined);
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
          errorText && "border-[hsl(var(--destructive)/0.55)] focus-within:ring-[hsl(var(--destructive)/0.35)]",
          success && "border-[hsl(var(--success)/0.45)] focus-within:ring-[hsl(var(--success)/0.28)]",
          disabled && "opacity-60 cursor-not-allowed focus-within:ring-0 focus-within:shadow-none",
          className
        )}
      >
        <select
          ref={ref}
          id={finalId}
          name={finalName}
          disabled={disabled}
          aria-invalid={errorText ? "true" : props["aria-invalid"]}
          aria-describedby={describedBy}
          className="flex-1 h-11 px-3.5 pr-9 text-sm bg-transparent text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))/0.8] caret-[hsl(var(--accent))] outline-none appearance-none disabled:cursor-not-allowed"
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 h-4 w-4 text-[hsl(var(--muted-foreground))] group-focus-within:text-[hsl(var(--accent))]" />
      </div>
      {(helperText || errorText) && (
        <p
          id={errorText ? `${finalId}-error` : helperText ? `${finalId}-helper` : undefined}
          className={cn(
            "text-xs mt-1 line-clamp-2",
            errorText ? "text-[hsl(var(--destructive))]" : "text-[hsl(var(--muted-foreground))]"
          )}
        >
          {errorText || helperText}
        </p>
      )}
    </div>
  );
});

export default Select;
