// src/components/chrome/Banner.tsx
"use client";

import * as React from "react";
import { PageShell } from "@/components/ui";
import { cn } from "@/lib/utils";

export type BannerProps = {
  sticky?: boolean;
  title?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

/**
 * Banner — simple page header row.
 * - sticky uses .sticky-blur surface and a hairline.
 * - no mystery CSS variables; uses theme tokens.
 */
export default function Banner({
  sticky = false,
  title,
  actions,
  children,
  className,
}: BannerProps) {
  return (
    <header
      className={cn(
        "relative overflow-hidden",
        sticky ? "sticky top-0 z-30 sticky-blur" : "",
        className
      )}
    >
      {sticky ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,hsl(var(--glow)/0.75),hsl(var(--accent-2)),hsl(var(--glow)/0.75))] opacity-80"
        />
      ) : null}
      <PageShell
        grid
        className="py-[var(--space-1)]"
        contentClassName="items-center gap-y-[var(--space-1)]"
      >
        {title ? (
          <div className="col-span-full font-mono text-ui text-muted-foreground md:col-span-8 lg:col-span-9">
            {title}
          </div>
        ) : null}
        {actions ? (
          <div className="col-span-full flex items-center justify-end gap-[var(--space-1)] md:col-span-4 md:justify-self-end lg:col-span-3">
            {actions}
          </div>
        ) : null}
        {children ? <div className="col-span-full">{children}</div> : null}
      </PageShell>
    </header>
  );
}
