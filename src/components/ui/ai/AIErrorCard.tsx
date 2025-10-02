import * as React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { cn } from "@/lib/utils";

export interface AIErrorCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  readonly title?: string;
  readonly description: string;
  readonly hint?: string;
  readonly onRetry?: () => void;
  readonly retryLabel?: string;
  readonly actions?: React.ReactNode;
  readonly icon?: React.ReactNode;
}

const DEFAULT_TITLE = "Unable to complete";
const DEFAULT_RETRY_LABEL = "Try again";

const AIErrorCard = React.forwardRef<HTMLDivElement, AIErrorCardProps>(
  (
    {
      title = DEFAULT_TITLE,
      description,
      hint,
      onRetry,
      retryLabel = DEFAULT_RETRY_LABEL,
      actions,
      icon,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const retryAction = React.useMemo(() => {
      if (!onRetry) return null;
      if (actions) return actions;
      return (
        <Button
          type="button"
          size="sm"
          tone="danger"
          variant="quiet"
          onClick={onRetry}
          className="gap-[var(--space-2)] px-[var(--space-3)]"
          data-variant="ai-error"
        >
          <RotateCcw aria-hidden className="size-[var(--space-4)]" />
          {retryLabel}
        </Button>
      );
    }, [actions, onRetry, retryLabel]);

    return (
      <Card
        ref={ref}
        role="alert"
        aria-live="polite"
        className={cn(
          "border-[hsl(var(--danger)/0.45)] bg-[hsl(var(--danger)/0.12)] text-[hsl(var(--danger-foreground))] shadow-[var(--shadow-outline-subtle)] backdrop-blur-sm",
          "transition-shadow duration-motion-sm ease-out",
          className,
        )}
        {...props}
      >
        <CardHeader className="flex flex-row gap-[var(--space-3)]">
          <span
            aria-hidden
            className="mt-[var(--space-0-5)] inline-flex size-[var(--space-8)] shrink-0 items-center justify-center rounded-full bg-[hsl(var(--danger)/0.18)] text-[hsl(var(--danger))] shadow-[var(--shadow-inset-hairline)]"
          >
            {icon ?? <AlertTriangle className="size-[var(--space-4)]" aria-hidden />}
          </span>
          <div className="flex flex-1 flex-col gap-[var(--space-1-5)]">
            <CardTitle className="text-ui font-semibold tracking-[-0.01em]">
              {title}
            </CardTitle>
            <CardDescription className="text-label text-[hsl(var(--danger-foreground)/0.85)]">
              {description}
            </CardDescription>
            {hint ? (
              <p className="text-caption text-[hsl(var(--danger-foreground)/0.7)]">
                {hint}
              </p>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-[var(--space-3)] pt-[var(--space-3)]">
          {children}
          {retryAction}
        </CardContent>
      </Card>
    );
  },
);

AIErrorCard.displayName = "AIErrorCard";

export default AIErrorCard;
