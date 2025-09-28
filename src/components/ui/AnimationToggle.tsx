"use client";

import * as React from "react";
import { Zap, ZapOff } from "lucide-react";
import Spinner from "./feedback/Spinner";
import { usePersistentState, readLocal, writeLocal } from "@/lib/db";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

const KEY = "ui:animations";

export default function AnimationToggle({
  loading = false,
}: {
  loading?: boolean;
}) {
  const [enabled, setEnabled] = usePersistentState<boolean>(KEY, true);
  const reduceMotion = usePrefersReducedMotion();
  const appliedByToggleRef = React.useRef(false);
  const latestEnabledRef = React.useRef(enabled);
  latestEnabledRef.current = enabled;

  React.useEffect(() => {
    if (readLocal<boolean>(KEY) === null && reduceMotion) {
      setEnabled(false);
      writeLocal(KEY, false);
    }
  }, [reduceMotion, setEnabled]);

  React.useEffect(() => {
    const root = document.documentElement;

    if (!enabled) {
      if (!root.classList.contains("no-animations")) {
        root.classList.add("no-animations");
      }
      appliedByToggleRef.current = true;
    }

    return () => {
      if (appliedByToggleRef.current) {
        root.classList.remove("no-animations");
        appliedByToggleRef.current = false;
      }
    };
  }, [enabled]);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
  }

  return (
    <div className="flex items-center gap-[var(--space-2)]">
      <button
        type="button"
        aria-pressed={enabled}
        aria-label={enabled ? "Disable animations" : "Enable animations"}
        onClick={toggle}
        aria-busy={loading}
        disabled={loading}
        className={cn(
          "inline-flex h-[var(--control-h-sm)] w-[var(--control-h-sm)] shrink-0 items-center justify-center rounded-[var(--control-radius)]",
          "border border-border bg-card shadow-[var(--shadow-control)]",
          "hover:shadow-[var(--shadow-control-hover)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "active:bg-surface",
          "disabled:opacity-disabled disabled:pointer-events-none disabled:cursor-not-allowed",
        )}
      >
        {loading ? (
          <Spinner size="sm" />
        ) : enabled ? (
          <Zap className="h-[var(--space-4)] w-[var(--space-4)]" />
        ) : (
          <ZapOff className="h-[var(--space-4)] w-[var(--space-4)]" />
        )}
      </button>
    </div>
  );
}
