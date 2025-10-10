"use client";

import * as React from "react";
import PageShell from "@/components/ui/layout/PageShell";
import WeekSummary from "../WeekSummary";
import WeekNotes from "../WeekNotes";
import DayCard from "../DayCard";
import { useWeek, useFocusDate } from "../useFocusDate";
import PlannerIslandBoundary from "../PlannerIslandBoundary";

export default function WeekView() {
  const { iso } = useFocusDate();
  const { days, isToday } = useWeek(iso);

  const heroId = React.useId();

  return (
    <PageShell
      as="div"
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
          <PlannerIslandBoundary
            name="planner:week-view:summary"
            title="Week summary unavailable"
            description="We hit an error loading the weekly summary. Retry to bring it back."
            retryLabel="Retry summary"
          >
            <WeekSummary iso={iso} />
          </PlannerIslandBoundary>
        </div>
        <aside
          aria-label="Week notes"
          className="lg:col-span-4 space-y-[var(--space-4)]"
        >
          <PlannerIslandBoundary
            name="planner:week-view:notes"
            title="Notes unavailable"
            description="We couldn't load your notes for the selected week. Retry to open them again."
            retryLabel="Retry notes"
          >
            <WeekNotes iso={iso} />
          </PlannerIslandBoundary>
        </aside>
      </div>

      <PlannerIslandBoundary
        name="planner:week-view:cards"
        title="Week schedule unavailable"
        description="We weren't able to render the day cards. Retry to reload the schedule."
        retryLabel="Retry day cards"
        variant="plain"
        fallbackClassName="col-span-full grid gap-[var(--space-4)] md:grid-cols-2"
      >
        <div className="col-span-full grid gap-[var(--space-4)] md:grid-cols-2">
          {days.map((dayIso) => (
            <DayCard key={dayIso} iso={dayIso} isToday={isToday(dayIso)} />
          ))}
        </div>
      </PlannerIslandBoundary>
    </PageShell>
  );
}
