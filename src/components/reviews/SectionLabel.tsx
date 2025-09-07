import * as React from "react";

/** Reusable section label divider for grouping review sections. */
export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <div className="text-xs tracking-wide text-white/20">{children}</div>
      <div className="h-px flex-1 bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
    </div>
  );
}

