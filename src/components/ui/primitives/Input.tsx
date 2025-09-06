// src/components/ui/primitives/Input.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

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
  const fromAria = slug(ariaLabel as string | undefined);
  const finalId = id || auto;
  const finalName = name || fromAria || finalId;

  const error = props["aria-invalid"] ? true : false;
  const disabled = props.disabled;

  return (
    <div
      className={cn(
        "relative inline-flex w-full items-center rounded-[16px] border border-[hsl(var(--border)/0.28)] bg-[hsl(var(--card)/0.60)] backdrop-blur-[2px] shadow-[0_0_0_1px_hsl(var(--border)/0.12)] transition-[box-shadow,transform] duration-150 ease-out hover:border-[hsl(var(--border)/0.38)] focus-within:ring-2 focus-within:ring-[hsl(var(--accent)/0.28)] focus-within:ring-offset-2 focus-within:ring-offset-[hsl(var(--background))] focus-within:shadow-[0_0_24px_hsl(var(--accent)/0.14)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:opacity-[0.05] before:bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.4)_0_1px,transparent_1px_3px)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:opacity-[0.04] after:bg-[url('https://grainy-gradients.vercel.app/noise.svg')]",
        tone === "pill" && "rounded-full",
        error && "border-[hsl(var(--destructive)/0.6)] focus-within:ring-[hsl(var(--destructive)/0.35)]",
        disabled && "opacity-60 pointer-events-none",
        className
      )}
      style={style}
    >
      <input
        ref={ref}
        id={finalId}
        name={finalName}
        size={typeof size === "number" ? size : undefined}
        className={cn(
          "w-full bg-transparent px-3.5 pr-10 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))/0.8] caret-[hsl(var(--accent))] outline-none border-none",
          typeof size === "string" ? SIZE[size] : SIZE.sm,
          indent && "pl-10"
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
    </div>
  );
});

