"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { type CardDepth, Card } from "./primitives/Card";
import { IconButton } from "./primitives/IconButton";
import { X } from "lucide-react";
import { useDialogTrap } from "./hooks/useDialogTrap";
import useMounted from "@/lib/useMounted";
import { cn } from "@/lib/utils";

export interface ModalProps
  extends Omit<React.ComponentProps<typeof Card>, "depth" | "glitch"> {
  open: boolean;
  onClose: () => void;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  depth?: CardDepth;
  glitch?: boolean;
}

export function Modal({
  open,
  onClose,
  className,
  children,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
  depth = "raised",
  glitch = false,
  ...props
}: ModalProps) {
  const mounted = useMounted();
  const dialogRef = React.useRef<HTMLDivElement>(null);

  useDialogTrap({ open: open && mounted, onClose, ref: dialogRef });

  if (!open || !mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        role="presentation"
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 bg-background/80 transition-colors duration-motion-sm ease-out motion-reduce:transition-none hover:bg-background/86 active:bg-background/92"
        onClick={onClose}
      />
      <Card
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        depth={depth}
        glitch={glitch}
        className={cn(
          "relative w-full max-w-[calc(var(--space-8)*6)]",
          className,
        )}
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
