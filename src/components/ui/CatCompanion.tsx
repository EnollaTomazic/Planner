import * as React from "react";
import CatCompanionIcon from "@/icons/CatCompanionIcon";

export default function CatCompanion() {
  return (
    <div className="fixed bottom-[var(--space-4)] left-[var(--space-4)] z-50 pointer-events-none select-none">
      <CatCompanionIcon
        className="w-[var(--space-8)] h-[var(--space-8)] text-accent motion-safe:animate-[cat-float_3s_ease-in-out_infinite]"
        aria-label="Cat companion"
        tabIndex={-1}
      />
    </div>
  );
}
