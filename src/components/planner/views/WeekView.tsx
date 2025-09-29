"use client";

import * as React from "react";
import PageShell from "@/components/ui/layout/PageShell";
import WeekSummary from "../WeekSummary";
import WeekNotes from "../WeekNotes";
import DayCard from "../DayCard";
import { useWeek, useFocusDate } from "../useFocusDate";

export default function WeekView() {
  const { iso } = useFocusDate();
  const { days, isToday } = useWeek(iso);

  const heroId = React.useId();

  return (
    <PageShell
      as="section"
      grid
      className="py-[var(--space-6)]"
      contentClassName="gap-y-[var(--space-6)]"
      aria-labelledby={heroId}
    >
      <header className="col-span-full flex flex-col gap-[var(--space-3)]">
        <h2 id={heroId} className="text-title font-semibold tracking-tight">
          Week overview
        </h2>
        <p className="text-body text-muted-foreground max-w-prose">
          Review the current week at a glance. Progress cards stay interactive so
          updates here reflect instantly across other views.
        </p>
      </header>

      <div className="col-span-full grid gap-[var(--space-4)] lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-[var(--space-4)]">
          <WeekSummary iso={iso} />
        </div>
        <aside
          aria-label="Week notes"
          className="lg:col-span-4 space-y-[var(--space-4)]"
        >
          <WeekNotes iso={iso} />
        </aside>
      </div>

      <div className="col-span-full grid gap-[var(--space-4)] md:grid-cols-2">
        {days.map((dayIso) => (
          <DayCard key={dayIso} iso={dayIso} isToday={isToday(dayIso)} />
        ))}
      </div>
    </PageShell>
  );
}
