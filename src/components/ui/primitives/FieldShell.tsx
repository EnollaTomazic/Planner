"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FieldShellProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

const FIELD_SHELL_BASE =
  "relative inline-flex w-full items-center rounded-[var(--control-radius)] overflow-hidden border border-card-hairline bg-card/60 backdrop-blur-[2px] shadow-inner shadow-[0_0_0_1px_hsl(var(--border)/0.12)] transition-[box-shadow,transform] duration-150 ease-out hover:bg-[--hover] active:bg-[--active] hover:border-[--border-hover] active:border-[--border-active] [--border-hover:hsl(var(--border)/0.38)] [--border-active:hsl(var(--border)/0.5)] hover:shadow-[0_2px_4px_hsl(var(--shadow)/0.3)] focus-within:outline-none focus-within:shadow-[0_0_24px_hsl(var(--accent)/0.14)] data-[loading=true]:opacity-[var(--loading)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:opacity-[0.05] before:bg-[repeating-linear-gradient(0deg,hsl(var(--accent-2)/0.4)_0_1px,transparent_1px_3px),url('/noise.svg')] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:p-px after:opacity-0 after:transition-opacity after:bg-[var(--edge-iris,var(--accent))] after:[mask:linear-gradient(hsl(var(--foreground)),hsl(var(--foreground)))_content-box,linear-gradient(hsl(var(--foreground)),hsl(var(--foreground)))] after:[mask-composite:exclude]";

const FieldShell = React.forwardRef<HTMLDivElement, FieldShellProps>(
  ({ error, disabled, readOnly, className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        FIELD_SHELL_BASE,
        error
          ? "ring-2 ring-danger/35 ring-offset-0"
          : "focus-within:after:opacity-100",
        disabled && "opacity-[var(--disabled)] pointer-events-none",
        readOnly && "focus-within:after:bg-[var(--ring-muted)]",
        className,
      )}
      style={style as React.CSSProperties}
      {...props}
    />
  ),
);

FieldShell.displayName = "FieldShell";

export default FieldShell;
