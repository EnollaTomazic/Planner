import * as React from "react";

import { cn } from "@/lib/utils";

export type ToolbarProps = {
  label: string;
  children: React.ReactNode;
  toolbarClassName?: string;
  orientation?: "horizontal" | "vertical";
} & React.HTMLAttributes<HTMLDivElement>;

const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  (
    {
      label,
      children,
      className,
      toolbarClassName,
      orientation = "horizontal",
      ...rest
    },
    ref,
  ) => {
    const labelId = React.useId();

    return (
      <div
        ref={ref}
        {...rest}
        role="region"
        aria-labelledby={labelId}
        className={cn(
          "relative flex rounded-full bg-surface/70 px-[var(--space-2)] py-[var(--space-1)] shadow-[var(--shadow-glow-sm)] backdrop-blur",
          className,
        )}
      >
        <span id={labelId} className="sr-only">
          {label}
        </span>
        <div
          role="toolbar"
          aria-labelledby={labelId}
          aria-orientation={orientation}
          className={cn(
            "flex w-full items-center gap-[var(--space-1)]",
            orientation === "vertical" ? "flex-col" : "flex-row",
            toolbarClassName,
          )}
        >
          {children}
        </div>
      </div>
    );
  },
);

Toolbar.displayName = "Toolbar";

export default Toolbar;
