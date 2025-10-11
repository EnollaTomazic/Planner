"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GalleryItemProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function GalleryItem({
  label,
  children,
  className,
}: GalleryItemProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center space-y-[var(--space-2)] px-[var(--space-2)] sm:px-[var(--space-3)] md:px-0",
        className,
      )}
    >
      <span className="text-ui font-medium">{label}</span>
      {children}
    </div>
  );
}

