"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui";

export interface DashboardSectionHeaderShowCodeProps {
  id?: string;
  controls?: string;
  expanded?: boolean;
  disabled?: boolean;
  onToggle?: () => void;
  label?: string;
  expandedLabel?: string;
}

export interface DashboardSectionHeaderProps {
  title: string;
  actions?: React.ReactNode;
  loading?: boolean;
  className?: string;
  showCode?: DashboardSectionHeaderShowCodeProps;
}

const baseActionGap =
  "flex items-center gap-[var(--space-2)] sm:gap-[var(--space-3)]";

function renderTitle(title: string, loading?: boolean) {
  if (loading) {
    return (
      <Skeleton
        ariaHidden={false}
        role="status"
        aria-label="Loading section title"
        radius="sm"
        className="!h-[var(--space-5)] !w-[min(60%,var(--space-16))]"
      />
    );
  }

  return (
    <h2 className="text-title font-semibold tracking-[-0.01em] text-card-foreground">
      {title}
    </h2>
  );
}

function renderShowCode(
  showCode: DashboardSectionHeaderShowCodeProps | undefined,
  loading?: boolean,
) {
  if (!showCode && !loading) {
    return null;
  }

  if (loading) {
    return (
      <Skeleton
        ariaHidden={false}
        role="status"
        aria-label="Loading Show code action"
        radius="full"
        className="!h-[var(--control-h-sm)] !w-[calc(var(--space-8)*2)]"
      />
    );
  }

  if (!showCode) {
    return null;
  }

  const {
    id,
    controls,
    expanded,
    disabled,
    onToggle,
    label = "Show code",
    expandedLabel = "Hide code",
  } = showCode;

  return (
    <button
      type="button"
      id={id}
      onClick={onToggle}
      aria-controls={controls}
      aria-expanded={expanded}
      disabled={disabled}
      data-state={expanded ? "expanded" : undefined}
      className={cn(
        "inline-flex items-center gap-[var(--space-1)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[var(--space-1)]",
        "text-label font-medium text-accent-3 underline underline-offset-[var(--space-1)]",
        "transition-colors focus-visible:outline-none focus-visible:ring-[var(--ring-size-1)]",
        "focus-visible:ring-offset-0 ring-[var(--theme-ring)]",
        "disabled:cursor-not-allowed disabled:opacity-disabled",
      )}
    >
      {expanded ? expandedLabel : label}
    </button>
  );
}

export function DashboardSectionHeader({
  title,
  actions,
  loading,
  className,
  showCode,
}: DashboardSectionHeaderProps) {
  const shouldRenderActions = Boolean(actions) || Boolean(showCode) || loading;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-y-[var(--space-2)] gap-x-[var(--space-3)]",
        className,
      )}
    >
      {renderTitle(title, loading)}
      {shouldRenderActions ? (
        <div
          className={cn(
            baseActionGap,
            "sm:justify-end",
            loading ? "w-full sm:w-auto" : undefined,
          )}
        >
          {actions}
          {renderShowCode(showCode, loading)}
        </div>
      ) : null}
    </div>
  );
}
