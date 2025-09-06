import * as React from "react";
import { cn } from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[16px] p-4 border border-[hsl(var(--border)/0.25)] bg-[hsl(var(--card)/0.6)] shadow-[0_0_0_1px_hsl(var(--border)/0.12)]",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export default Card;
