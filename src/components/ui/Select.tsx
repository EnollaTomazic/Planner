// src/components/ui/Select.tsx
"use client";

import * as React from "react";
import { cn, slugify } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import FieldShell from "./primitives/FieldShell";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  helperText?: string;
  errorText?: string;
  success?: boolean;
  /** Optional className for the inner <select> element */
  selectClassName?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    className,
    selectClassName,
    helperText,
    errorText,
    success,
    disabled,
    id,
    children,
    ...props
  },
  ref
) {
  const auto = React.useId();
  const fromAria = slugify(props["aria-label"] as string | undefined);
  const finalId = id || auto;
  const finalName = props.name || fromAria || finalId;
  const successId = `${finalId}-success`;
  const errorId = errorText ? `${finalId}-error` : undefined;
  const helperId = helperText ? `${finalId}-helper` : undefined;
  const describedBy = [errorId, helperId, success ? successId : undefined]
    .filter(Boolean)
    .join(" ") || undefined;
  return (
    <div className="space-y-1">
      <FieldShell
        className={cn(
          "group jitter hover:shadow-[0_0_0_1px_hsl(var(--border)/0.2)]",
          success &&
            "border-[--theme-ring] focus-within:ring-[--theme-ring]",
          disabled && "cursor-not-allowed focus-within:ring-0 focus-within:shadow-none",
          className
        )}
        error={!!errorText}
        disabled={disabled}
      >
        <select
          ref={ref}
          id={finalId}
          name={finalName}
          disabled={disabled}
          aria-invalid={errorText ? "true" : props["aria-invalid"]}
          aria-describedby={describedBy}
          className={cn(
            "flex-1 h-11 px-[var(--space-14)] pr-[var(--space-36)] text-sm bg-transparent text-foreground placeholder:text-muted-foreground/80 caret-accent appearance-none disabled:cursor-not-allowed focus:outline-none focus-visible:outline-none",
            selectClassName
          )}
          {...props}
        >
          {children}
        </select>
          <ChevronDown className="pointer-events-none absolute right-[var(--space-14)] h-4 w-4 text-muted-foreground group-focus-within:text-accent" />
      </FieldShell>
      {success && (
        <p
          id={successId}
          className="sr-only"
          role="status"
          aria-live="polite"
        >
          Selection saved
        </p>
      )}
      {(helperText || errorText) && (
        <p
          id={errorId || helperId}
          className={cn(
            "text-xs mt-1 line-clamp-2",
            errorText ? "text-danger" : "text-muted-foreground"
          )}
        >
          {errorText || helperText}
        </p>
      )}
    </div>
  );
});

export default Select;
