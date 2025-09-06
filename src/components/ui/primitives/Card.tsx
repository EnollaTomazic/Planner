import * as React from "react";
import { cn } from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "flat" | "neo" | "glow";
};

const variantStyles: Record<NonNullable<CardProps["variant"]>, string> = {
  flat: "bg-background",
  neo: "card-neo",
  glow: "card-neo shadow-[var(--glow-strong)]",
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "flat", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("rounded-2xl p-4", variantStyles[variant], className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export default Card;
