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
import WeekPicker from "./WeekPicker";
import DayRow from "./DayRow";
import ScrollTopFloatingButton from "./ScrollTopFloatingButton";
import { useFocusDate, useWeek } from "./useFocusDate";
import type { ISODate } from "./plannerStore";
import { PlannerProvider } from "./plannerStore";
import Header from "@/components/ui/layout/Header";
import Button from "@/components/ui/primitives/Button";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, toISODate } from "@/lib/date";

/* ───────── Page body under provider ───────── */

function Inner() {
  const { iso, today, setIso } = useFocusDate();
  const { start, days } = useWeek(iso);

  // Derive once per week change; keeps list stable during edits elsewhere
  const dayItems = React.useMemo<Array<{ iso: ISODate; isToday: boolean }>>(
    () => days.map(d => ({ iso: d, isToday: d === today })),
    [days, today]
  );

  const prevWeek = () => setIso(toISODate(addDays(start, -7)));
  const nextWeek = () => setIso(toISODate(addDays(start, 7)));
  const jumpToday = () => setIso(today);

  const heroRef = React.useRef<HTMLDivElement>(null);

  const right = (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        aria-label="Previous week"
        onClick={prevWeek}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
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
        <ChevronRight className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );

  return (
    <>
      <main
        className="page-shell py-6 space-y-6"
        aria-labelledby="planner-header"
      >
        {/* Week header (range, nav, totals, day chips) */}
        <div className="space-y-2">
          <Header
            id="planner-header"
            eyebrow="Planner"
            heading="Today"
            subtitle="Plan your week"
            icon={<CalendarDays className="opacity-80" aria-hidden="true" />}
            right={right}
          />
          <WeekPicker />
        </div>

        {/* Today + Side column */}
        <section
          aria-label="Today and weekly panels"
          className="grid grid-cols-1 gap-6 lg:grid-cols-12"
        >
          <div className="lg:col-span-8" ref={heroRef}>
            <TodayHero iso={iso} />
          </div>

          {/* Sticky only on large so it doesn’t eat the viewport on mobile */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            <WeekNotes iso={iso} />
          </aside>
        </section>

        {/* Week list (Mon→Sun) — anchors used by WeekPicker’s selectAndScroll */}
        <section
          role="list"
          aria-label="Week days (Monday to Sunday)"
          className="flex flex-col gap-4"
        >
          {dayItems.map(item => (
            <DayRow key={item.iso} iso={item.iso} isToday={item.isToday} />
          ))}
        </section>
      </main>
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
