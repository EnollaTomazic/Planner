"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const toneToBorderClass = {
  primary: "border-primary",
  accent: "border-accent",
  info: "border-accent-2",
  danger: "border-danger",
} as const;

export type SpinnerTone = keyof typeof toneToBorderClass;

const sizeToVariableClass = {
  xs: "[--spinner-size:var(--space-3)]",
  sm: "[--spinner-size:var(--space-4)]",
  md: "[--spinner-size:calc(var(--space-5)-var(--space-1))]",
  lg: "[--spinner-size:var(--space-5)]",
  xl: "[--spinner-size:var(--space-6)]",
  "2xl": "[--spinner-size:var(--space-7)]",
  "control-xs": "[--spinner-size:calc(var(--control-h-xs)/2)]",
  "control-sm": "[--spinner-size:calc(var(--control-h-sm)/2)]",
  "control-md": "[--spinner-size:calc(var(--control-h-md)/2)]",
  "control-lg": "[--spinner-size:calc(var(--control-h-lg)/2)]",
  "control-xl": "[--spinner-size:calc(var(--control-h-xl)/2)]",
} as const;

export type SpinnerSize = keyof typeof sizeToVariableClass;

type SpinnerProps = {
  className?: string;
  size?: SpinnerSize;
  tone?: SpinnerTone;
};

export function Spinner({
  className,
  size = "xl",
  tone = "accent",
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      aria-live="polite"
      className={cn(
        "inline-block h-[var(--spinner-size)] w-[var(--spinner-size)] animate-spin motion-reduce:animate-none rounded-full border border-t-transparent",
        toneToBorderClass[tone],
        sizeToVariableClass[size],
        className,
      )}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
