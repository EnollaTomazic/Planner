import * as React from "react";
import { cn } from "@/lib/utils";
import Card, { type CardProps } from "./Card";

export type NeoCardProps = CardProps & {
  overlay?: React.ReactNode;
};

const NEO_CARD_BASE_CLASSNAME =
  "relative overflow-hidden card-neo-soft border border-card-hairline [box-shadow:var(--depth-shadow-soft)] [--neo-card-overlay-inset:0px] [--neo-card-overlay-opacity:var(--surface-overlay-strong,0.2)]";

export const neoCardOverlayClassName = "neo-card__overlay";

const NeoCard = React.forwardRef<React.ElementRef<"div">, NeoCardProps>(
  ({ className, children, overlay, ...props }, ref) => (
    <Card
      ref={ref}
      depth="raised"
      className={cn(NEO_CARD_BASE_CLASSNAME, className)}
      {...props}
    >
      {children}
      {overlay}
    </Card>
  ),
);
NeoCard.displayName = "NeoCard";

export default NeoCard;
