// src/components/ui/Label.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, ...props },
  ref
) {
  return (
    <label
      ref={ref}
      className={cn(
        "text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5",
        className
      )}
      {...props}
    />
  );
});

export default Label;
