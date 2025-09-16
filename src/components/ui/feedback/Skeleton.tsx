"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const radiusClasses = {
  sm: "rounded-[var(--radius-md)]",
  md: "rounded-[var(--radius-lg)]",
  lg: "rounded-[var(--radius-xl)]",
  card: "rounded-[var(--radius-card,var(--radius-xl))]",
  full: "rounded-[var(--radius-full)]",
} as const;

export type SkeletonRadius = keyof typeof radiusClasses;

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?: SkeletonRadius;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, radius = "md", ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "skeleton h-[var(--space-4)] w-full",
        radiusClasses[radius],
        className,
      )}
      {...props}
    />
  ),
);

Skeleton.displayName = "Skeleton";

export default Skeleton;
