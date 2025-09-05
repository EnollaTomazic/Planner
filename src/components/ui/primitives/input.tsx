// src/components/ui/primitives/input.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { neuInset } from "./neu";

/** Small helper to generate a stable name from aria-label if missing. */
function slug(s?: string) {
  return (s ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .slice(0, 64);
}

type InputSize = "sm" | "md" | "lg";

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  /** Rounded look: "pill" = capsule, "default" = 16px corners (default) */
  tone?: "default" | "pill";
  /** Visual size of the control (defaults to small) */
  size?: InputSize | number;
  /** When true, increases left padding for icons */
  indent?: boolean;
};

const BASE =
  "block w-full max-w-[343px] rounded-2xl bg-[hsl(var(--panel)/0.9)] " +
  "text-[hsl(var(--text))] placeholder:text-[hsl(var(--muted-foreground))] " +
  "ring-1 ring-[hsl(var(--line)/0.8)] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] " +
  "disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

const SIZE: Record<InputSize, string> = {
  sm: "h-9 px-3 py-2 text-sm",
  md: "h-[52px] px-4 py-3 text-base",
  lg: "h-14 px-6 py-4 text-lg",
};

/**
 * Input — Lavender-Glitch styled input
 * - Defaults to `tone="default"` (16px corners)
 * - Accepts className overrides and passes all standard <input> props
 * - Auto-generates stable `id` and `name` if not provided
 */
export default React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    style,
    id,
    name,
    "aria-label": ariaLabel,
    tone = "default",
    size = "sm",
    indent = false,
    ...props
  },
  ref
) {
  const auto = React.useId();
  const fromAria = slug(ariaLabel as string | undefined);
  // Always derive a unique id from React to avoid duplicates when the same
  // aria-label is used for multiple fields.
  const finalId = id || auto;
  const finalName = name || fromAria || finalId;

  return (
    <input
      ref={ref}
      id={finalId}
      name={finalName}
      size={typeof size === "number" ? size : undefined}
      className={cn(
        BASE,
        typeof size === "string" ? SIZE[size] : SIZE.sm,
        tone === "pill" ? "rounded-full" : undefined,
        indent && "pl-10",
        "relative before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/10 before:to-transparent",
        className
      )}
      style={{ boxShadow: neuInset(10), ...style }}
      {...props}
    />
  );
});
