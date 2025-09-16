// src/components/ui/layout/PageShell.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type PageShellElement = "div" | "main" | "section" | "article" | "aside" | "header" | "footer" | "nav";

type PageShellOwnProps<T extends PageShellElement = "div"> = {
  /** Semantic element for the shell container. Defaults to a <div>. */
  as?: T;
  className?: string;
};

export type PageShellProps<T extends PageShellElement = "div"> =
  PageShellOwnProps<T> &
    Omit<React.ComponentPropsWithoutRef<T>, keyof PageShellOwnProps<T>>;

/**
 * PageShell — width-constrained wrapper that applies the global `page-shell` class.
 */
export default function PageShell<T extends PageShellElement = "div">({
  as,
  className,
  children,
  ...rest
}: PageShellProps<T>) {
  const Component = (as ?? "div") as PageShellElement;

  return (
    <Component className={cn("page-shell", className)} {...rest}>
      {children}
    </Component>
  );
}
