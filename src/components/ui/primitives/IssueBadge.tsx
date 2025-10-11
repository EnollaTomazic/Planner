"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type IssueBadgeSeverity = "info" | "warning" | "critical" | "success";

const SEVERITY_CLASSNAMES: Record<IssueBadgeSeverity, string> = {
  info: "border-accent/45 bg-accent/15 text-accent-foreground",
  warning: "border-warning/45 bg-warning/15 text-warning-foreground",
  critical: "border-danger/45 bg-danger/18 text-danger-foreground",
  success: "border-success/45 bg-success/18 text-success-foreground",
};

export interface IssueBadgeProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly targetId: string;
  readonly expanded?: boolean;
  readonly severity?: IssueBadgeSeverity;
}

const IssueBadge = React.forwardRef<HTMLButtonElement, IssueBadgeProps>(
  (
    {
      targetId,
      expanded,
      severity = "info",
      className,
      type,
      id,
      ...restProps
    },
    ref,
  ) => {
    const computedId = id ?? `${targetId}-issue-badge`;
    const buttonType = type ?? "button";

    return (
      <button
        {...restProps}
        ref={ref}
        id={computedId}
        type={buttonType}
        aria-controls={targetId}
        aria-expanded={expanded}
        data-expanded={expanded ? "true" : undefined}
        className={cn(
          "inline-flex h-[var(--control-h-sm)] items-center gap-[var(--space-1)]",
          "rounded-full px-[var(--space-3)] py-[var(--space-1)] text-label font-medium tracking-[0.02em]",
          "shadow-outline-subtle transition [--outline-color:var(--theme-ring)]",
          "hover:shadow-depth-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--outline-color)]",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--card))] motion-reduce:transition-none",
          "disabled:cursor-not-allowed disabled:opacity-disabled",
          "data-[expanded=true]:shadow-depth-soft",
          SEVERITY_CLASSNAMES[severity],
          className,
        )}
      />
    );
  },
);

IssueBadge.displayName = "IssueBadge";
export { IssueBadge };
