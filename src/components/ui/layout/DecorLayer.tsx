// src/components/ui/layout/DecorLayer.tsx
import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type DecorLayerVariant = "grid" | "drip";

export interface DecorLayerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "aria-hidden"> {
  variant: DecorLayerVariant;
}

const DecorLayer = forwardRef<HTMLDivElement, DecorLayerProps>(
  ({ className, variant, ...rest }, ref) => {
    return (
      <div
        {...rest}
        ref={ref}
        aria-hidden
        data-variant={variant}
        className={cn(
          "pointer-events-none isolation-isolate z-[var(--z-decor)]",
          className
        )}
      />
    );
  }
);

DecorLayer.displayName = "DecorLayer";

export default DecorLayer;
