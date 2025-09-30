"use client";

import * as React from "react";
import PageShell, { layoutGridClassName } from "@/components/ui/layout/PageShell";
import TodayHero from "../TodayHero";
import WeekNotes from "../WeekNotes";
import DayRow from "../DayRow";
import PlannerFab from "../PlannerFab";
import { useFocusDate, useWeek } from "../useFocusDate";
import type { ISODate } from "../plannerTypes";

const PLANNER_SCROLL_STORAGE_KEY = "planner:scroll-position";

export default function DayView() {
  const { iso, today } = useFocusDate();
  const { days } = useWeek(iso);

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

  const dayItems = React.useMemo<Array<{ iso: ISODate; isToday: boolean }>>(
    () => days.map((d) => ({ iso: d, isToday: d === today })),
    [days, today],
  );

  const heroRef = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <PageShell
        as="div"
        grid
        className="py-[var(--space-6)]"
        contentClassName="gap-y-[var(--space-6)]"
      >
        <div
          role="group"
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
        </div>

        <ul
          aria-label="Week days (Monday to Sunday)"
          className="col-span-full flex flex-col gap-[var(--space-4)]"
        >
          {dayItems.map((item) => (
            <DayRow key={item.iso} iso={item.iso} isToday={item.isToday} />
          ))}
        </ul>
      </PageShell>
      <PlannerFab />
    </>
  );
}
