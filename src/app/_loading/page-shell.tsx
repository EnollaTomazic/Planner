import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageShellElement =
  | "div"
  | "main"
  | "section"
  | "article"
  | "aside"
  | "header"
  | "footer"
  | "nav";

type PageShellOwnProps<T extends PageShellElement = "div"> = {
  as?: T;
  className?: string;
  grid?: boolean;
  contentClassName?: string;
  children?: ReactNode;
};

export type PageShellProps<T extends PageShellElement = "div"> =
  PageShellOwnProps<T> &
    Omit<ComponentPropsWithoutRef<T>, keyof PageShellOwnProps<T>>;

const baseShellClassName =
  [
    "page-shell",
    "space-y-[var(--space-6)]",
    "md:space-y-[var(--space-7)]",
    "lg:space-y-[var(--space-8)]",
  ].join(" ");

export const layoutGridClassName =
  [
    "grid",
    "grid-cols-1",
    "gap-x-[var(--space-4)]",
    "gap-y-[var(--space-6)]",
    "md:grid-cols-12",
    "md:gap-x-[var(--space-5)]",
    "md:gap-y-[var(--space-7)]",
    "lg:gap-x-[var(--space-6)]",
    "lg:gap-y-[var(--space-8)]",
  ].join(" ");

export function PageShell<T extends PageShellElement = "div">({
  as,
  className,
  grid = false,
  contentClassName,
  children,
  ...rest
}: PageShellProps<T>) {
  const Component = (as ?? "div") as PageShellElement;

  return (
    <Component className={cn(baseShellClassName, className)} {...rest}>
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
