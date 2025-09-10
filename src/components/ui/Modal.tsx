"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import PrimitiveCard from "./primitives/Card";
import { cn } from "@/lib/utils";

export interface ModalProps extends React.ComponentProps<typeof PrimitiveCard> {
  open: boolean;
  onClose: () => void;
}

export default function Modal({ open, onClose, className, children, ...props }: ModalProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80" onClick={onClose} />
      <PrimitiveCard className={cn("relative w-full max-w-sm", className)} {...props}>
        {children}
      </PrimitiveCard>
    </div>,
    document.body,
  );
}
