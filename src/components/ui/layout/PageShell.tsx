// src/components/ui/layout/PageShell.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type PageShellElement = "div" | "main" | "section" | "article" | "aside" | "header" | "footer" | "nav";

type PageShellSpacing = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

type PageShellPadding =
  | PageShellSpacing
  | {
      block?: PageShellSpacing;
      top?: PageShellSpacing;
      bottom?: PageShellSpacing;
    };

type PageShellSafeArea = "top" | "bottom" | "both";

export type PageShellSlots = {
  root?: string;
  content?: string;
};

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
  /**
   * Controls the vertical padding applied by the shell using spacing tokens.
   * Accepts a single token or overrides for block/top/bottom values.
   */
  padding?: PageShellPadding;
  /** Sets the vertical rhythm (equivalent to Tailwind's space-y utilities). */
  stack?: PageShellSpacing;
  /**
   * Adds viewport safe-area insets to the chosen edges.
   * Useful for sticky chrome near notches and home indicators.
   */
  safeArea?: PageShellSafeArea;
  /** Optional slot overrides for the root wrapper and the inner grid. */
  slots?: PageShellSlots;
};

export type PageShellProps<T extends PageShellElement = "div"> =
  PageShellOwnProps<T> &
    Omit<React.ComponentPropsWithoutRef<T>, keyof PageShellOwnProps<T>>;

/**
 * PageShell — width-constrained wrapper that applies the global `page-shell` class.
 * Use the `grid` prop to opt into the standard 12-column layout inside the shell.
 */
const DEFAULT_PADDING: PageShellSpacing = 6;

function resolvePadding(input: PageShellPadding | undefined) {
  if (typeof input === "number") {
    return { top: input, bottom: input };
  }
  const block = input?.block ?? DEFAULT_PADDING;
  return {
    top: input?.top ?? block,
    bottom: input?.bottom ?? block,
  };
}

export default function PageShell<T extends PageShellElement = "div">({
  as,
  className,
  grid = false,
  contentClassName,
  padding,
  stack = 0,
  safeArea,
  slots,
  children,
  ...rest
}: PageShellProps<T>) {
  const Component = (as ?? "div") as PageShellElement;
  const { top: paddingTop, bottom: paddingBottom } = resolvePadding(padding);
  const resolvedStack = stack ?? 0;
  const safeAreaTop = safeArea === "top" || safeArea === "both";
  const safeAreaBottom = safeArea === "bottom" || safeArea === "both";
  const mainAccessibilityProps: Partial<React.ComponentPropsWithoutRef<"main">> =
    Component === "main"
      ? { id: "main-content", tabIndex: -1 }
      : {};

  const rootClassName = cn("page-shell", slots?.root, className);
  const resolvedContentClassName = cn(slots?.content, contentClassName);

  return (
    <Component
      className={rootClassName}
      data-padding-top={paddingTop}
      data-padding-bottom={paddingBottom}
      data-stack={resolvedStack}
      data-safe-area-top={safeAreaTop ? "true" : undefined}
      data-safe-area-bottom={safeAreaBottom ? "true" : undefined}
      {...mainAccessibilityProps}
      {...rest}
    >
      {grid ? (
        <div
          className={cn(
            "grid gap-[var(--space-4)] md:grid-cols-12 lg:gap-[var(--space-5)]",
            resolvedContentClassName
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
