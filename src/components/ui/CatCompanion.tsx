import * as React from "react";

export default function CatCompanion() {
  return (
    <div className="fixed bottom-[var(--space-4)] left-[var(--space-4)] z-50 pointer-events-none select-none">
      <svg
        className="w-[var(--space-8)] h-[var(--space-8)] text-accent motion-safe:animate-[cat-float_3s_ease-in-out_infinite]"
        role="img"
        aria-label="Cat companion"
        tabIndex={-1}
        focusable="false"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z" />
      </svg>
    </div>
  );
}
