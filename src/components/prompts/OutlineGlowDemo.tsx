import * as React from "react";

// Demos should represent all interactive states for clarity.
export default function OutlineGlowDemo() {
  return (
    <div className="mb-[var(--space-4)] flex gap-[var(--space-2)]">
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-card r-card-md border px-[var(--space-3)] py-[var(--space-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] hover:bg-surface-2 active:bg-surface"
        style={{ "--focus": "var(--focus)" } as React.CSSProperties}
      >
        Focus me to see the glow
      </button>
      <button
        type="button"
        disabled
        className="inline-flex items-center justify-center rounded-card r-card-md border px-[var(--space-3)] py-[var(--space-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] hover:bg-surface-2 active:bg-surface disabled:cursor-not-allowed"
        style={{ "--focus": "var(--focus)" } as React.CSSProperties}
      >
        Disabled example
      </button>
    </div>
  );
}
