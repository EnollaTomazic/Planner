import * as React from "react";
import { cn } from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-card r-card-lg p-4 border border-border/25 bg-card/60 shadow-[0_0_0_1px_hsl(var(--border)/0.12)]",
          className,
        )}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";

export default Card;
