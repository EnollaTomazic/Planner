"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const toneToBorderClass = {
  primary: "border-primary",
  accent: "border-accent",
  info: "border-accent-2",
  danger: "border-danger",
} as const;

export type SpinnerTone = keyof typeof toneToBorderClass;

type SpinnerProps = {
  className?: string;
  size?: CSSProperties["width"];
  tone?: SpinnerTone;
};

export default function Spinner({
  className,
  size = "var(--space-6)",
  tone = "accent",
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      aria-live="polite"
      className={cn(
        "inline-block animate-spin rounded-full border border-t-transparent",
        toneToBorderClass[tone],
        className,
      )}
      style={{ width: size, height: size }}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
