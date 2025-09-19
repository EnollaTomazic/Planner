import * as React from "react";

// Demos should represent all interactive states for clarity.
export default function OutlineGlowDemo() {
  return (
    <div className="mb-4 space-x-2">
      <button
        type="button"
        className="p-2 border rounded-[var(--control-radius)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] hover:bg-surface-2 active:bg-surface"
        style={{ "--focus": "var(--theme-ring)" } as React.CSSProperties}
      >
        Focus me to see the glow
      </button>
      <button
        type="button"
        aria-disabled="true"
        className="p-2 border rounded-[var(--control-radius)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] hover:bg-surface-2 active:bg-surface disabled:cursor-not-allowed"
        style={{ "--focus": "var(--theme-ring)" } as React.CSSProperties}
      >
        Disabled example
      </button>
    </div>
  );
}
