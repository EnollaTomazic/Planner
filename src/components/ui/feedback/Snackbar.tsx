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
        "mx-auto w-fit rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-4 py-2 text-sm shadow-sm",
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
            className="underline underline-offset-2 text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--theme-ring]"
            onClick={onAction}
          >
            {actionLabel}
          </button>
        </>
      ) : null}
    </div>
  );
}
