import * as React from "react";
import { cn } from "@/lib/utils";

type SectionLabelProps<T extends React.ElementType = "h3"> = {
  as?: T;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "children">;

/** Reusable section label divider for grouping review sections. */
export default function SectionLabel<T extends React.ElementType = "h3">({
  as,
  children,
  className,
  ...props
}: SectionLabelProps<T>) {
  const Component = as ?? "h3";

  return (
    <div className="mb-[var(--space-2)] flex items-center gap-[var(--space-2)]">
      <Component
        className={cn("text-ui tracking-wide text-muted-foreground", className)}
        {...props}
      >
        {children}
      </Component>
      <div className="h-[var(--hairline-w)] flex-1 bg-gradient-to-r from-foreground/20 via-foreground/5 to-transparent" />
    </div>
  );
}

