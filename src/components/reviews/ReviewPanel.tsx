import React, { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import Card from "@/components/ui/primitives/Card";

export default function ReviewPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      className={cn("w-full max-w-[880px] p-5", className)}
      {...props}
    />
  );
}
