import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui";

export function ReviewPanel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      className={cn("w-full max-w-full", className)}
      {...props}
    />
  );
}
