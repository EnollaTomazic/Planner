import * as React from "react";

export default function OutlineGlowDemo() {
  return (
    <div className="mb-4">
      <button
        type="button"
        className="p-2 border rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--focus]"
        style={{ "--focus": "var(--theme-ring)" } as React.CSSProperties}
      >
        Focus me to see the glow
      </button>
    </div>
  );
}
