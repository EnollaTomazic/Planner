"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type SpinnerProps = {
  className?: string;
  size?: CSSProperties["width"];
};

export default function Spinner({
  className,
  size = "var(--space-6)",
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      aria-live="polite"
      className={cn(
        "inline-block animate-spin rounded-full border border-accent border-t-transparent",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
