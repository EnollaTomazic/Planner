import * as React from "react";
import type { Pillar } from "@/lib/types";
import { SectionLabel } from "@/components/reviews/SectionLabel";
import { PillarBadge } from "@/components/ui/league/pillars/PillarBadge";

function StaticNeonWrap({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-flex">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-card r-card-lg bg-gradient-to-r from-accent to-primary opacity-40 blur"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-card r-card-lg ring-1 ring-ring/35"
      />
      <span className="relative z-10">{children}</span>
    </span>
  );
}

export type ReviewSummaryPillarsProps = {
  pillars?: Pillar[];
};

export function ReviewSummaryPillars({
  pillars,
}: ReviewSummaryPillarsProps) {
  return (
    <div>
      <SectionLabel>Pillars</SectionLabel>
      {Array.isArray(pillars) && pillars.length > 0 ? (
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {pillars.map((p) => (
            <StaticNeonWrap key={p}>
              <PillarBadge pillar={p} size="md" active />
            </StaticNeonWrap>
          ))}
        </div>
      ) : (
        <div className="text-ui text-muted-foreground">
          No pillars selected.
        </div>
      )}
    </div>
  );
}
