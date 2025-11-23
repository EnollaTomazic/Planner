import * as React from "react";
import type { Pillar } from "@/lib/types";
import { SectionLabel } from "@/components/reviews/SectionLabel";
import { Badge } from "@/components/ui";
import { PILLAR_ICONS, pillarToLabel } from "@/lib/pillarDetails";

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
          {pillars.map((pillar) => {
            const Icon = PILLAR_ICONS[pillar];
            return (
              <StaticNeonWrap key={pillar}>
                <Badge className="gap-[var(--space-1)] bg-card/70">
                  <Icon
                    aria-hidden
                    className="h-[var(--space-4)] w-[var(--space-4)] text-muted-foreground"
                  />
                  <span>{pillarToLabel(pillar)}</span>
                </Badge>
              </StaticNeonWrap>
            );
          })}
        </div>
      ) : (
        <div className="text-ui text-muted-foreground">
          No pillars selected.
        </div>
      )}
    </div>
  );
}
