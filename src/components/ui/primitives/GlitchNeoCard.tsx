import * as React from "react";

import { cn } from "@/lib/utils";

import { type CardProps, Card } from "./Card";

export type GlitchNeoCardProps = CardProps;

const BASE_CLASSNAME = cn(
  "relative overflow-hidden", 
  "card-neo-soft border border-card-hairline",
  "[box-shadow:var(--depth-shadow-soft)]",
  "[--neo-card-overlay-inset:0px] [--neo-card-overlay-opacity:var(--surface-overlay-strong,0.2)]",
);

const GlitchNeoCard = React.forwardRef<React.ElementRef<"div">, GlitchNeoCardProps>(
  ({ className, children, ...props }, ref) => (
    <Card
      ref={ref}
      depth="raised"
      glitch
      className={cn(BASE_CLASSNAME, className)}
      {...props}
    >
      {children}
    </Card>
  ),
);

GlitchNeoCard.displayName = "GlitchNeoCard";

export { GlitchNeoCard };
