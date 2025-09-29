"use client";

import * as React from "react";
import PageShell, {
  layoutGridClassName,
} from "@/components/ui/layout/PageShell";
import { addDays, fromISODate, mondayStartOfWeek, toISODate } from "@/lib/date";
import { LOCALE } from "@/lib/utils";
import TodayHero from "../TodayHero";
import WeekNotes from "../WeekNotes";
import WeekSummary from "../WeekSummary";
import ScrollTopFloatingButton from "../ScrollTopFloatingButton";
import { useFocusDate } from "../useFocusDate";
import type { ISODate } from "../plannerTypes";
import { usePreloadedDays } from "./usePreloadedDays";

const monthFormatter = new Intl.DateTimeFormat(LOCALE, {
  month: "long",
  year: "numeric",
});

export default function MonthView() {
  const { iso } = useFocusDate();
  const heroRef = React.useRef<HTMLDivElement>(null);

  const { monthLabel, monthDays, weekStarts } = React.useMemo(() => {
    const focusDate = fromISODate(iso) ?? new Date();
    const startOfMonth = new Date(
      focusDate.getFullYear(),
      focusDate.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );
    const firstWeekStart = mondayStartOfWeek(startOfMonth);
    const endOfMonth = new Date(
      focusDate.getFullYear(),
      focusDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    const weekStartsAccumulator: ISODate[] = [];
    const dayAccumulator: ISODate[] = [];

    for (
      let cursor = new Date(firstWeekStart);
      cursor <= endOfMonth;
      cursor = addDays(cursor, 7)
    ) {
      weekStartsAccumulator.push(toISODate(cursor));
    }

    const lastWeekStartIso = weekStartsAccumulator.at(-1) ?? toISODate(firstWeekStart);
    const lastWeekStart = fromISODate(lastWeekStartIso) ?? new Date(firstWeekStart);
    const lastWeekEnd = addDays(lastWeekStart, 6);

    for (
      let cursor = new Date(firstWeekStart);
      cursor <= lastWeekEnd;
      cursor = addDays(cursor, 1)
    ) {
      dayAccumulator.push(toISODate(cursor));
    }

    return {
      monthLabel: monthFormatter.format(focusDate),
      monthDays: dayAccumulator,
      weekStarts: weekStartsAccumulator,
    };
  }, [iso]);

  usePreloadedDays(monthDays);

  return (
    <>
      <PageShell
        as="section"
        grid
        className="py-[var(--space-6)]"
        contentClassName="gap-y-[var(--space-6)]"
        aria-label="Planner month view"
      >
        <section
          aria-label="Today and weekly panels"
          className={`${layoutGridClassName} col-span-full lg:grid-cols-12`}
        >
          <div className="col-span-full lg:col-span-8" ref={heroRef}>
            <TodayHero iso={iso} />
          </div>

          <aside
            aria-label="Day notes"
            className="col-span-full space-y-[var(--space-6)] lg:col-span-4 lg:sticky lg:top-[var(--header-stack)]"
          >
            <WeekNotes iso={iso} />
          </aside>
        </section>
      </PageShell>

      <PageShell
        as="section"
        grid
        className="pb-[var(--space-8)]"
        contentClassName="gap-y-[var(--space-4)]"
        aria-label="Month overview"
      >
        <header className="col-span-full flex flex-col gap-[var(--space-2)] sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title font-semibold tracking-[-0.01em]">
            {monthLabel}
          </h2>
          <p className="text-body text-muted-foreground">
            Weekly summaries keep progress visible at a glance.
          </p>
        </header>
        <div className="col-span-full grid gap-[var(--space-4)] md:grid-cols-2 xl:grid-cols-3">
          {weekStarts.map((weekIso) => (
            <WeekSummary key={weekIso} iso={weekIso} />
          ))}
        </div>
      </PageShell>
      <ScrollTopFloatingButton watchRef={heroRef} />
    </>
  );
}

