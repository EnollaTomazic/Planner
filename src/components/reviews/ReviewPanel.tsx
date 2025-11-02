import * as React from "react";

import { cn } from "@/lib/utils";

import { GlitchNeoCard } from "@/components/ui/patterns";

export function ReviewPanel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <GlitchNeoCard
      className={cn("w-full max-w-full", className)}
      {...props}
    />
  );
}
