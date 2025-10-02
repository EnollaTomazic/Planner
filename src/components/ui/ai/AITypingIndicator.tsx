import * as React from "react";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export interface AITypingIndicatorProps extends React.ComponentPropsWithoutRef<"div"> {
  readonly label?: string;
  readonly hint?: string;
  readonly isTyping?: boolean;
  readonly dotCount?: number;
  readonly showAvatar?: boolean;
  readonly avatar?: React.ReactNode;
}

const MIN_DOTS = 2;
const DEFAULT_DOTS = 3;
const MAX_DOTS = 5;
const DEFAULT_LABEL = "Assistant is typing";

const AITypingIndicator = React.forwardRef<HTMLDivElement, AITypingIndicatorProps>(
  (
    {
      label = DEFAULT_LABEL,
      hint,
      isTyping = true,
      dotCount = DEFAULT_DOTS,
      showAvatar = true,
      avatar,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const dots = React.useMemo(() => {
      const constrained = Math.max(MIN_DOTS, Math.min(MAX_DOTS, dotCount));
      return Array.from({ length: constrained });
    }, [dotCount]);

    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-busy={isTyping ? "true" : undefined}
        className={cn(
          "flex items-center gap-[var(--space-3)] rounded-card border border-[hsl(var(--accent)/0.35)]",
          "bg-[hsl(var(--surface)/0.72)] p-[var(--space-3)] text-left shadow-[var(--shadow-outline-faint)] backdrop-blur-sm",
          className,
        )}
        {...props}
      >
        {showAvatar ? (
          <span
            aria-hidden
            className="grid size-[var(--space-9)] place-items-center rounded-full border border-[hsl(var(--accent)/0.35)] bg-[hsl(var(--accent-soft))] text-[hsl(var(--accent-foreground))] shadow-[var(--shadow-inset-hairline)]"
          >
            {avatar ?? <Sparkles className="size-[var(--space-5)]" aria-hidden />}
          </span>
        ) : null}
        <div className="flex flex-1 flex-col gap-[var(--space-1-5)]">
          <div className="flex flex-wrap items-baseline gap-x-[var(--space-2)] gap-y-[var(--space-1)]">
            <p className="text-label font-medium text-foreground" aria-live="polite">
              {label}
            </p>
            {hint ? (
              <span className="text-caption text-muted-foreground">{hint}</span>
            ) : null}
          </div>
          <div className="flex items-center gap-[var(--space-1)]">
            {dots.map((_, index) => (
              <span
                key={index}
                aria-hidden
                className={cn(
                  "size-[var(--space-1-5)] rounded-full bg-[hsl(var(--accent))] opacity-70",
                  isTyping ? "motion-safe:animate-pulse" : undefined,
                )}
                style={isTyping ? { animationDelay: `${index * 120}ms`, animationDuration: "1200ms" } : undefined}
              />
            ))}
            {children ? (
              <span className="text-caption text-muted-foreground">{children}</span>
            ) : null}
          </div>
        </div>
      </div>
    );
  },
);

AITypingIndicator.displayName = "AITypingIndicator";

export default AITypingIndicator;
