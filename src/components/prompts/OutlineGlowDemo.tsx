import * as React from "react";

// Demos should represent all interactive states for clarity.
export default function OutlineGlowDemo() {
  return (
    <div className="mb-[var(--space-4)] space-x-[var(--space-2)]">
      <button
        type="button"
        className="p-[var(--space-2)] border rounded-[var(--control-radius)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] hover:bg-surface-2 active:bg-surface"
      >
        Focus me to see the glow
      </button>
      <button
        type="button"
        disabled
        className="p-[var(--space-2)] border rounded-[var(--control-radius)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] hover:bg-surface-2 active:bg-surface disabled:cursor-not-allowed"
      >
        Disabled example
      </button>
    </div>
  );
}
