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
      "rounded-md px-2 py-1 bg-[hsl(var(--muted)/0.25)] border-[hsl(var(--border)/0.2)] text-[hsl(var(--muted-foreground))]",
    accent:
      "rounded-md px-2 py-1 bg-[hsl(var(--accent)/0.15)] border-[hsl(var(--accent)/0.35)] text-[hsl(var(--accent))] shadow-[0_0_8px_hsl(var(--accent)/0.3)]",
    pill: "pill",
  };

  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
