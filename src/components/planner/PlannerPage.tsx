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
import { useFocusDate, useWeek } from "./useFocusDate";
import { PlannerProvider, type PlannerViewMode, isPlannerViewMode } from "./plannerContext";
import WeekPicker from "./WeekPicker";
import { PageHeader, GlitchSegmentedGroup, GlitchSegmentedButton } from "@/components/ui";
import PageShell from "@/components/ui/layout/PageShell";
import { CalendarDays } from "lucide-react";
import { formatWeekRangeLabel } from "@/lib/date";
import DayView from "./views/DayView";
import WeekView from "./views/WeekView";
import MonthView from "./views/MonthView";
import AgendaView from "./views/AgendaView";
import { usePlanner } from "./plannerContext";

const PLANNER_SCROLL_STORAGE_KEY = "planner:scroll-position";

const VIEW_MODE_LABELS: Record<PlannerViewMode, string> = {
  day: "Day",
  week: "Week",
  month: "Month",
  agenda: "Agenda",
};

/* ───────── Page body under provider ───────── */

function Inner() {
  const { iso } = useFocusDate();
  const { start, end } = useWeek(iso);
  const { viewMode, setViewMode } = usePlanner();
  const weekAnnouncement = React.useMemo(
    () => formatWeekRangeLabel(start, end),
    [start, end],
  );

  const handleViewModeChange = React.useCallback(
    (next: string) => {
      if (!isPlannerViewMode(next)) return;
      setViewMode(next);
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(PLANNER_SCROLL_STORAGE_KEY, "0");
        } catch {
          // Ignore storage write errors (private mode, quota, etc.).
        }
        window.scrollTo({ top: 0 });
      }
    },
    [setViewMode],
  );

  const viewPanel = React.useMemo(() => {
    switch (viewMode) {
      case "day":
        return (
          <div id="day-panel" role="tabpanel" aria-labelledby="day-tab">
            <DayView />
          </div>
        );
      case "week":
        return (
          <div id="week-panel" role="tabpanel" aria-labelledby="week-tab">
            <WeekView />
          </div>
        );
      case "month":
        return (
          <div id="month-panel" role="tabpanel" aria-labelledby="month-tab">
            <MonthView />
          </div>
        );
      case "agenda":
        return (
          <div id="agenda-panel" role="tabpanel" aria-labelledby="agenda-tab">
            <AgendaView />
          </div>
        );
      default:
        return null;
    }
  }, [viewMode]);

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
                <div className="flex flex-col gap-[var(--space-3)] lg:flex-row lg:items-center lg:justify-between">
                  <WeekPicker />
                  <div className="flex justify-start lg:justify-end">
                    <GlitchSegmentedGroup
                      value={viewMode}
                      onChange={handleViewModeChange}
                      ariaLabel="Select planner view"
                    >
                      {Object.entries(VIEW_MODE_LABELS).map(([value, label]) => (
                        <GlitchSegmentedButton
                          key={value}
                          value={value}
                          aria-controls={`${value}-panel`}
                        >
                          {label}
                        </GlitchSegmentedButton>
                      ))}
                    </GlitchSegmentedGroup>
                  </div>
                </div>
                <div aria-live="polite" className="sr-only">
                  {weekAnnouncement}
                </div>
              </>
            ),
          }}
        />
      </PageShell>
      {viewPanel}
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
