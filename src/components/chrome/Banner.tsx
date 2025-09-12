"use client";

import * as React from "react";
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
        sticky ? "sticky top-0 z-30 sticky-blur border-b" : "",
        className
      )}
      style={sticky ? { borderColor: "hsl(var(--border))" } : undefined}
    >
      <div className="mx-auto max-w-6xl px-2 md:px-4 py-2">
        {title || actions ? (
          <div className="flex items-center justify-between gap-4">
            <div className="font-mono text-sm text-muted-foreground">
              {title}
            </div>
            <div className="flex items-center gap-2">{actions}</div>
          </div>
        ) : null}
        {children}
      </div>
    </header>
  );
}
