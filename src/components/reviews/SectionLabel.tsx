import * as React from "react";

/** Reusable section label divider for grouping review sections. */
export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <div className="text-xs tracking-wide text-foreground/20">{children}</div>
      <div className="h-px flex-1 bg-gradient-to-r from-foreground/20 via-foreground/5 to-transparent" />
    </div>
  );
}

