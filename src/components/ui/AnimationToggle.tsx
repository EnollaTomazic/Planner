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
  const [showNotice, setShowNotice] = React.useState(false);
  const reduceMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (readLocal<boolean>(KEY) === null && reduceMotion) {
      setEnabled(false);
      writeLocal(KEY, false);
      setShowNotice(true);
    }
  }, [reduceMotion, setEnabled]);

  React.useEffect(() => {
    document.documentElement.classList.toggle("no-animations", !enabled);
    return () => {
      document.documentElement.classList.remove("no-animations");
    };
  }, [enabled]);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    setShowNotice(false);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-pressed={enabled}
        aria-label={enabled ? "Disable animations" : "Enable animations"}
        onClick={toggle}
        aria-busy={loading}
        disabled={loading}
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-card r-card-lg",
          "border border-border bg-card",
          "hover:shadow-glow-md",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "active:bg-surface-1",
          "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
        )}
      >
        {loading ? (
          <Spinner size={16} />
        ) : enabled ? (
          <Zap className="h-4 w-4" />
        ) : (
          <ZapOff className="h-4 w-4" />
        )}
      </button>
      {showNotice && (
        <span className="text-label text-muted-foreground">
          Animations disabled per OS preference
        </span>
      )}
    </div>
  );
}
