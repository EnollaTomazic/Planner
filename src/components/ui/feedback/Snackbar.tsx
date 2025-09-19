"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SnackbarProps extends React.HTMLAttributes<HTMLDivElement> {
  message: React.ReactNode;
  actionLabel?: string;
  actionAriaLabel?: string;
  onAction?: () => void;
}

export default function Snackbar({
  message,
  actionLabel,
  actionAriaLabel,
  onAction,
  className,
  ...props
}: SnackbarProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "mx-auto w-fit rounded-card r-card-lg border border-border bg-surface-2 px-[var(--space-4)] py-[var(--space-2)] text-ui shadow-sm",
        className,
      )}
      {...props}
    >
      {message}
      {actionLabel && onAction ? (
        <>
          {" "}
          <button
            type="button"
            className={cn(
              "inline-flex items-center font-medium text-accent-3 underline underline-offset-4 transition-colors",
              "hover:text-[var(--text-on-accent)] focus-visible:rounded-[var(--radius-md)] focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface-2))]",
              "active:text-accent-3 active:opacity-80 disabled:text-muted-foreground disabled:no-underline disabled:pointer-events-none",
            )}
            onClick={onAction}
            aria-label={actionAriaLabel ?? actionLabel}
          >
            {actionLabel}
          </button>
        </>
      ) : null}
    </div>
  );
}
