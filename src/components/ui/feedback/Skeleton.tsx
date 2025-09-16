"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const radiusClasses = {
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  card: "rounded-card",
  full: "rounded-full",
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
      className={cn("skeleton h-4 w-full", radiusClasses[radius], className)}
      {...props}
    />
  ),
);

Skeleton.displayName = "Skeleton";

export default Skeleton;
