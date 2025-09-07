"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FieldShellProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "default" | "pill";
  error?: boolean;
  disabled?: boolean;
}

const FIELD_SHELL_BASE =
  "relative inline-flex w-full items-center rounded-xl border border-[hsl(var(--border)/0.28)] bg-[hsl(var(--card)/0.6)] backdrop-blur-[2px] shadow-[0_0_0_1px_hsl(var(--border)/0.12)] transition-[box-shadow,transform] duration-150 ease-out hover:border-[hsl(var(--border)/0.38)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[--theme-ring] focus-within:ring-offset-0 focus-within:shadow-[0_0_24px_hsl(var(--accent)/0.14)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:opacity-[0.05] before:bg-[repeating-linear-gradient(0deg,rgba(195,255,255,0.4)_0_1px,transparent_1px_3px)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:opacity-[0.04] after:bg-[url('/noise.svg')]";

const FieldShell = React.forwardRef<HTMLDivElement, FieldShellProps>(
  ({ tone = "default", error, disabled, className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        FIELD_SHELL_BASE,
        tone === "pill" && "rounded-full",
        error &&
          "border-[hsl(var(--destructive)/0.6)] focus-within:ring-[hsl(var(--destructive)/0.35)]",
        disabled && "opacity-60 pointer-events-none",
        className
      )}
      style={{ "--theme-ring": "hsl(var(--ring))", ...style } as React.CSSProperties}
      {...props}
    />
  )
);

FieldShell.displayName = "FieldShell";

export default FieldShell;

