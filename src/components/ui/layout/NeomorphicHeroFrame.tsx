// src/components/ui/layout/NeomorphicHeroFrame.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type NeomorphicHeroFrameProps = React.HTMLAttributes<HTMLDivElement>;

export default function NeomorphicHeroFrame({
  className,
  children,
  ...rest
}: NeomorphicHeroFrameProps) {
  return (
    <div
      className={cn("relative overflow-hidden hero2-neomorph", className)}
      {...rest}
    >
      <span aria-hidden className="hero2-beams" />
      <span aria-hidden className="hero2-scanlines" />
      <span aria-hidden className="hero2-noise opacity-[0.03]" />
      {children}
      <div
        aria-hidden
        className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-border/55"
      />
    </div>
  );
}
