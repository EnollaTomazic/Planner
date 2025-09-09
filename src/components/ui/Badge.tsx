"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "neutral" | "accent" | "pill";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export default function Badge({ variant = "neutral", className, children, ...props }: BadgeProps) {
  const base = "inline-flex items-center text-xs font-medium border";
  const variants: Record<BadgeVariant, string> = {
    neutral:
      "rounded-md px-2 py-1 bg-muted/25 border-border/20 text-muted-foreground",
    accent:
      "rounded-md px-2 py-1 bg-accent/15 border-accent/35 text-accent shadow-[0_0_8px_hsl(var(--accent)/0.3)]",
    pill:
      "rounded-full px-2 py-1 bg-accent/15 border-accent/35 text-accent",
  };

  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
