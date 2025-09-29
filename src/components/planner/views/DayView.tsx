"use client";

import * as React from "react";
import PageShell, {
  layoutGridClassName,
} from "@/components/ui/layout/PageShell";
import TodayHero from "../TodayHero";
import WeekNotes from "../WeekNotes";
import DayRow from "../DayRow";
import ScrollTopFloatingButton from "../ScrollTopFloatingButton";
import { useFocusDate } from "../useFocusDate";
import type { ISODate } from "../plannerTypes";
import { usePreloadedDays } from "./usePreloadedDays";

export default function DayView() {
  const { iso, today } = useFocusDate();
  const heroRef = React.useRef<HTMLDivElement>(null);
  const dayList = React.useMemo<ISODate[]>(() => [iso], [iso]);
  usePreloadedDays(dayList);

  return (
    <>
      <PageShell
        as="section"
        grid
        className="py-[var(--space-6)]"
        contentClassName="gap-y-[var(--space-6)]"
        aria-label="Planner day view"
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

        <ul
          aria-label="Selected day"
          className="col-span-full flex flex-col gap-[var(--space-4)]"
        >
          <DayRow iso={iso} isToday={iso === today} />
        </ul>
      </PageShell>
      <ScrollTopFloatingButton watchRef={heroRef} />
    </>
  );
}

