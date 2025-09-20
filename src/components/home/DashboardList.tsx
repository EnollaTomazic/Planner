"use client";

import * as React from "react";
import Link from "next/link";
import { CircleSlash } from "lucide-react";

import { cn } from "@/lib/utils";

function isReactKey(value: unknown): value is React.Key {
  return typeof value === "string" || typeof value === "number";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function resolveDeterministicKey<T>(
  item: T,
  index: number,
  getKey?: (item: T, itemIndex: number) => React.Key,
): React.Key | undefined {
  if (typeof getKey === "function") {
    const customKey = getKey(item, index);
    if (customKey != null) {
      return customKey;
    }
  }

  if (isReactKey(item)) {
    return item;
  }

  if (isRecord(item)) {
    const maybeId = item.id;

    if (isReactKey(maybeId)) {
      return maybeId;
    }
  }

  return undefined;
}

export type DashboardListRenderItem<T> = (
  item: T,
  index: number,
) => React.ReactNode;

export interface DashboardListProps<T> {
  items: readonly T[];
  renderItem: DashboardListRenderItem<T>;
  empty: string;
  cta?: { label: string; href: string };
  getKey?: (item: T, index: number) => React.Key;
  itemClassName?:
    | string
    | ((item: T, index: number) => string | undefined | null | false);
  className?: string;
}

export default function DashboardList<T>({
  items,
  renderItem,
  empty,
  cta,
  getKey,
  itemClassName,
  className,
}: DashboardListProps<T>): React.ReactElement {
  const hasItems = items.length > 0;
  const missingKeyWarnedRef = React.useRef(false);

  return (
    <ul
      className={cn(
        "divide-y divide-[hsl(var(--foreground)/0.16)]",
        className,
      )}
    >
      {hasItems
        ? items.map((item, index) => {
            const resolvedKey = resolveDeterministicKey(item, index, getKey);

            if (
              process.env.NODE_ENV !== "production" &&
              !missingKeyWarnedRef.current &&
              resolvedKey === undefined
            ) {
              missingKeyWarnedRef.current = true;
              console.warn(
                "DashboardList: unable to determine a stable key for one or more items. Provide a `getKey` prop when rendering DashboardList to ensure stable item identity.",
              );
            }

            const key = resolvedKey ?? index;
            const itemCls =
              typeof itemClassName === "function"
                ? itemClassName(item, index)
                : itemClassName;

            return (
              <li
                key={key}
                className={cn("py-[var(--space-2)]", itemCls)}
              >
                {renderItem(item, index)}
              </li>
            );
          })
        : (
            <li
              className={cn(
                "py-[var(--space-2)] text-ui text-muted-foreground",
                cta ? "flex items-center justify-between" : "flex items-center",
              )}
            >
              <span className="flex items-center gap-[var(--space-2)]">
                <CircleSlash aria-hidden className="size-3" />
                {empty}
              </span>
              {cta ? (
                <Link
                  href={cta.href}
                  className="inline-flex items-center text-label font-medium text-accent-3 underline underline-offset-4 transition-colors hover:text-[var(--text-on-accent)] active:text-[var(--text-on-accent)] active:bg-interaction-accent-tintActive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-0 motion-reduce:transition-none"
                >
                  {cta.label}
                </Link>
              ) : null}
            </li>
          )}
    </ul>
  );
}
