"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export default function Spinner({
  className,
  size = "var(--space-6)",
}: {
  className?: string;
  size?: string | number;
}) {
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
