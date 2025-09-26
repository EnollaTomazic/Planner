// src/components/ui/layout/PageShell.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type PageShellElement = "div" | "main" | "section" | "article" | "aside" | "header" | "footer" | "nav";

type PageShellOwnProps<T extends PageShellElement = "div"> = {
  /** Semantic element for the shell container. Defaults to a <div>. */
  as?: T;
  className?: string;
  /**
   * Enables the standardized 12-column grid within the page shell.
   * When set, children should define their own col-span wrappers.
   */
  grid?: boolean;
  /** Additional classes for the inner grid container when `grid` is enabled. */
  contentClassName?: string;
};

export type PageShellProps<T extends PageShellElement = "div"> =
  PageShellOwnProps<T> &
    Omit<React.ComponentPropsWithoutRef<T>, keyof PageShellOwnProps<T>>;

/**
 * PageShell — width-constrained wrapper that applies the global `page-shell` class.
 * Use the `grid` prop to opt into the standard 12-column layout inside the shell.
 */
export const layoutGridClassName =
  "[--grid-gutter:var(--space-4)] grid grid-cols-1 gap-[var(--grid-gutter)] md:[--grid-gutter:var(--space-5)]";

export default function PageShell<T extends PageShellElement = "div">({
  as,
  className,
  grid = false,
  contentClassName,
  children,
  ...rest
}: PageShellProps<T>) {
  const Component = (as ?? "div") as PageShellElement;

  return (
    <Component
      className={cn("page-shell", className)}
      {...rest}
    >
      {grid ? (
        <div
          className={cn(
            layoutGridClassName,
            "md:grid-cols-12",
            contentClassName,
          )}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </Component>
  );
}
