"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GalleryItemProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export default function GalleryItem({
  label,
  children,
  className,
}: GalleryItemProps) {
  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}

