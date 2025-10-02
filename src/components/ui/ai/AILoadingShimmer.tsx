import * as React from "react";

import { Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface AILoadingShimmerProps
  extends React.ComponentPropsWithoutRef<"div"> {
  readonly lines?: number;
  readonly showAvatar?: boolean;
  readonly label?: string;
}

const DEFAULT_LABEL = "Generating response…";
const MIN_LINES = 2;

const AILoadingShimmer = React.forwardRef<HTMLDivElement, AILoadingShimmerProps>(
  (
    { lines = 3, showAvatar = true, label = DEFAULT_LABEL, className, children, ...props },
    ref,
  ) => {
    const normalizedLines = Math.max(lines, MIN_LINES);

    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={cn(
          "flex gap-[var(--space-3)] rounded-card bg-[hsl(var(--surface-1)/0.65)] p-[var(--space-3)] shadow-[var(--shadow-outline-faint)]",
          className,
        )}
        {...props}
      >
        {showAvatar ? (
          <Skeleton
            aria-hidden
            radius="full"
            className="size-[var(--space-9)] shrink-0 shadow-[var(--shadow-inset-hairline)]"
          />
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-2)]">
          <p className="text-label font-medium text-muted-foreground" aria-live="polite">
            {label}
          </p>
          <div className="flex flex-col gap-[var(--space-2)]">
            {Array.from({ length: normalizedLines }).map((_, index) => (
              <Skeleton
                key={index}
                className={cn(
                  "h-[var(--space-3)] w-full shadow-[var(--shadow-inset-hairline)]",
                  index === normalizedLines - 1 ? "w-[80%]" : undefined,
                )}
                radius="full"
              />
            ))}
          </div>
          {children ? <div className="pt-[var(--space-2)]">{children}</div> : null}
        </div>
      </div>
    );
  },
);

AILoadingShimmer.displayName = "AILoadingShimmer";

export default AILoadingShimmer;
