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
  width?: "auto" | "full";
}

const BASE_CLASSNAME =
  "inline-flex items-center justify-between gap-[var(--space-3)] rounded-card r-card-lg [--snackbar-border:hsl(var(--border))] [--snackbar-background:hsl(var(--surface-2))] [--snackbar-foreground:hsl(var(--foreground))] border border-[var(--snackbar-border)] bg-[var(--snackbar-background)] px-[var(--space-4)] py-[var(--space-2)] text-ui text-[var(--snackbar-foreground)] shadow-outline-subtle transition-colors duration-quick ease-out motion-reduce:transition-none";

const widthClassNames: Record<NonNullable<SnackbarProps["width"]>, string> = {
  auto: "mx-auto w-fit",
  full: "w-full",
};

const toneClassNames: Record<SnackbarTone, string> = {
  default: "",
  danger:
    "[--snackbar-border:hsl(var(--danger)/0.45)] [--snackbar-background:theme('colors.interaction.danger.surfaceHover')] [--snackbar-foreground:hsl(var(--danger-foreground))] shadow-outline-subtle",
};

export default function Snackbar({
  message,
  actionLabel,
  actionAriaLabel,
  onAction,
  className,
  tone = "default",
  width = "auto",
  ...props
}: SnackbarProps) {
  const toneClassName = toneClassNames[tone] ?? toneClassNames.default;
  const widthClassName = widthClassNames[width] ?? widthClassNames.auto;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(BASE_CLASSNAME, widthClassName, toneClassName, className)}
      {...props}
    >
      <span className="flex-1 text-left leading-snug">{message}</span>
      {actionLabel && onAction ? (
        <button
          type="button"
          className={cn(
            "inline-flex items-center font-medium text-accent-3 underline underline-offset-4 transition-colors",
            "hover:text-on-accent focus-visible:rounded-[var(--radius-md)] focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--snackbar-background)]",
            "active:text-accent-3 active:opacity-80 disabled:text-muted-foreground disabled:no-underline disabled:pointer-events-none",
            "flex-shrink-0",
          )}
          onClick={onAction}
          aria-label={actionAriaLabel ?? actionLabel}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
