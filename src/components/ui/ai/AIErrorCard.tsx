"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import Button from "../primitives/Button";
import Card, {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../primitives/Card";
import { cn } from "@/lib/utils";

export interface AIErrorCardProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly title?: string;
  readonly description?: string;
  readonly retryLabel?: string;
  readonly onRetry?: () => void;
  readonly actions?: React.ReactNode;
  readonly icon?: React.ReactNode;
  readonly children?: React.ReactNode;
}

const DEFAULT_TITLE = "We couldn't finish that";
const DEFAULT_DESCRIPTION = "Retry the request or adjust your prompt.";
const DEFAULT_RETRY_LABEL = "Try again";

const AIErrorCard = React.forwardRef<HTMLDivElement, AIErrorCardProps>(
  (
    {
      title = DEFAULT_TITLE,
      description = DEFAULT_DESCRIPTION,
      retryLabel = DEFAULT_RETRY_LABEL,
      onRetry,
      actions,
      icon,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const actionArea = React.useMemo(() => {
      if (actions) {
        return actions;
      }
      if (!onRetry) {
        return null;
      }
      return (
        <Button
          size="sm"
          tone="danger"
          variant="quiet"
          onClick={onRetry}
          type="button"
          data-variant="ai-error-retry"
        >
          {retryLabel}
        </Button>
      );
    }, [actions, onRetry, retryLabel]);

    return (
      <Card
        ref={ref}
        depth="raised"
        role="alert"
        aria-live="assertive"
        className={cn(
          "border-danger/45 bg-danger/10 text-danger-foreground shadow-outline-subtle",
          "backdrop-blur-sm",
          className,
        )}
        {...props}
      >
        <CardHeader className="space-y-[var(--space-2)]">
          <div className="flex items-start gap-[var(--space-2)]">
            <span
              aria-hidden="true"
              className="mt-[var(--space-1)] text-danger"
            >
              {icon ?? <AlertTriangle className="size-[var(--space-5)]" />}
            </span>
            <div className="space-y-[var(--space-1)]">
              <CardTitle className="text-danger">{title}</CardTitle>
              {description ? (
                <CardDescription className="text-danger-foreground/90">
                  {description}
                </CardDescription>
              ) : null}
            </div>
          </div>
        </CardHeader>
        {children ? (
          <CardContent className="space-y-[var(--space-2)] text-ui text-danger-foreground/90">
            {children}
          </CardContent>
        ) : null}
        {actionArea ? (
          <CardFooter className="flex flex-wrap gap-[var(--space-2)] pt-[var(--space-3)]">
            {actionArea}
          </CardFooter>
        ) : null}
      </Card>
    );
  },
);

AIErrorCard.displayName = "AIErrorCard";

export default AIErrorCard;
