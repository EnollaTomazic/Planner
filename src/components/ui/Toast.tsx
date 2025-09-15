"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Card from "./primitives/Card";
import IconButton from "./primitives/IconButton";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastProps extends React.ComponentProps<typeof Card> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duration?: number;
  closable?: boolean;
}

export default function Toast({
  open,
  onOpenChange,
  duration = 3000,
  closable = false,
  className,
  children,
  ...props
}: ToastProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => onOpenChange(false), duration);
    return () => clearTimeout(timer);
  }, [open, duration, onOpenChange]);

  if (!open || !mounted) return null;
  return createPortal(
    <div
      className="fixed bottom-[calc(theme(spacing.4)+env(safe-area-inset-bottom))] right-[calc(theme(spacing.4)+env(safe-area-inset-right))] z-50"
    >
      <Card
        role="status"
        aria-live="polite"
        className={cn(className)}
        {...props}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1">{children}</div>
          {closable && (
            <IconButton
              aria-label="Close"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X />
            </IconButton>
          )}
        </div>
      </Card>
    </div>,
    document.body,
  );
}
