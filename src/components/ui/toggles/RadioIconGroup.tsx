"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Spinner from "../feedback/Spinner";

export type RadioIconGroupTone = "accent" | "primary" | "info" | "danger";
export type RadioIconGroupSize = "sm" | "md" | "lg";

export type RadioIconGroupOption = {
  readonly value: string;
  readonly label: string;
  readonly icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  readonly disabled?: boolean;
};

export interface RadioIconGroupProps {
  readonly options: readonly RadioIconGroupOption[];
  readonly value: string;
  readonly onChange?: (value: string) => void;
  readonly tone?: RadioIconGroupTone;
  readonly size?: RadioIconGroupSize;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly className?: string;
  readonly "aria-label"?: string;
  readonly "aria-labelledby"?: string;
  readonly "aria-describedby"?: string;
}

const STATE_TOKEN_CLASSES =
  "[--radio-hover-surface:hsl(var(--accent)/0.16)] [--radio-active-surface:hsl(var(--accent)/0.26)] [--radio-active-border:hsl(var(--accent)/0.55)] [--radio-ring:hsl(var(--accent))] [--radio-active-foreground:hsl(var(--accent-foreground))]";

const toneTokens: Record<RadioIconGroupTone, string> = {
  accent: STATE_TOKEN_CLASSES,
  primary:
    "[--radio-hover-surface:hsl(var(--primary)/0.16)] [--radio-active-surface:hsl(var(--primary)/0.26)] [--radio-active-border:hsl(var(--primary)/0.55)] [--radio-ring:hsl(var(--primary))] [--radio-active-foreground:hsl(var(--primary-foreground))]",
  info:
    "[--radio-hover-surface:hsl(var(--accent-2)/0.16)] [--radio-active-surface:hsl(var(--accent-2)/0.26)] [--radio-active-border:hsl(var(--accent-2)/0.55)] [--radio-ring:hsl(var(--accent-2))] [--radio-active-foreground:hsl(var(--accent-2-foreground))]",
  danger:
    "[--radio-hover-surface:hsl(var(--danger)/0.16)] [--radio-active-surface:hsl(var(--danger)/0.24)] [--radio-active-border:hsl(var(--danger)/0.5)] [--radio-ring:hsl(var(--danger))] [--radio-active-foreground:hsl(var(--danger-foreground))]",
};

const sizeClasses: Record<RadioIconGroupSize, string> = {
  sm: "h-[var(--control-h-sm)] w-[var(--control-h-sm)] [&_svg]:size-[calc(var(--control-h-sm)/2)]",
  md: "h-[var(--control-h-md)] w-[var(--control-h-md)] [&_svg]:size-[calc(var(--control-h-md)/2)]",
  lg: "h-[var(--control-h-lg)] w-[var(--control-h-lg)] [&_svg]:size-[calc(var(--control-h-lg)/2)]",
};

const labelSizeClasses: Record<RadioIconGroupSize, string> = {
  sm: "text-caption",
  md: "text-label",
  lg: "text-ui",
};

export default function RadioIconGroup({
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
  const optionRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const groupId = React.useId();
  const resolvedAriaLabel = ariaLabelledby ? undefined : ariaLabel;
  const resolvedLabelledby = ariaLabelledby;

  const isGloballyDisabled = disabled || loading;

  function focusOption(targetIndex: number, direction: 1 | -1) {
    if (options.length === 0) return;
    const total = options.length;
    let index = targetIndex;
    for (let i = 0; i < total; i += 1) {
      const option = options[index];
      if (!option) break;
      const element = optionRefs.current[index];
      if (element && !element.disabled) {
        element.focus();
        break;
      }
      index = (index + direction + total) % total;
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (options.length === 0) return;
    if (event.defaultPrevented) return;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusOption((index + 1) % options.length, 1);
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusOption((index - 1 + options.length) % options.length, -1);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      focusOption(0, 1);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      focusOption(options.length - 1, -1);
      return;
    }
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      const option = options[index];
      if (!option) return;
      if (option.disabled || isGloballyDisabled) return;
      onChange?.(option.value);
    }
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby={resolvedLabelledby}
      aria-label={resolvedAriaLabel}
      aria-disabled={isGloballyDisabled || undefined}
      aria-busy={loading || undefined}
      aria-describedby={ariaDescribedby}
      className={cn("flex flex-wrap gap-[var(--space-3)]", className)}
      data-loading={loading || undefined}
    >
      {options.map((option, index) => {
        const Icon = option.icon;
        const selected = option.value === value;
        const optionDisabled = isGloballyDisabled || option.disabled;

        return (
          <div
            key={option.value}
            className={cn(
              "group flex flex-col items-center gap-[var(--space-1)]",
              toneTokens[tone],
            )}
            data-state={selected ? "on" : "off"}
            data-loading={loading || undefined}
          >
            <button
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-labelledby={`${groupId}-${option.value}`}
              aria-disabled={optionDisabled || undefined}
              disabled={optionDisabled}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onClick={() => {
                if (optionDisabled) return;
                onChange?.(option.value);
              }}
              className={cn(
                "relative inline-flex items-center justify-center rounded-full border",
                "border-card-hairline/60 bg-card text-muted-foreground transition",
                "hover:bg-[--radio-hover-surface] hover:text-foreground",
                "active:bg-[--radio-active-surface] active:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--radio-ring] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-2)]",
                "data-[state=on]:border-[--radio-active-border] data-[state=on]:bg-[--radio-active-surface] data-[state=on]:text-[--radio-active-foreground]",
                "data-[state=on]:shadow-[var(--shadow-glow-sm)]",
                "disabled:opacity-disabled disabled:pointer-events-none",
                "group-data-[loading=true]:pointer-events-none group-data-[loading=true]:opacity-loading",
                sizeClasses[size],
              )}
              data-state={selected ? "on" : "off"}
              data-loading={loading || undefined}
            >
              {loading && selected ? (
                <span className="absolute inset-0 grid place-items-center rounded-full bg-card/70">
                  <Spinner size="sm" className="text-muted-foreground" />
                </span>
              ) : null}
              <Icon aria-hidden className="transition-transform duration-motion-sm ease-out group-hover:scale-105" />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full border border-transparent"
              />
            </button>
            <span
              id={`${groupId}-${option.value}`}
              className={cn(
                "text-muted-foreground transition-colors",
                "group-data-[state=on]:text-foreground",
                labelSizeClasses[size],
              )}
              data-state={selected ? "on" : "off"}
            >
              {option.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
