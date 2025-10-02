"use client";

import * as React from "react";

import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../primitives/Card";
import Skeleton from "../feedback/Skeleton";
import Spinner from "../feedback/Spinner";
import { cn } from "@/lib/utils";

export interface AILoadingShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly label?: string;
  readonly helperText?: string;
  readonly lines?: number;
}

const DEFAULT_LABEL = "Generating response";
const DEFAULT_HELPER_TEXT = "Stay on this page while we stream your results.";

const AILoadingShimmer = React.forwardRef<HTMLDivElement, AILoadingShimmerProps>(
  (
    {
      label = DEFAULT_LABEL,
      helperText = DEFAULT_HELPER_TEXT,
      lines = 3,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const lineCount = Math.max(1, Math.trunc(lines));
    const skeletons = React.useMemo(() => {
      return Array.from({ length: lineCount }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            "h-[var(--space-4)]",
            index === lineCount - 1 ? "w-[min(100%,var(--space-56))]" : "w-full",
          )}
        />
      ));
    }, [lineCount]);

    return (
      <Card
        ref={ref}
        depth="raised"
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={cn("border-info/45 bg-info/8 text-info-foreground", "backdrop-blur-sm", className)}
        {...props}
      >
        <CardHeader className="space-y-[var(--space-2)]">
          <div className="flex items-start gap-[var(--space-2)]">
            <Spinner tone="info" size="control-md" aria-hidden="true" />
            <div className="space-y-[var(--space-1)]">
              <CardTitle className="text-info">{label}</CardTitle>
              {helperText ? (
                <CardDescription className="text-info-foreground/90">
                  {helperText}
                </CardDescription>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-[var(--space-2)]">
          <div className="space-y-[var(--space-2)]" aria-hidden="true">
            {skeletons}
          </div>
          {children ? (
            <div className="text-label text-info-foreground/80">{children}</div>
          ) : null}
        </CardContent>
      </Card>
    );
  },
);

AILoadingShimmer.displayName = "AILoadingShimmer";

export default AILoadingShimmer;
