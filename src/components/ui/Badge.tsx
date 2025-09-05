"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "neo" | "tag";
export type BadgeSize = "sm";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export default function Badge({
  variant = "neo",
  size = "sm",
  className,
  children,
  ...props
}: BadgeProps) {
  const base =
    variant === "tag"
      ? "rounded-md px-1.5 py-0.5 text-[10px] tracking-wide bg-[hsl(var(--muted))/0.25] border border-[hsl(var(--border))/0.2] text-muted-foreground"
      : "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shadow-[inset_0_0_0_1px_hsl(var(--accent)/0.35),0_0_10px_hsl(var(--accent)/0.20)] bg-[hsl(var(--accent)/0.10)] text-[hsl(var(--accent))]";

  return (
    <span className={cn(base, className)} {...props}>
      {children}
    </span>
  );
}
