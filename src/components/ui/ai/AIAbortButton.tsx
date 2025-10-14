"use client";

import * as React from "react";
import { StopCircle } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui";
import { cn } from "@/lib/utils";

type ButtonElementProps = Extract<ButtonProps, { asChild?: false; href?: undefined }>;

export interface AIAbortButtonProps
  extends Omit<ButtonElementProps, "onClick" | "children"> {
  readonly onAbort: () => void;
  readonly label?: string;
  readonly busy?: boolean;
  readonly children?: React.ReactNode;
  readonly icon?: React.ReactNode;
}

const DEFAULT_LABEL = "Stop generation";

const AIAbortButton = React.forwardRef<HTMLButtonElement, AIAbortButtonProps>(
  (
    { onAbort, label = DEFAULT_LABEL, busy = false, icon, className, children, disabled, ...props },
    ref,
  ) => {
    const resolvedDisabled = disabled ?? !busy;

    return (
      <Button
        ref={ref}
        type="button"
        size="sm"
        tone="danger"
        variant="quiet"
        onClick={onAbort}
        disabled={resolvedDisabled}
        data-busy={busy ? "true" : undefined}
        className={cn(
          "gap-[var(--space-2)] px-[var(--space-3)] text-label font-medium",
          className,
        )}
        aria-label={children ? undefined : label}
        aria-live="polite"
        {...props}
      >
        <span aria-hidden className="inline-flex items-center">
          {icon ?? <StopCircle className="size-[var(--space-4)]" aria-hidden />}
        </span>
        <span className="sr-only sm:not-sr-only">{children ?? label}</span>
      </Button>
    );
  },
);

AIAbortButton.displayName = "AIAbortButton";
export { AIAbortButton };
