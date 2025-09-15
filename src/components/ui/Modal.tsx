"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Card from "./primitives/Card";
import { useDialogTrap } from "./hooks/useDialogTrap";
import { cn } from "@/lib/utils";

export interface ModalProps extends React.ComponentProps<typeof Card> {
  open: boolean;
  onClose: () => void;
}

export default function Modal({
  open,
  onClose,
  className,
  children,
  ...props
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => setMounted(true), []);

  useDialogTrap({ open: open && mounted, onClose, ref: dialogRef });

  if (!open || !mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80" onClick={onClose} />
      <Card
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className={cn("relative w-full max-w-sm", className)}
        {...props}
      >
        {children}
      </Card>
    </div>,
    document.body,
  );
}
