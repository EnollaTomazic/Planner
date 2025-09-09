import React, { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function ReviewPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "max-w-[880px] w-full rounded-xl p-5 bg-card/60 ring-1 ring-ring/5 shadow-[0_0_40px_-12px_hsl(var(--glow-soft))]",
        className
      )}
      {...props}
    />
  );
}
