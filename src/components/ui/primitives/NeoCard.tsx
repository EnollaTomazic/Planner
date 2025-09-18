import * as React from "react";
import { cn } from "@/lib/utils";
import Card, { type CardProps } from "./Card";

export type NeoCardProps = CardProps & {
  overlay?: React.ReactNode;
};

const NeoCard = React.forwardRef<React.ElementRef<"div">, NeoCardProps>(
  ({ className, children, overlay, ...props }, ref) => (
    <Card
      ref={ref}
      className={cn("relative overflow-hidden card-neo-soft", className)}
      {...props}
    >
      {children}
      {overlay}
    </Card>
  ),
);
NeoCard.displayName = "NeoCard";

export default NeoCard;
