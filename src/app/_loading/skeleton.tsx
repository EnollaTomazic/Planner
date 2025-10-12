import type { AriaAttributes, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const radiusClasses = {
  sm: "rounded-[var(--radius-sm,var(--radius-md))]",
  md: "rounded-[var(--radius-lg)]",
  lg: "rounded-[var(--radius-xl)]",
  card: "rounded-[var(--radius-card,var(--radius-xl))]",
  full: "rounded-[var(--radius-full)]",
} as const;

export type SkeletonRadius = keyof typeof radiusClasses;

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  radius?: SkeletonRadius;
  ariaHidden?: AriaAttributes["aria-hidden"];
};

export function Skeleton({
  className,
  radius = "md",
  ariaHidden,
  ...props
}: SkeletonProps) {
  const ariaHiddenAttr = (props as AriaAttributes)["aria-hidden"];
  const resolvedAriaHidden = ariaHidden ?? ariaHiddenAttr ?? true;

  return (
    <div
      {...props}
      aria-hidden={resolvedAriaHidden}
      className={cn(
        "skeleton h-[var(--space-4)] w-full",
        radiusClasses[radius],
        className,
      )}
    />
  );
}
