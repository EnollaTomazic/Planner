// src/components/planner/PlannerPage.tsx
"use client";

import "./style.css";

/**
 * PlannerPage — Week header + TodayHero + Focus/Notes + Day list.
 * - Full-width Hero bottom via WeekPicker (uses hero-bleed-row).
 * - 12-col layout: 8 main / 4 aside, aside is sticky.
 * - Day rows are focusable anchors so WeekPicker chips can smooth-scroll to them.
 */

import * as React from "react";
import TodayHero from "./TodayHero";
import WeekNotes from "./WeekNotes";
import DayRow from "./DayRow";
import ScrollTopFloatingButton from "./ScrollTopFloatingButton";
import { useFocusDate, useWeek } from "./useFocusDate";
import type { ISODate } from "./plannerTypes";
import { PlannerProvider } from "./plannerContext";
import WeekPicker from "./WeekPicker";
import { PageHeader } from "@/components/ui";
import PageShell, { layoutGridClassName } from "@/components/ui/layout/PageShell";
import Button from "@/components/ui/primitives/Button";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, formatWeekRangeLabel, toISODate } from "@/lib/date";

/* ───────── Page body under provider ───────── */

function Inner() {
  const { iso, today, setIso } = useFocusDate();
  const { start, end, days } = useWeek(iso);
  const weekAnnouncement = React.useMemo(
    () => formatWeekRangeLabel(start, end),
    [start, end],
  );

  // Derive once per week change; keeps list stable during edits elsewhere
  const dayItems = React.useMemo<Array<{ iso: ISODate; isToday: boolean }>>(
    () => days.map((d) => ({ iso: d, isToday: d === today })),
    [days, today],
  );

  const prevWeek = React.useCallback(() => {
    setIso(toISODate(addDays(start, -7)));
  }, [setIso, start]);
  const nextWeek = React.useCallback(() => {
    setIso(toISODate(addDays(start, 7)));
  }, [setIso, start]);
  const jumpToday = React.useCallback(() => {
    setIso(today);
  }, [setIso, today]);

  const heroRef = React.useRef<HTMLDivElement>(null);

  const right = (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        aria-label="Previous week"
        onClick={prevWeek}
      >
        <ChevronLeft />
        <span>Prev</span>
      </Button>
      <Button size="sm" aria-label="Jump to today" onClick={jumpToday}>
        Today
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Next week"
        onClick={nextWeek}
      >
        <span>Next</span>
        <ChevronRight />
      </Button>
    </div>
  );

  return (
    <>
      <PageShell as="header" grid className="py-6">
        {/* Week header (range, nav, totals, day chips) */}
        <PageHeader
          containerClassName="col-span-full"
          header={{
            id: "planner-header",
            tabIndex: -1,
            eyebrow: "Planner",
            heading: "Planner for Today",
            subtitle: "Plan your week",
            icon: <CalendarDays className="opacity-80" />,
            right,
            sticky: false,
          }}
          hero={{
            sticky: false,
            heading: "Week controls",
            children: (
              <>
                <WeekPicker />
                <div aria-live="polite" className="sr-only">
                  {weekAnnouncement}
                </div>
              </>
            ),
          }}
        />
      </PageShell>

      <PageShell
        as="section"
        grid
        className="py-6"
        contentClassName="gap-y-6"
        aria-labelledby="planner-header"
      >
        {/* Today + Side column */}
        <section
          aria-label="Today and weekly panels"
          className={`${layoutGridClassName} col-span-full lg:grid-cols-12`}
        >
          <div className="col-span-full lg:col-span-8" ref={heroRef}>
            <TodayHero iso={iso} />
          </div>

          {/* Sticky only on large so it doesn’t eat the viewport on mobile */}
          <aside
            aria-label="Day notes"
            className="col-span-full space-y-6 lg:col-span-4 lg:sticky lg:top-[var(--header-stack)]"
          >
            <WeekNotes iso={iso} />
          </aside>
        </section>

        {/* Week list (Mon→Sun) — anchors used by WeekPicker’s selectAndScroll */}
        <ul
          aria-label="Week days (Monday to Sunday)"
          className="col-span-full flex flex-col gap-4"
        >
          {dayItems.map((item) => (
            <DayRow key={item.iso} iso={item.iso} isToday={item.isToday} />
          ))}
        </ul>
      </PageShell>
      <ScrollTopFloatingButton watchRef={heroRef} />
    </>
  );
}

/* ───────── Provider shell ───────── */

export default function PlannerPage() {
  return (
    <PlannerProvider>
      <Inner />
    </PlannerProvider>
  );
}
