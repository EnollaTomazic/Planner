import * as React from "react";

import { cn } from "@/lib/utils";

import { Card, cardSurfaceClassName } from "@/components/ui";

export function ReviewPanel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      glitch
      depth="raised"
      className={cn(cardSurfaceClassName, "w-full max-w-full", className)}
      {...props}
    />
  );
}
