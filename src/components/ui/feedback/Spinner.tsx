"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export default function Spinner({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-[hsl(var(--accent))] border-t-transparent",
        className
      )}
      style={{ width: size, height: size }}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
