// src/components/ui/Label.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, htmlFor, ...props },
  ref,
) {
  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={cn(
        "text-label font-medium text-muted-foreground mb-[var(--space-2)]",
        className,
      )}
      {...props}
    />
  );
});
export { Label };
