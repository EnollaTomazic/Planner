import React, { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui";

export default function ReviewPanel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      aria-live="polite"
      className={cn("w-full container p-[var(--spacing-5)]", className)}
      {...props}
    />
  );
}
