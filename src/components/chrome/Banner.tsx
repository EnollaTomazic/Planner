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
        sticky ? "sticky top-0 z-30 sticky-blur border-b border-border" : "",
        className
      )}
    >
      <PageShell className="py-[var(--space-3)]">
        {title || actions ? (
          <div className="flex items-center justify-between gap-[var(--space-4)]">
            <div className="font-mono text-ui text-muted-foreground">
              {title}
            </div>
            <div className="flex items-center gap-[var(--space-3)]">{actions}</div>
          </div>
        ) : null}
        {children}
      </PageShell>
    </header>
  );
}
