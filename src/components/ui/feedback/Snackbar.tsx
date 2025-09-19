"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SnackbarTone = "default" | "danger";

interface SnackbarProps extends React.HTMLAttributes<HTMLDivElement> {
  message: React.ReactNode;
  actionLabel?: string;
  actionAriaLabel?: string;
  onAction?: () => void;
  tone?: SnackbarTone;
}

const BASE_CLASSNAME =
  "mx-auto w-fit rounded-card r-card-lg [--snackbar-border:hsl(var(--border))] [--snackbar-background:hsl(var(--surface-2))] [--snackbar-foreground:hsl(var(--foreground))] border border-[var(--snackbar-border)] bg-[var(--snackbar-background)] px-[var(--space-4)] py-[var(--space-2)] text-ui text-[var(--snackbar-foreground)] shadow-sm transition-colors duration-[var(--dur-quick)] ease-out motion-reduce:transition-none";

const toneClassNames: Record<SnackbarTone, string> = {
  default: "",
  danger:
    "[--snackbar-border:hsl(var(--danger)/0.45)] [--snackbar-background:theme('colors.interaction.danger.surfaceHover')] [--snackbar-foreground:hsl(var(--danger-foreground))] shadow-[var(--shadow-glow-sm)]",
};

export default function Snackbar({
  message,
  actionLabel,
  actionAriaLabel,
  onAction,
  className,
  tone = "default",
  ...props
}: SnackbarProps) {
  const toneClassName = toneClassNames[tone] ?? toneClassNames.default;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(BASE_CLASSNAME, toneClassName, className)}
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
