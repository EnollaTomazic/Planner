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
import { Header, PRIMARY_PAGE_NAV, type HeaderNavItem } from "@/components/ui/layout/Header";
import { PageShell } from "@/components/ui";
import { useFocusDate, useWeek } from "./useFocusDate";
import { PlannerProvider, usePlanner, type PlannerViewMode } from "./plannerContext";
import { FOCUS_PLACEHOLDER } from "./plannerSerialization";
import { WeekPicker } from "./WeekPicker";
import { CalendarDays } from "lucide-react";
import { formatWeekRangeLabel } from "@/lib/date";
import { RemindersProvider } from "@/components/goals/reminders/useReminders";
import { PlannerIslandBoundary } from "./PlannerIslandBoundary";
import { useWeekData } from "./useWeekData";
import { useDay } from "./useDay";
import { PlannerHero } from "./PlannerHero";

const LazyDayView = React.lazy(async () => ({
  default: (await import("./views/DayView")).DayView,
}));
const LazyWeekView = React.lazy(async () => ({
  default: (await import("./views/WeekView")).WeekView,
}));
const LazyMonthView = React.lazy(async () => ({
  default: (await import("./views/MonthView")).MonthView,
}));
const LazyAgendaView = React.lazy(async () => ({
  default: (await import("./views/AgendaView")).AgendaView,
}));

const VIEW_MODE_TABS: Array<{ key: PlannerViewMode; label: string }> = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "agenda", label: "Agenda" },
];

const VIEW_TAB_ID_BASE = "planner-view";
const VIEW_COMPONENTS: Record<
  PlannerViewMode,
  React.LazyExoticComponent<React.ComponentType>
> = {
  day: LazyDayView,
  week: LazyWeekView,
  month: LazyMonthView,
  agenda: LazyAgendaView,
};

type PlannerViewFallbackProps = {
  mode: PlannerViewMode;
};

const VIEW_FALLBACK_CONTENT: Record<
  PlannerViewMode,
  { title: string; description: string }
> = {
  day: {
    title: "Loading day planner",
    description: "Syncing today's focus and notes…",
  },
  week: {
    title: "Loading week overview",
    description: "Pulling the sprint schedule and totals…",
  },
  month: {
    title: "Loading month planner",
    description: "Rendering the expanded calendar grid…",
  },
  agenda: {
    title: "Loading agenda",
    description: "Collecting tasks and reminders for the list…",
  },
};

const primaryNav = Array.isArray(PRIMARY_PAGE_NAV) ? PRIMARY_PAGE_NAV : [];

const navItems: HeaderNavItem[] = primaryNav.map((item) => ({
  ...item,
  active: item.key === "planner",
}));

function PlannerViewFallback({ mode }: PlannerViewFallbackProps) {
  const copy = VIEW_FALLBACK_CONTENT[mode];

  return (
    <PageShell grid className="py-[var(--space-6)]">
      <div className="col-span-full">
        <div
          role="status"
          aria-live="polite"
          className="flex min-h-[12rem] flex-col items-center justify-center gap-[var(--space-2)] rounded-card border border-dashed border-border/60 bg-muted/20 p-[var(--space-6)] text-center text-muted-foreground shadow-neo shadow-neo-soft"
        >
          <span className="text-label font-medium tracking-[0.08em] uppercase">
            {copy.title}
          </span>
          <p className="max-w-prose text-subtle">{copy.description}</p>
        </div>
      </div>
    </PageShell>
  );
}

/* ───────── Page body under provider ───────── */

function Inner() {
  const { iso, today } = useFocusDate();
  const { viewMode, setViewMode } = usePlanner();
  const { start, end, days } = useWeek(iso);
  const { tasks } = useDay(iso);
  const hydrating = today === FOCUS_PLACEHOLDER;
  const [planningEnergy, setPlanningEnergy] = React.useState(72);
  const { per, weekDone, weekTotal } = useWeekData(days ?? []);
  const sliderFeedback = React.useMemo(() => {
    if (planningEnergy >= 75) return "High-intensity push queued.";
    if (planningEnergy <= 40) return "Keeping a low-impact tempo.";
    return "Balanced cadence engaged.";
  }, [planningEnergy]);
  const autopilotSummary = React.useMemo(() => {
    if (hydrating) {
      return "Syncing planner telemetry for this sprint…";
    }
    if (weekTotal > 0) {
      return `Autopilot locked ${weekDone.toLocaleString()} of ${weekTotal.toLocaleString()} tasks so far. Adjust the focus dial before we finalize the sprint.`;
    }
    return "Draft your first tasks to let Agnes and Noxi assemble the sprint outline.";
  }, [hydrating, weekDone, weekTotal]);
  const weekAnnouncement = React.useMemo(
    () => (hydrating ? "Week preview loading…" : formatWeekRangeLabel(start, end)),
    [end, hydrating, start],
  );
  const reminderStat = React.useMemo(() => {
    if (hydrating) {
      return null;
    }
    const enabledCount = tasks.reduce(
      (count, task) => (task.reminder?.enabled ? count + 1 : count),
      0,
    );
    return {
      value: enabledCount.toLocaleString(),
      count: enabledCount,
      ariaLabel:
        enabledCount === 1
          ? "1 task has a reminder enabled for today"
          : `${enabledCount} tasks have reminders enabled for today`,
    } as const;
  }, [hydrating, tasks]);
  const nudgesStat = React.useMemo(
    () =>
      reminderStat ??
      ({
        value: "—",
        count: 0,
        ariaLabel: "Nudges today loading",
      } as const),
    [reminderStat],
  );
  const handleViewModeChange = React.useCallback(
    (value: PlannerViewMode) => {
      if (value === viewMode) return;
      setViewMode(value);
    },
    [setViewMode, viewMode],
  );

  const handlePlanningEnergyChange = React.useCallback(
    (value: number) => {
      setPlanningEnergy(value);
    },
    [setPlanningEnergy],
  );

  const headerHeadingId = "planner-header";

  return (
    <>
      <Header
        heading={<span id={headerHeadingId}>Planner</span>}
        subtitle="Plan your week"
        icon={<CalendarDays className="opacity-80" />}
        navItems={navItems}
        variant="neo"
        underlineTone="brand"
        showThemeToggle
        tabs={{
          items: VIEW_MODE_TABS,
          value: viewMode,
          onChange: handleViewModeChange,
          ariaLabel: "Planner view",
          idBase: VIEW_TAB_ID_BASE,
          useSegmentedControl: true,
          right: (
            <div className="flex flex-col gap-[var(--space-2)] md:flex-row md:items-center md:gap-[var(--space-3)]">
              <span className="sr-only">Week controls</span>
              <PlannerIslandBoundary
                name="planner:week-picker"
                title="Week controls unavailable"
                description="We hit an error loading the planner controls. Retry to restore the week picker."
                retryLabel="Retry controls"
              >
                <WeekPicker />
              </PlannerIslandBoundary>
              <span
                aria-live="polite"
                className="text-label text-muted-foreground md:text-right"
              >
                {weekAnnouncement}
              </span>
            </div>
          ),
        }}
      />
      <PlannerHero
        planningEnergy={planningEnergy}
        onPlanningEnergyChange={handlePlanningEnergyChange}
        sliderFeedback={sliderFeedback}
        autopilotSummary={autopilotSummary}
        nudgesStat={nudgesStat}
      />

      <PageShell
        as="main"
        id="page-main"
        tabIndex={-1}
        aria-labelledby={headerHeadingId}
        className="py-[var(--space-6)]"
      >
        {VIEW_MODE_TABS.map((option) => {
          const tabId = `${VIEW_TAB_ID_BASE}-${option.key}-tab`;
          const panelId = `${VIEW_TAB_ID_BASE}-${option.key}-panel`;
          const isActive = viewMode === option.key;
          const ViewComponent = VIEW_COMPONENTS[option.key];

          return (
            <div
              key={option.key}
              role="tabpanel"
              id={panelId}
              aria-labelledby={tabId}
              hidden={!isActive}
              tabIndex={isActive ? 0 : -1}
            >
              {isActive ? (
                <React.Suspense fallback={<PlannerViewFallback mode={option.key} />}>
                  <ViewComponent />
                </React.Suspense>
              ) : null}
            </div>
          );
        })}
      </PageShell>
    </>
  );
}

/* ───────── Provider shell ───────── */

export function PlannerPage() {
  return (
    <RemindersProvider>
      <PlannerProvider>
        <Inner />
      </PlannerProvider>
    </RemindersProvider>
  );
}
