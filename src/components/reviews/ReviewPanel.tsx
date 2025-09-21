import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui";

export default function ReviewPanel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      aria-live="polite"
      className={cn("w-full container", className)}
      {...props}
    />
  );
}
