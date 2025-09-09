"use client";

import * as React from "react";
import { Zap, ZapOff } from "lucide-react";
import { usePersistentState, readLocal, writeLocal } from "@/lib/db";
import { cn } from "@/lib/utils";

const KEY = "ui:animations";

export default function AnimationToggle() {
  const [enabled, setEnabled] = usePersistentState<boolean>(KEY, true);
  const [showNotice, setShowNotice] = React.useState(false);

  React.useEffect(() => {
    if (
      readLocal<boolean>(KEY) === null &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setEnabled(false);
      writeLocal(KEY, false);
      setShowNotice(true);
    }
  }, [setEnabled]);

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
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full shrink-0",
          "border border-[hsl(var(--border))] bg-[hsl(var(--card))]",
          "hover:shadow-[0_0_12px_hsl(var(--ring)/.35)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
        )}
      >
        {enabled ? (
          <Zap className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ZapOff className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
      {showNotice && (
        <span className="text-xs text-[hsl(var(--muted-foreground))]">
          Animations disabled per OS preference
        </span>
      )}
    </div>
  );
}

