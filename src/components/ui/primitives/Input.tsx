// src/components/ui/primitives/Input.tsx
"use client";

import * as React from "react";
import { cn, slugify } from "@/lib/utils";
import FieldShell from "./FieldShell";

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
  /** Optional className for the inner <input> element */
  inputClassName?: string;
};

const SIZE: Record<InputSize, string> = {
  sm: "h-11",
  md: "h-12",
  lg: "h-14",
};

/**
 * Input — Matte field with optional trailing slot.
 * - Defaults to `tone="default"` (16px corners)
 * - Accepts className overrides and passes all standard <input> props
 * - Auto-generates stable `id` and `name` if not provided
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
    size = "sm",
    indent = false,
    children,
    ...props
  },
  ref
) {
  const auto = React.useId();
  const fromAria = slugify(ariaLabel as string | undefined);
  const finalId = id || auto;
  const finalName = name || fromAria || finalId;

  const error = props["aria-invalid"] ? true : false;
  const disabled = props.disabled;

  return (
    <FieldShell
      tone={tone}
      error={error}
      disabled={disabled}
      className={className}
      style={style}
    >
      <input
        ref={ref}
        id={finalId}
        name={finalName}
        size={typeof size === "number" ? size : undefined}
        className={cn(
          "w-full bg-transparent px-3.5 pr-10 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))/0.8] caret-[hsl(var(--accent))] border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
          typeof size === "string" ? SIZE[size] : SIZE.sm,
          indent && "pl-10",
          inputClassName
        )}
        {...props}
      />
      {children}

      {/* Autofill override */}
      <style>{`
        input:-webkit-autofill {
          box-shadow: 0 0 0 1000px hsl(var(--card)) inset;
          -webkit-text-fill-color: hsl(var(--foreground));
        }
      `}</style>
    </FieldShell>
  );
});

