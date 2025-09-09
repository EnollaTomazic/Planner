"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
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
  const date = React.useMemo(() => new Date(`${iso}T00:00:00`), [iso]);
  const WD = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ] as const;
  const MM = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ] as const;
  const dd = (d: Date) => String(d.getDate()).padStart(2, "0");
  const headerText = `// ${WD[date.getDay()]}_${MM[date.getMonth()]} :: ${dd(date)}`;
  const pctNum =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return (
    <div className="col-span-1 lg:col-span-3 flex items-center gap-3 min-w-0">
      <span
        className="glitch glitch-label text-sm font-semibold tracking-wide shrink-0"
        data-text={headerText}
      >
        {headerText}
      </span>

      <div className="flex-1 min-w-0">
        <div
          className={cn("glitch-track", pctNum === 100 && "is-complete")}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pctNum}
        >
          <div
            className="glitch-fill transition-[width] duration-500 ease-out"
            style={{ width: `${pctNum}%` }}
          />
          <div className="glitch-scan" />
        </div>
      </div>

      <div className="shrink-0 flex items-baseline gap-3 text-xs text-muted-foreground">
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
