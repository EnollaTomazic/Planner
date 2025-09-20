"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type BrandWordmarkProps = React.ComponentPropsWithoutRef<"span">;

const glowStyle = {
  textShadow: "0 0 var(--space-2) hsl(var(--accent) / 0.35)",
} as const;

export default function BrandWordmark({
  className,
  children = "noxi",
  style,
  ...props
}: BrandWordmarkProps) {
  return (
    <span
      {...props}
      className={cn(
        "relative inline-flex items-center font-semibold leading-none text-ui md:text-title",
        "tracking-[0.08em] text-foreground",
        "supports-[background-clip:text]:bg-[linear-gradient(120deg,hsl(var(--accent)),hsl(var(--accent-2)))] supports-[background-clip:text]:bg-clip-text supports-[background-clip:text]:text-transparent",
        "after:pointer-events-none after:absolute after:-inset-[var(--space-1)] after:-z-10 after:rounded-full after:bg-[radial-gradient(120%_120%_at_50%_50%,hsl(var(--accent)/0.22),transparent_70%)] after:opacity-75 after:content-[''] motion-reduce:after:hidden",
        className,
      )}
      style={{
        ...glowStyle,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
