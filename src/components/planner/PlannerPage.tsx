// src/components/planner/PlannerPage.tsx
"use client";

import "./style.css";

/**
 * PlannerPage — Week header + TodayHero + Focus/Notes + Day list.
 * - Full-width Hero2 bottom via WeekPicker (uses hero-bleed-row).
 * - 12-col layout: 8 main / 4 aside, aside is sticky.
 * - Day rows are focusable anchors so WeekPicker chips can smooth-scroll to them.
 */

import * as React from "react";
import TodayHero from "./TodayHero";
import DayCard from "./DayCard";
import FocusPanel from "./FocusPanel";
import WeekNotes from "./WeekNotes";
import WeekPicker from "./WeekPicker";
import { PlannerProvider, useFocusDate, useWeek, type ISODate } from "./usePlanner";
import IconButton from "@/components/ui/primitives/IconButton";
import { ArrowUp } from "lucide-react";

/* ───────── Row (memo) ───────── */

type DayRowProps = { iso: ISODate; isToday: boolean };

const DayRow = React.memo(
  function DayRow({ iso, isToday }: DayRowProps) {
    return (
      <section
        id={`day-${iso}`}
        role="listitem"
        aria-label={`Day ${iso}${isToday ? " (Today)" : ""}`}
        className="w-full scroll-m-24"
        tabIndex={-1}
      >
        <DayCard iso={iso} isToday={isToday} />
      </section>
    );
  },
  (a: Readonly<DayRowProps>, b: Readonly<DayRowProps>) => a.iso === b.iso && a.isToday === b.isToday
);

/* ───────── Scroll-to-top button ───────── */
function BackToTopButton() {
  const [visible, setVisible] = React.useState(false);
  const [top, setTop] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => {
      if (typeof window === "undefined") return;
      const scrollY = window.scrollY;
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0;

      const margin = 24; // px offset from viewport edges (Tailwind's 6)
      const btnSize = 40; // approximate IconButton height (md)
      const range = window.innerHeight - margin * 2 - btnSize;
      setTop(margin + progress * range);

      setVisible(scrollY > 200);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!visible) return null;

  return (
    <IconButton
      aria-label="Back to top"
      onClick={scrollTop}
      className="fixed right-6 z-50"
      style={{ top }}
    >
      <ArrowUp />
    </IconButton>
  );
}

/* ───────── Page body under provider ───────── */

function Inner() {
  const { iso, today } = useFocusDate();
  const { days } = useWeek(iso);

  // Derive once per week change; keeps list stable during edits elsewhere
  const dayItems = React.useMemo<Array<{ iso: ISODate; isToday: boolean }>>(
    () => days.map(d => ({ iso: d, isToday: d === today })),
    [days, today]
  );

  return (
    <>
      <main className="page-shell py-6 space-y-6" aria-labelledby="planner-week-heading">
      {/* Week header (range, nav, totals, day chips) */}
      <h1 id="planner-week-heading" className="sr-only">
        Weekly planner
      </h1>
      <WeekPicker />

      {/* Today + Side column */}
      <section
        aria-label="Today and weekly panels"
        className="grid grid-cols-1 gap-6 lg:grid-cols-12"
      >
        <div className="lg:col-span-8">
          <TodayHero iso={iso} />
        </div>

        {/* Sticky only on large so it doesn’t eat the viewport on mobile */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
          <FocusPanel iso={iso} />
          <WeekNotes iso={iso} />
        </aside>
      </section>

      {/* Week list (Mon→Sun) — anchors used by WeekPicker’s selectAndScroll */}
      <section role="list" aria-label="Week days (Monday to Sunday)" className="flex flex-col gap-4">
        {dayItems.map(item => (
          <DayRow key={item.iso} iso={item.iso} isToday={item.isToday} />
        ))}
      </section>
      </main>
      <BackToTopButton />
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
