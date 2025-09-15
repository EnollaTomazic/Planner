"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import Card from "./primitives/Card";
import { useDialogTrap } from "./hooks/useDialogTrap";
import useMounted from "@/lib/useMounted";
import { cn } from "@/lib/utils";

export interface SheetProps extends React.ComponentProps<typeof Card> {
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
  const mounted = useMounted();
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useDialogTrap({ open: open && mounted, onClose, ref: dialogRef });

  if (!open || !mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-background/80"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: side === "right" ? "100%" : "-100%" }}
        animate={{ x: 0 }}
        transition={{
          type: "tween",
          duration: reduceMotion ? 0 : 0.2,
        }}
      >
        <Card
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          className={cn(
            "fixed top-0 h-full w-80 overflow-y-auto",
            side === "right" ? "right-0" : "left-0",
            className,
          )}
          {...props}
        >
          {children}
        </Card>
      </motion.div>
    </div>,
    document.body,
  );
}
