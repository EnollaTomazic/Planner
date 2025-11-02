"use client";

import * as React from "react";
import { Ghost } from "lucide-react";

import { Badge } from "@/components/ui";
import type { BadgeProps } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface GenericListStatus {
  label: React.ReactNode;
  tone?: BadgeProps["tone"];
}

export interface GenericListEmptyState {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export interface GenericListItemContext {
  index: number;
  statusBadge: React.ReactNode | null;
}

export interface GenericListProps<T> {
  items: readonly T[];
  renderItem: (item: T, context: GenericListItemContext) => React.ReactNode;
  getKey?: (item: T, index: number) => React.Key;
  getStatus?: (item: T) => GenericListStatus | null | undefined;
  emptyState?: GenericListEmptyState;
  className?: string;
  listClassName?: string;
  itemClassName?: string;
  testId?: string;
}

const DEFAULT_EMPTY: GenericListEmptyState = {
  title: "Nothing here yet",
  description: "Add an item to get started.",
};

export function GenericList<T>({
  items,
  renderItem,
  getKey,
  getStatus,
  emptyState,
  className,
  listClassName,
  itemClassName,
  testId,
}: GenericListProps<T>) {
  if (!items.length) {
    const { title, description, action } = emptyState ?? DEFAULT_EMPTY;
    return (
      <div
        className={cn(
          "relative isolate flex flex-col items-center justify-center gap-[var(--space-3)] overflow-hidden",
          "rounded-[var(--control-radius-lg)] border border-card-hairline/60 bg-card/60 p-[var(--space-6)] text-center",
          "text-ui text-muted-foreground glitch-card",
          className,
        )}
        aria-live="polite"
        data-testid={testId}
      >
        <span
          aria-hidden
          className="glitch-anim inline-flex items-center justify-center rounded-full border border-border/40 bg-card/70 p-[var(--space-3)] text-muted-foreground motion-reduce:animate-none"
          data-text=""
        >
          <Ghost aria-hidden className="size-[var(--space-5)]" />
        </span>
        <div className="space-y-[var(--space-1)]">
          <p className="text-card-foreground">{title}</p>
          {description ? <p>{description}</p> : null}
        </div>
        {action}
      </div>
    );
  }

  return (
    <div className={className} data-testid={testId}>
      <ul className={cn("m-0 list-none p-0", listClassName)}>
        {items.map((item, index) => {
          const key = getKey ? getKey(item, index) : index;
          const statusInfo = getStatus?.(item);
          const statusBadge = statusInfo ? (
            <Badge tone={statusInfo.tone ?? "neutral"} size="sm">
              {statusInfo.label}
            </Badge>
          ) : null;

          return (
            <li key={key} className={cn("list-none", itemClassName)}>
              {renderItem(item, { index, statusBadge })}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
