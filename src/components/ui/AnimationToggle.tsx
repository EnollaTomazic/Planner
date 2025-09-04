"use client";

import * as React from "react";
import { Zap, ZapOff } from "lucide-react";

const KEY = "animations-enabled";

export default function AnimationToggle() {
  const [enabled, setEnabled] = React.useState(true);

  React.useEffect(() => {
    let isEnabled = true;
    try {
      const stored = localStorage.getItem(KEY);
      if (stored !== null) {
        isEnabled = stored === "true";
      }
    } catch {}
    setEnabled(isEnabled);
    document.documentElement.classList.toggle("no-animations", !isEnabled);
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    try {
      localStorage.setItem(KEY, String(next));
    } catch {}
    document.documentElement.classList.toggle("no-animations", !next);
  }

  return (
    <button
      type="button"
      aria-pressed={enabled}
      aria-label={enabled ? "Disable animations" : "Enable animations"}
      onClick={toggle}
      className={[
        "inline-flex h-9 w-9 items-center justify-center rounded-full shrink-0",
        "border border-[hsl(var(--border))] bg-[hsl(var(--card))]",
        "hover:shadow-[0_0_12px_hsl(var(--ring)/.35)] focus:outline-none",
        "focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
      ].join(" ")}
    >
      {enabled ? <Zap className="h-4 w-4" /> : <ZapOff className="h-4 w-4" />}
    </button>
  );
}

