"use client";

import * as React from "react";
import { formatIsoLabel } from "@/lib/date";
import GlitchProgress from "@/components/ui/primitives/GlitchProgress";
import type { ISODate } from "./plannerTypes";

type Props = {
  iso: ISODate;
  projectCount: number;
  doneCount: number;
  totalCount: number;
};

export default function DayCardHeader({
  iso,
  projectCount,
  doneCount,
  totalCount,
}: Props) {
  const formattedIsoLabel = React.useMemo(() => formatIsoLabel(iso), [iso]);
  const headerText = React.useMemo(
    () => `// ${formattedIsoLabel}`,
    [formattedIsoLabel],
  );
  const pctNum =
    totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  return (
    <div className="col-span-1 lg:col-span-3 flex items-center gap-[var(--space-3)] min-w-0">
      <span
        className="glitch glitch-label text-ui font-semibold tracking-wide shrink-0"
        data-text={headerText}
      >
        {headerText}
      </span>

      <div className="flex-1 min-w-0">
        <GlitchProgress
          current={doneCount}
          total={totalCount}
          aria-label={`Completed items for ${formattedIsoLabel}`}
        />
      </div>

      <div className="shrink-0 flex items-baseline gap-[var(--space-3)] text-label text-muted-foreground">
        <span className="tabular-nums font-medium text-foreground">
          {pctNum}%
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="whitespace-nowrap">
          <span className="tabular-nums">{projectCount}</span> projects
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="whitespace-nowrap">
          <span className="tabular-nums">{doneCount}</span> /{" "}
          <span className="tabular-nums">{totalCount}</span> items
        </span>
      </div>
    </div>
  );
}
