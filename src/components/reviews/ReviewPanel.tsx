import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export default function ReviewPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "max-w-[880px] w-full rounded-xl p-5 bg-[hsl(var(--card)/0.6)] ring-1 ring-white/5 shadow-[0_0_40px_-12px_hsl(var(--glow-soft))]",
        className
      )}
      {...props}
    />
  );
}
