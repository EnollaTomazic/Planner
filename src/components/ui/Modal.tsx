"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Card from "./primitives/Card";
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

  React.useEffect(() => {
    if (!open || !mounted) return;
    const prevActive = document.activeElement as HTMLElement | null;
    const el = dialogRef.current;
    const selectors =
      "a[href], button, textarea, input, select, [tabindex]:not([tabindex='-1'])";
    const nodes = el?.querySelectorAll<HTMLElement>(selectors) ?? [];
    const first = nodes[0] ?? el;
    const last = nodes[nodes.length - 1] ?? el;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
        if (nodes.length === 0) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    first?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      prevActive?.focus?.();
    };
  }, [open, mounted, onClose]);

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
