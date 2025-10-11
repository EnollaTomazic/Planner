"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Field } from "../primitives/Field";
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
    const helperTone = errorText ? "danger" : success ? "success" : "muted";

    return (
      <div className="space-y-[var(--space-1)]">
        <Field.Root
          height="md"
          invalid={isInvalid}
          disabled={disabled}
          helper={errorText || helperText}
          helperId={errorId || helperId}
          helperTone={helperTone}
          className={cn(
            "group",
            success &&
              !isInvalid &&
              "border-[var(--theme-ring,var(--focus))] focus-within:ring-[var(--theme-ring,var(--focus))]",
            className,
          )}
        >
          <Field.Select
            ref={ref}
            id={finalId}
            name={finalName}
            disabled={disabled}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            aria-invalid={errorText ? "true" : props["aria-invalid"]}
            aria-describedby={describedBy}
            className={cn("pr-[calc(var(--space-6)+var(--space-2))]", selectClassName)}
            {...props}
          >
            {items.map((it) => (
              <option key={it.value} value={it.value} disabled={it.disabled}>
                {it.label}
              </option>
            ))}
          </Field.Select>
          <ChevronDown className="pointer-events-none absolute right-[var(--space-4)] size-[var(--space-4)] text-muted-foreground transition-colors duration-motion-sm ease-out group-focus-within:text-accent-3" />
        </Field.Root>
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
      </div>
    );
  },
);

NativeSelect.displayName = "NativeSelect";
export { NativeSelect };
