"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import PrimitiveCard from "./primitives/Card";
import { cn } from "@/lib/utils";

export interface ToastProps extends React.ComponentProps<typeof PrimitiveCard> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duration?: number;
}

export default function Toast({
  open,
  onOpenChange,
  duration = 3000,
  className,
  children,
  ...props
}: ToastProps) {
  React.useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => onOpenChange(false), duration);
    return () => clearTimeout(timer);
  }, [open, duration, onOpenChange]);

  if (!open) return null;
  return createPortal(
    <div className="fixed bottom-4 right-4 z-50">
      <PrimitiveCard className={cn(className)} {...props}>
        {children}
      </PrimitiveCard>
    </div>,
    document.body,
  );
}
