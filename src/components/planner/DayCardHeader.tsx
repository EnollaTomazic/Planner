"use client";

import * as React from "react";
import { formatIsoLabel } from "@/lib/date";
import GlitchProgress from "@/components/ui/primitives/GlitchProgress";
import type { ISODate } from "./plannerStore";

type Props = {
  iso: ISODate;
  projectCount: number;
  doneTasks: number;
  totalTasks: number;
};

export default function DayCardHeader({
  iso,
  projectCount,
  doneTasks,
  totalTasks,
}: Props) {
  const headerText = React.useMemo(() => `// ${formatIsoLabel(iso)}`, [iso]);
  const pctNum =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return (
    <div className="col-span-1 lg:col-span-3 flex items-center gap-3 min-w-0">
      <span
        className="glitch glitch-label text-ui font-semibold tracking-wide shrink-0"
        data-text={headerText}
      >
        {headerText}
      </span>

      <div className="flex-1 min-w-0">
        <GlitchProgress current={doneTasks} total={totalTasks} />
      </div>

      <div className="shrink-0 flex items-baseline gap-3 text-label text-muted-foreground">
        <span className="tabular-nums font-medium text-foreground">
          {pctNum}%
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="whitespace-nowrap">
          <span className="tabular-nums">{projectCount}</span> projects
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="whitespace-nowrap">
          <span className="tabular-nums">{doneTasks}</span> /{" "}
          <span className="tabular-nums">{totalTasks}</span> tasks
        </span>
      </div>
    </div>
  );
}
