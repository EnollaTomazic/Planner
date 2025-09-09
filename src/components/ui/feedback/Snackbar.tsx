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
        "mx-auto w-fit rounded-2xl border border-border bg-surface-2 px-4 py-2 text-sm shadow-sm",
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
            className="underline underline-offset-2"
            onClick={onAction}
          >
            {actionLabel}
          </button>
        </>
      ) : null}
    </div>
  );
}
