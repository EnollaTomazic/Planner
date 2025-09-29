"use client";

import * as React from "react";
import PageShell from "@/components/ui/layout/PageShell";
import { LOCALE, cn } from "@/lib/utils";
import {
  addDays,
  fromISODate,
  mondayStartOfWeek,
  toISODate,
} from "@/lib/date";
import { useFocusDate } from "../useFocusDate";
import { usePlannerStore } from "../usePlannerStore";
import { ensureDay } from "../plannerSerialization";

const weekdayFormatter = new Intl.DateTimeFormat(LOCALE, { weekday: "short" });

export default function MonthView() {
  const { iso } = useFocusDate();
  const { days: map } = usePlannerStore();

  const focusDate = React.useMemo(() => fromISODate(iso) ?? new Date(), [iso]);
  const focusMonth = focusDate.getMonth();

  const calendar = React.useMemo(() => {
    const firstOfMonth = new Date(
      focusDate.getFullYear(),
      focusDate.getMonth(),
      1,
    );
    const start = mondayStartOfWeek(firstOfMonth);
    const weeks: string[][] = [];
    let cursor = start;
    for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
      const week: string[] = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
        week.push(toISODate(cursor));
        cursor = addDays(cursor, 1);
      }
      weeks.push(week);
    }
    return weeks;
  }, [focusDate]);

  const headerId = React.useId();

  const weekdayLabels = React.useMemo(() => {
    const base = mondayStartOfWeek(new Date());
    return Array.from({ length: 7 }, (_, index) =>
      weekdayFormatter.format(addDays(base, index)),
    );
  }, []);

  return (
    <PageShell
      as="section"
      grid
      className="py-[var(--space-6)]"
      contentClassName="gap-y-[var(--space-6)]"
      aria-labelledby={headerId}
    >
      <header className="col-span-full flex flex-col gap-[var(--space-3)]">
        <h2 id={headerId} className="text-title font-semibold tracking-tight">
          Month planner
        </h2>
        <p className="text-body text-muted-foreground max-w-prose">
          Preview six weeks around the focused date. Counts pull directly from
          your planner data, so edits elsewhere remain visible when you switch
          back.
        </p>
      </header>

      <div className="col-span-full overflow-x-auto">
        <table className="w-full border-separate border-spacing-[var(--space-1)] sm:border-spacing-[var(--space-2)] text-body">
          <thead>
            <tr>
              {weekdayLabels.map((label) => (
                <th
                  key={label}
                  scope="col"
                  className="px-[var(--space-2)] py-[var(--space-2)] text-left text-label font-semibold text-muted-foreground"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendar.map((week) => (
              <tr key={week.join("-")}>
                {week.map((dayIso) => {
                  const dayDate = fromISODate(dayIso) ?? new Date(dayIso);
                  const record = ensureDay(map, dayIso);
                  const inMonth = dayDate.getMonth() === focusMonth;
                  return (
                    <td
                      key={dayIso}
                      className="align-top px-[var(--space-2)] py-[var(--space-2)]"
                    >
                      <div
                        className={cn(
                          "rounded-card border border-border/40 bg-card/70 p-[var(--space-2)] shadow-xs",
                          "flex flex-col gap-[var(--space-2)]",
                          inMonth ? "text-foreground" : "text-muted-foreground/70",
                        )}
                      >
                        <div className="flex items-baseline justify-between gap-[var(--space-2)]">
                          <span className="text-label font-semibold uppercase tracking-[0.08em]">
                            {dayDate.getDate()}
                          </span>
                          <span className="text-micro text-muted-foreground tabular-nums">
                            {record.doneCount}/{record.totalCount}
                          </span>
                        </div>
                        {record.projects.length ? (
                          <p className="text-micro text-muted-foreground/80">
                            {record.projects.length} projects · {record.tasks.length} tasks
                          </p>
                        ) : (
                          <p className="text-micro text-muted-foreground/60">
                            No plans yet
                          </p>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
