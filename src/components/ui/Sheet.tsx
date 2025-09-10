"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import PrimitiveCard from "./primitives/Card";
import { cn } from "@/lib/utils";

export interface SheetProps extends React.ComponentProps<typeof PrimitiveCard> {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
}

export default function Sheet({
  open,
  onClose,
  side = "right",
  className,
  children,
  ...props
}: SheetProps) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-background/80" onClick={onClose} />
      <PrimitiveCard
        className={cn(
          "fixed top-0 h-full w-80 overflow-y-auto", 
          side === "right" ? "right-0" : "left-0",
          className,
        )}
        {...props}
      >
        {children}
      </PrimitiveCard>
    </div>,
    document.body,
  );
}
