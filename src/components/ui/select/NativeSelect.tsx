"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import FieldShell from "../primitives/FieldShell";
import { useFieldIds } from "@/lib/useFieldIds";
import { cn } from "@/lib/utils";

import type { NativeSelectProps } from "./shared";

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  function NativeSelect(
    {
      className,
      selectClassName,
      helperText,
      errorText,
      success,
      disabled,
      id,
      items,
      value,
      onChange,
      ...props
    },
    ref,
  ) {
    const { id: finalId, name: finalName, isInvalid } = useFieldIds(
      props["aria-label"] as string | undefined,
      id,
      props.name,
      {
        ariaInvalid: errorText ? "true" : props["aria-invalid"],
      },
    );
    const successId = `${finalId}-success`;
    const errorId = errorText ? `${finalId}-error` : undefined;
    const helperId = helperText ? `${finalId}-helper` : undefined;
    const describedBy =
      [errorId, helperId, success ? successId : undefined]
        .filter(Boolean)
        .join(" ") || undefined;
    return (
      <div className="space-y-[var(--space-1)]">
        <FieldShell
          className={cn(
            "group jitter hover:shadow-[0_0_0_1px_hsl(var(--border)/0.2)]",
            success && "border-[--theme-ring] focus-within:ring-[var(--theme-ring)]",
            disabled &&
              "cursor-not-allowed focus-within:ring-0 focus-within:shadow-none",
            className,
          )}
          error={isInvalid}
          disabled={disabled}
        >
          <select
            ref={ref}
            id={finalId}
            name={finalName}
            disabled={disabled}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            aria-invalid={errorText ? "true" : props["aria-invalid"]}
            aria-describedby={describedBy}
            className={cn(
              "flex-1 h-[var(--control-h)] px-[var(--space-14)] pr-[var(--space-36)] text-ui bg-transparent text-foreground placeholder:text-muted-foreground/70 caret-accent appearance-none disabled:cursor-not-allowed focus:outline-none focus-visible:outline-none",
              selectClassName,
            )}
            {...props}
          >
            {items.map((it) => (
              <option key={it.value} value={it.value} disabled={it.disabled}>
                {it.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-[var(--space-14)] h-[var(--space-4)] w-[var(--space-4)] text-muted-foreground group-focus-within:text-accent-foreground" />
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
              "text-label mt-[var(--space-1)] line-clamp-2",
              errorText ? "text-danger" : "text-muted-foreground",
            )}
          >
            {errorText || helperText}
          </p>
        )}
      </div>
    );
  },
);

NativeSelect.displayName = "NativeSelect";

export default NativeSelect;
