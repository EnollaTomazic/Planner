"use client";

import * as React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface AIRetryErrorBubbleProps extends React.ComponentPropsWithoutRef<"div"> {
  readonly message: string;
  readonly hint?: string;
  readonly onRetry?: () => void;
  readonly retryLabel?: string;
  readonly icon?: React.ReactNode;
  readonly actions?: React.ReactNode;
}

const DEFAULT_RETRY_LABEL = "Retry";

const AIRetryErrorBubble = React.forwardRef<HTMLDivElement, AIRetryErrorBubbleProps>(
  (
    { message, hint, onRetry, retryLabel = DEFAULT_RETRY_LABEL, icon, actions, className, children, ...props },
    ref,
  ) => {
    const retryAction = React.useMemo(() => {
      if (!onRetry) return actions;
      if (actions) return actions;
      return (
        <Button
          type="button"
          size="sm"
          tone="danger"
          variant="quiet"
          onClick={onRetry}
          className="gap-[var(--space-2)] px-[var(--space-3)]"
        >
          <RotateCcw aria-hidden className="size-[var(--space-4)]" />
          {retryLabel}
        </Button>
      );
    }, [actions, onRetry, retryLabel]);

    return (
      <div
        ref={ref}
        role="alert"
        aria-live="assertive"
        className={cn(
          "flex items-start gap-[var(--space-3)] rounded-card border border-[hsl(var(--danger)/0.4)]",
          "bg-[hsl(var(--danger)/0.16)] p-[var(--space-3)] text-[hsl(var(--danger-foreground))] shadow-[var(--shadow-outline-subtle)]",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden
          className="grid size-[var(--space-8)] shrink-0 place-items-center rounded-full bg-[hsl(var(--danger)/0.2)] text-[hsl(var(--danger))] shadow-[var(--shadow-inset-hairline)]"
        >
          {icon ?? <AlertTriangle className="size-[var(--space-4)]" aria-hidden />}
        </span>
        <div className="flex flex-1 flex-col gap-[var(--space-2)]">
          <p className="text-label font-medium">{message}</p>
          {hint ? <p className="text-caption text-[hsl(var(--danger-foreground)/0.78)]">{hint}</p> : null}
          {children}
          {retryAction ? <div className="pt-[var(--space-1-5)]">{retryAction}</div> : null}
        </div>
      </div>
    );
  },
);

AIRetryErrorBubble.displayName = "AIRetryErrorBubble";
export { AIRetryErrorBubble };
