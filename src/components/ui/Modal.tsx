"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Card from "./primitives/Card";
import IconButton from "./primitives/IconButton";
import { X } from "lucide-react";
import { useDialogTrap } from "./hooks/useDialogTrap";
import useMounted from "@/lib/useMounted";
import { cn } from "@/lib/utils";

export interface ModalProps extends React.ComponentProps<typeof Card> {
  open: boolean;
  onClose: () => void;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

export default function Modal({
  open,
  onClose,
  className,
  children,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
  ...props
}: ModalProps) {
  const mounted = useMounted();
  const dialogRef = React.useRef<HTMLDivElement>(null);

  useDialogTrap({ open: open && mounted, onClose, ref: dialogRef });

  if (!open || !mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-background/80 transition-colors duration-[var(--dur-quick)] ease-out motion-reduce:transition-none hover:bg-[hsl(var(--background)/0.86)] active:bg-[hsl(var(--background)/0.92)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--focus]"
        onClick={onClose}
      />
      <Card
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        className={cn("relative w-full max-w-sm", className)}
        {...props}
      >
        <IconButton
          aria-label="Close"
          size="sm"
          className="absolute right-[var(--space-3)] top-[var(--space-3)]"
          onClick={onClose}
        >
          <X />
        </IconButton>
        {children}
      </Card>
    </div>,
    document.body,
  );
}
