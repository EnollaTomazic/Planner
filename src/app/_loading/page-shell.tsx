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

export const layoutGridClassName =
  "[--grid-gutter:var(--space-4)] grid grid-cols-1 gap-[var(--grid-gutter)] md:[--grid-gutter:var(--space-5)]";

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
    <Component className={cn("page-shell", className)} {...rest}>
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
