import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Card, type CardProps } from "@/components/ui";
import { cn } from "@/lib/utils";

export type ReviewSurfaceTone = "default" | "muted" | "translucent";

const toneVariants: Record<ReviewSurfaceTone, string> = {
  default: "border-border bg-card",
  muted: "border-border/70 bg-muted/70",
  translucent: "border-border/60 bg-card/70",
};

export type ReviewSurfacePadding = "none" | "xs" | "sm" | "md" | "lg";

const paddingMap: Record<ReviewSurfacePadding, string | undefined> = {
  none: undefined,
  xs: "p-[var(--space-2)]",
  sm: "p-[var(--space-3)]",
  md: "p-[var(--space-4)]",
  lg: "p-[var(--space-5)]",
};

const paddingXMap: Record<ReviewSurfacePadding, string | undefined> = {
  none: "px-0",
  xs: "px-[var(--space-2)]",
  sm: "px-[var(--space-3)]",
  md: "px-[var(--space-4)]",
  lg: "px-[var(--space-5)]",
};

const paddingYMap: Record<ReviewSurfacePadding, string | undefined> = {
  none: "py-0",
  xs: "py-[var(--space-2)]",
  sm: "py-[var(--space-3)]",
  md: "py-[var(--space-4)]",
  lg: "py-[var(--space-5)]",
};

export type ReviewSurfaceProps = CardProps & {
  asChild?: boolean;
  tone?: ReviewSurfaceTone;
  padding?: ReviewSurfacePadding;
  paddingX?: ReviewSurfacePadding;
  paddingY?: ReviewSurfacePadding;
};

const ReviewSurface = React.forwardRef<HTMLDivElement, ReviewSurfaceProps>(
  (
    {
      asChild = false,
      tone = "default",
      padding = "none",
      paddingX,
      paddingY,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const toneClass = toneVariants[tone] ?? toneVariants.default;
    const spacingClasses = [
      "p-0",
      paddingMap[padding],
      paddingX !== undefined ? paddingXMap[paddingX] : undefined,
      paddingY !== undefined ? paddingYMap[paddingY] : undefined,
    ];

    if (asChild) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          className={cn(
            "rounded-card r-card-lg border shadow-none",
            toneClass,
            spacingClasses,
            className,
          )}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <Card
        ref={ref}
        className={cn(
          "rounded-card r-card-lg border shadow-none",
          toneClass,
          spacingClasses,
          className,
        )}
        {...props}
      >
        {children}
      </Card>
    );
  },
);

ReviewSurface.displayName = "ReviewSurface";

export default ReviewSurface;
