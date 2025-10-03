"use client";

import * as React from "react";

import Spinner from "@/components/ui/feedback/Spinner";
import { cn } from "@/lib/utils";

import { radioIconGroupToneClasses, type RadioIconGroupTone } from "./tone";

export type RadioIconGroupSize = "sm" | "md" | "lg";

export type RadioIconGroupOption = {
  readonly id: string;
  readonly value: string;
  readonly label: string;
  readonly icon?: React.ReactNode;
  readonly disabled?: boolean;
};

export interface RadioIconGroupProps {
  readonly name: string;
  readonly options: readonly RadioIconGroupOption[];
  readonly value: string | null;
  readonly onChange: (value: string) => void;
  readonly tone?: RadioIconGroupTone;
  readonly size?: RadioIconGroupSize;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly className?: string;
  readonly "aria-label"?: string;
  readonly "aria-labelledby"?: string;
  readonly "aria-describedby"?: string;
}

const ICON_SIZE: Record<RadioIconGroupSize, string> = {
  sm: "h-[var(--control-h-sm)] w-[var(--control-h-sm)] [&>svg]:size-[calc(var(--control-h-sm)/2)]",
  md: "h-[var(--control-h-md)] w-[var(--control-h-md)] [&>svg]:size-[calc(var(--control-h-md)/2)]",
  lg: "h-[var(--control-h-lg)] w-[var(--control-h-lg)] [&>svg]:size-[calc(var(--control-h-lg)/2)]",
};

const LABEL_SIZE: Record<RadioIconGroupSize, string> = {
  sm: "text-caption",
  md: "text-label",
  lg: "text-ui",
};

export default function RadioIconGroup({
  name,
  options,
  value,
  onChange,
  tone = "accent",
  size = "md",
  disabled = false,
  loading = false,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
}: RadioIconGroupProps) {
  const groupId = React.useId();
  const resolvedLabel = ariaLabelledby ? undefined : ariaLabel;

  const isDisabled = disabled || loading;

  const toneClass = radioIconGroupToneClasses[tone];

  return (
    <div
      role="radiogroup"
      aria-labelledby={ariaLabelledby}
      aria-label={resolvedLabel}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      aria-describedby={ariaDescribedby}
      className={cn("flex flex-wrap gap-[var(--space-3)]", className)}
      data-loading={loading || undefined}
    >
      {options.map((option, index) => {
        const optionId = option.id || `${groupId}-${index}`;
        const checked = option.value === value;
        const optionDisabled = isDisabled || option.disabled;
        return (
          <div
            key={optionId}
            className="flex flex-col items-center gap-[var(--space-1)]"
            data-state={checked ? "on" : "off"}
            data-loading={loading || undefined}
          >
            <input
              id={optionId}
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              disabled={optionDisabled}
              onChange={(event) => {
                if (event.target.checked) {
                  onChange(event.target.value);
                }
              }}
              className="peer sr-only"
              aria-describedby={ariaDescribedby}
            />
            <label
              htmlFor={optionId}
              className={cn(
                "group/radio flex cursor-pointer flex-col items-center gap-[var(--space-1)] text-center",
                "text-muted-foreground transition-colors duration-motion-sm ease-out",
                "peer-disabled:cursor-not-allowed peer-disabled:opacity-disabled",
                toneClass.text,
              )}
              data-state={checked ? "on" : "off"}
              data-disabled={optionDisabled || undefined}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "relative inline-grid place-items-center rounded-full border border-card-hairline/60 bg-card",
                  "text-muted-foreground shadow-control transition-all duration-motion-sm ease-out",
                  "group-hover/radio:shadow-control-hover",
                  "motion-reduce:shadow-none motion-reduce:transition-none",
                  "peer-disabled:shadow-none",
                  ICON_SIZE[size],
                  "[--radio-glow:transparent]",
                  "peer-checked:shadow-[0_0_var(--space-3)_var(--radio-glow)]",
                  "peer-focus-visible:outline-none peer-focus-visible:ring-2",
                  "peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[color:var(--surface-2)]",
                  "motion-safe:group-active/radio:scale-95 motion-reduce:transform-none",
                  toneClass.surface,
                  toneClass.ring,
                  toneClass.glow,
                  toneClass.lift,
                )}
              >
                {loading && checked ? (
                  <span className="absolute inset-0 grid place-items-center rounded-full bg-card/70">
                    <Spinner size="sm" className="text-muted-foreground" />
                  </span>
                ) : null}
                {option.icon ?? null}
                <span className="pointer-events-none absolute inset-0 rounded-full" />
              </span>
              <span
                className={cn(
                  "text-balance text-muted-foreground",
                  "transition-colors duration-motion-sm ease-out",
                  LABEL_SIZE[size],
                  toneClass.text,
                )}
              >
                {option.label}
              </span>
            </label>
          </div>
        );
      })}
    </div>
  );
}

export type { RadioIconGroupTone } from "./tone";
