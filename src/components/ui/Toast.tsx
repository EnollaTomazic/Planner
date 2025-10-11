"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Card } from "./primitives/Card";
import { IconButton } from "./primitives/IconButton";
import styles from "./Toast.module.css";
import { X } from "lucide-react";
import useMounted from "@/lib/useMounted";
import { cn } from "@/lib/utils";
import { useScopedCssVars } from "./hooks/useScopedCssVars";

export interface ToastProps extends React.ComponentProps<typeof Card> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duration?: number;
  closable?: boolean;
  showProgress?: boolean;
}

export function Toast({
  open,
  onOpenChange,
  duration = 3000,
  closable = false,
  className,
  children,
  showProgress = false,
  onPointerEnter: onPointerEnterProp,
  onPointerLeave: onPointerLeaveProp,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  ...cardProps
}: ToastProps) {
  const mounted = useMounted();
  const timerRef = React.useRef<number | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const startTimeRef = React.useRef<number | null>(null);
  const startRemainingRef = React.useRef(duration);
  const remainingTimeRef = React.useRef(duration);
  const interactionCountRef = React.useRef(0);
  const [timeLeft, setTimeLeft] = React.useState(duration);

  const cancelDismissal = React.useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  const tick = React.useCallback(() => {
    if (startTimeRef.current === null) return;
    const elapsed = performance.now() - startTimeRef.current;
    const next = Math.max(startRemainingRef.current - elapsed, 0);
    setTimeLeft(next);
    if (next > 0) {
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      animationFrameRef.current = null;
    }
  }, []);

  const scheduleDismissal = React.useCallback(() => {
    if (!open) return;
    if (remainingTimeRef.current <= 0) {
      onOpenChange(false);
      return;
    }
    cancelDismissal();
    startTimeRef.current = performance.now();
    startRemainingRef.current = remainingTimeRef.current;
    timerRef.current = window.setTimeout(() => {
      onOpenChange(false);
    }, remainingTimeRef.current);
    if (showProgress) {
      setTimeLeft(remainingTimeRef.current);
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  }, [cancelDismissal, onOpenChange, open, showProgress, tick]);

  const pauseDismissal = React.useCallback(() => {
    if (startTimeRef.current === null) return;
    const elapsed = performance.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(startRemainingRef.current - elapsed, 0);
    setTimeLeft(remainingTimeRef.current);
    startTimeRef.current = null;
    cancelDismissal();
  }, [cancelDismissal]);

  const handleInteractionStart = React.useCallback(() => {
    if (!open) return;
    interactionCountRef.current += 1;
    if (interactionCountRef.current === 1) {
      pauseDismissal();
    }
  }, [open, pauseDismissal]);

  const handleInteractionEnd = React.useCallback(() => {
    if (!open) return;
    interactionCountRef.current = Math.max(interactionCountRef.current - 1, 0);
    if (interactionCountRef.current === 0) {
      scheduleDismissal();
    }
  }, [open, scheduleDismissal]);

  React.useEffect(() => {
    if (!open) {
      cancelDismissal();
      remainingTimeRef.current = duration;
      startRemainingRef.current = duration;
      interactionCountRef.current = 0;
      setTimeLeft(duration);
      return;
    }

    cancelDismissal();
    remainingTimeRef.current = duration;
    startRemainingRef.current = duration;
    setTimeLeft(duration);

    if (interactionCountRef.current === 0) {
      scheduleDismissal();
    }

    return cancelDismissal;
  }, [open, duration, scheduleDismissal, cancelDismissal]);

  React.useEffect(() => {
    if (!showProgress && animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (showProgress && open && startTimeRef.current !== null && animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  }, [showProgress, open, tick]);

  const progress = duration > 0 ? Math.max(0, Math.min(1, timeLeft / duration)) : 0;
  const { scopeProps: progressScopeProps, style: progressStyle } =
    useScopedCssVars({
      attribute: "data-toast-progress-id",
      vars: {
        "--toast-progress": progress.toString(),
      },
      enabled: showProgress,
    });

  if (!open || !mounted) return null;
  return createPortal(
    <div
      className="fixed bottom-[calc(theme(spacing.4)+env(safe-area-inset-bottom))] right-[calc(theme(spacing.4)+env(safe-area-inset-right))] z-50"
    >
      <Card
        role="status"
        aria-live="polite"
        className={cn(className)}
        onPointerEnter={(event) => {
          onPointerEnterProp?.(event);
          handleInteractionStart();
        }}
        onPointerLeave={(event) => {
          onPointerLeaveProp?.(event);
          handleInteractionEnd();
        }}
        onFocus={(event) => {
          onFocusProp?.(event);
          const previousTarget = event.relatedTarget;
          if (!previousTarget || !(previousTarget instanceof Node) || !event.currentTarget.contains(previousTarget)) {
            handleInteractionStart();
          }
        }}
        onBlur={(event) => {
          onBlurProp?.(event);
          const nextTarget = event.relatedTarget;
          if (!nextTarget || !(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
            handleInteractionEnd();
          }
        }}
        {...cardProps}
      >
        <div className="flex flex-col gap-[var(--space-3)]">
          <div className="flex items-start gap-[var(--space-2)]">
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
          {showProgress && (
            <div
              aria-hidden="true"
              data-progress={progress}
              className={cn(
                "h-[var(--space-1)] overflow-hidden rounded-full bg-border/40",
                styles.progressTrack,
              )}
              {...(progressScopeProps ?? {})}
              style={progressStyle}
            >
              <div
                className={cn("h-full rounded-full bg-primary", styles.progressFill)}
              />
            </div>
          )}
        </div>
      </Card>
    </div>,
    document.body,
  );
}
