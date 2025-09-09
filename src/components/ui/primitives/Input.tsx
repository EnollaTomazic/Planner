// src/components/ui/primitives/Input.tsx
"use client";

import * as React from "react";
import { cn, slugify } from "@/lib/utils";
import FieldShell from "./FieldShell";

export type InputSize = "sm" | "md" | "lg";

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "height"
> & {
  /** Rounded look: "pill" = capsule, "default" = 16px corners (default) */
  tone?: "default" | "pill";
  /** Visual height of the control (defaults to medium) */
  height?: InputSize | number;
  /** When true, increases left padding for icons */
  indent?: boolean;
  /** Optional className for the inner <input> element */
  inputClassName?: string;
  /** Reserve space for a trailing slot even if no children are provided */
  hasEndSlot?: boolean;
};

const HEIGHT: Record<InputSize, string> = {
  sm: "2.25rem", // h-9
  md: "2.5rem", // h-10
  lg: "2.75rem", // h-11
};

/**
 * Input — Matte field with optional trailing slot.
 * - Defaults to `tone="default"` (16px corners)
 * - Accepts className overrides and passes all standard <input> props
 * - Auto-generates a stable `id`; if no `name` is supplied, the generated id is
 *   reused to ensure uniqueness. The `aria-label` is only slugified when a
 *   custom `id` guarantees uniqueness.
 */
export default React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    inputClassName,
    style,
    id,
    name,
    "aria-label": ariaLabel,
    tone = "default",
    height = "md",
    indent = false,
    children,
    hasEndSlot = false,
    ...props
  },
  ref
) {
  const auto = React.useId();
  const fromAria = slugify(ariaLabel as string | undefined);
  const finalId = id || auto;
  const finalName = name || (id ? fromAria : undefined) || finalId;

  const error =
    props["aria-invalid"] === true || props["aria-invalid"] === "true";
  const disabled = props.disabled;

  const showEndSlot = hasEndSlot || React.Children.count(children) > 0;

  const controlHeight =
    typeof height === "string"
      ? HEIGHT[height]
      : typeof height === "number"
        ? `${height / 4}rem`
        : HEIGHT.md;

  return (
    <FieldShell
      tone={tone}
      error={error}
      disabled={disabled}
      className={className}
      style={{ "--control-h": controlHeight, ...style } as React.CSSProperties}
    >
      <input
        ref={ref}
        id={finalId}
        name={finalName}
        className={cn(
          "w-full bg-transparent px-4 text-sm text-foreground placeholder:text-muted-foreground/80 caret-accent border-none focus:outline-none focus-visible:outline-none h-[var(--control-h)]",
          indent && "pl-7",
          showEndSlot && "pr-7",
          inputClassName
        )}
        {...props}
      />
      {children}
    </FieldShell>
  );
});

