// src/components/ui/primitives/input.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Small helper to generate a stable id/name from aria-label if missing. */
function slug(s?: string) {
  return (s ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .slice(0, 64);
}

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Rounded look: "pill" = capsule (default), "default" = soft 2xl corners */
  tone?: "default" | "pill";
};

const BASE =
  "block w-full h-10 px-3 " +
  "border border-[hsl(var(--border))] bg-[hsl(var(--card))] " +
  "text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] " +
  "disabled:opacity-50 disabled:cursor-not-allowed " +
  "transition-colors";

/**
 * Input — Lavender-Glitch styled input
 * - Defaults to pill-shaped (`tone="pill"`)
 * - Accepts className overrides and passes all standard <input> props
 * - Auto-generates stable `id` and `name` if not provided
 */
export default React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    id,
    name,
    "aria-label": ariaLabel,
    tone = "pill", // ⬅️ default changed here
    ...props
  },
  ref
) {
  const auto = React.useId();
  const fromAria = slug(ariaLabel as string | undefined);
  const finalId = id || fromAria || auto;
  const finalName = name || fromAria || finalId;

  return (
    <input
      ref={ref}
      id={finalId}
      name={finalName}
      className={cn(
        BASE,
        tone === "pill" ? "rounded-full" : "rounded-2xl",
        className
      )}
      {...props}
    />
  );
});
