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
import PlannerCreateFab from "./PlannerCreateFab";
import { useFocusDate, useWeek } from "./useFocusDate";
import type { ISODate } from "./plannerTypes";
import { PlannerProvider } from "./plannerContext";
import WeekPicker from "./WeekPicker";
import { PageHeader } from "@/components/ui";
import PageShell, { layoutGridClassName } from "@/components/ui/layout/PageShell";
import { CalendarDays } from "lucide-react";
import { formatWeekRangeLabel } from "@/lib/date";
import { RemindersProvider } from "@/components/goals/reminders/useReminders";

const PLANNER_SCROLL_STORAGE_KEY = "planner:scroll-position";

/* ───────── Page body under provider ───────── */

function Inner() {
  const { iso, today } = useFocusDate();
  const { start, end, days } = useWeek(iso);
  const weekAnnouncement = React.useMemo(
    () => formatWeekRangeLabel(start, end),
    [start, end],
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const stored = sessionStorage.getItem(PLANNER_SCROLL_STORAGE_KEY);
    if (stored) {
      const parsed = Number.parseInt(stored, 10);
      if (!Number.isNaN(parsed)) {
        window.scrollTo({ top: parsed });
      }
    }

    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        sessionStorage.setItem(
          PLANNER_SCROLL_STORAGE_KEY,
          Math.round(window.scrollY).toString(),
        );
      });
    };

    const handlePageHide = () => {
      sessionStorage.setItem(
        PLANNER_SCROLL_STORAGE_KEY,
        Math.round(window.scrollY).toString(),
      );
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pagehide", handlePageHide);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      sessionStorage.setItem(
        PLANNER_SCROLL_STORAGE_KEY,
        Math.round(window.scrollY).toString(),
      );
    };
  }, []);

  // Derive once per week change; keeps list stable during edits elsewhere
  const dayItems = React.useMemo<Array<{ iso: ISODate; isToday: boolean }>>(
    () => days.map((d) => ({ iso: d, isToday: d === today })),
    [days, today],
  );

  const heroRef = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <PageShell as="header" grid className="py-[var(--space-6)]">
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
        className="py-[var(--space-6)]"
        contentClassName="gap-y-[var(--space-6)]"
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
            className="col-span-full space-y-[var(--space-6)] lg:col-span-4 lg:sticky lg:top-[var(--header-stack)]"
          >
            <WeekNotes iso={iso} />
          </aside>
        </section>

        {/* Week list (Mon→Sun) — anchors used by WeekPicker’s selectAndScroll */}
        <ul
          aria-label="Week days (Monday to Sunday)"
          className="col-span-full flex flex-col gap-[var(--space-4)]"
        >
          {dayItems.map((item) => (
            <DayRow key={item.iso} iso={item.iso} isToday={item.isToday} />
          ))}
        </ul>
      </PageShell>
      <PlannerCreateFab watchRef={heroRef} />
    </>
  );
}

/* ───────── Provider shell ───────── */

export default function PlannerPage() {
  return (
    <RemindersProvider>
      <PlannerProvider>
        <Inner />
      </PlannerProvider>
    </RemindersProvider>
  );
}
