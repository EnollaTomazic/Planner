import * as React from "react";
import { cn } from "@/lib/utils";

type ReviewSurfaceTone = "default" | "muted" | "translucent";
type ReviewSurfacePadding =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "inline";

type ReviewSurfaceOwnProps<T extends React.ElementType = "div"> = {
  tone?: ReviewSurfaceTone;
  padding?: ReviewSurfacePadding;
  focusWithin?: boolean;
  as?: T;
};

export type ReviewSurfaceProps<T extends React.ElementType = "div"> =
  ReviewSurfaceOwnProps<T> &
    Omit<React.ComponentPropsWithoutRef<T>, keyof ReviewSurfaceOwnProps<T>>;

const toneClassNames: Record<ReviewSurfaceTone, string> = {
  default: "border border-border bg-card",
  muted: "border border-border/80 bg-muted/40",
  translucent: "border border-border/70 bg-card/80 backdrop-blur-md",
};

const paddingClassNames: Record<ReviewSurfacePadding, string> = {
  none: "",
  xs: "px-[var(--space-2)] py-[var(--space-1)]",
  sm: "px-[var(--space-3)] py-[var(--space-2)]",
  md: "px-[var(--space-4)] py-[var(--space-3)]",
  lg: "px-[var(--space-5)] py-[var(--space-4)]",
  inline: "px-[var(--space-4)]",
};

export function ReviewSurface<
  T extends React.ElementType = "div",
>({
  tone = "default",
  padding = "md",
  focusWithin = false,
  as,
  className,
  children,
  ...rest
}: ReviewSurfaceProps<T>) {
  const Comp = (as ?? "div") as React.ElementType;

  return (
    <Comp
      className={cn(
        "rounded-card r-card-lg",
        toneClassNames[tone],
        paddingClassNames[padding],
        focusWithin && "focus-within:ring-2 focus-within:ring-ring",
        className,
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}
