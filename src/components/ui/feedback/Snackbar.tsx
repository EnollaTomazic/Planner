"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SnackbarProps extends React.HTMLAttributes<HTMLDivElement> {
  message: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export default function Snackbar({
  message,
  actionLabel,
  onAction,
  className,
  ...props
}: SnackbarProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "mx-auto w-fit rounded-card r-card-lg border border-border bg-surface-2 px-4 py-2 text-sm shadow-sm",
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
              "inline-flex items-center font-medium text-accent underline underline-offset-4 transition-colors",
              "hover:text-accent-foreground focus-visible:rounded-sm focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface-2))]",
              "active:text-[hsl(var(--accent)/0.8)] disabled:text-muted-foreground disabled:no-underline disabled:pointer-events-none",
            )}
            onClick={onAction}
          >
            {actionLabel}
          </button>
        </>
      ) : null}
    </div>
  );
}
