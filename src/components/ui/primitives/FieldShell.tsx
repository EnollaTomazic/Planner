"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FieldShellProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

const FIELD_SHELL_BASE = `relative inline-flex w-full items-center rounded-[var(--control-radius)] overflow-hidden border border-card-hairline bg-card/60 backdrop-blur-[2px] shadow-control transition-[box-shadow,transform] duration-[var(--dur-quick)] ease-out motion-reduce:transition-none hover:bg-[--hover] active:bg-[--active] hover:border-[--border-hover] active:border-[--border-active] [--border-hover:hsl(var(--border)/0.38)] [--border-active:hsl(var(--border)/0.5)] hover:shadow-control-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-[hsl(var(--ring))] data-[loading=true]:opacity-[var(--loading)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:opacity-[0.05] before:bg-[repeating-linear-gradient(0deg,hsl(var(--accent-2)/0.4)_0_1px,transparent_1px_3px),var(--asset-noise-url,none)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:p-px after:opacity-0 after:transition-opacity after:duration-[var(--dur-quick)] after:ease-out after:motion-reduce:transition-none after:bg-[var(--edge-iris,var(--accent))] after:[mask:linear-gradient(hsl(var(--foreground)),hsl(var(--foreground)))_content-box,linear-gradient(hsl(var(--foreground)),hsl(var(--foreground)))] after:[mask-composite:exclude]`;

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
