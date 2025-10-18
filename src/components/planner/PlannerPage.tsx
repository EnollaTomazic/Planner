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
import {
  Button,
  GlitchSegmentedButton,
  GlitchSegmentedGroup,
  PageHeader,
  PageShell,
} from "@/components/ui";
import { PortraitFrame } from "@/components/home/PortraitFrame";
import ProgressRingIcon from "@/icons/ProgressRingIcon";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { useOptionalTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import styles from "./PlannerPage.module.css";
import { useFocusDate, useWeek } from "./useFocusDate";
import { PlannerProvider, usePlanner, type PlannerViewMode } from "./PlannerProvider";
import { FOCUS_PLACEHOLDER } from "./plannerSerialization";
import { WeekPicker } from "./WeekPicker";
import { CalendarDays } from "lucide-react";
import { formatWeekRangeLabel } from "@/lib/date";
import { RemindersProvider } from "@/components/goals/reminders/useReminders";
import { PlannerIslandBoundary } from "./PlannerIslandBoundary";

const {
  heroPanel,
  heroContent,
  heroText,
  heroEyebrow,
  heroHeading,
  heroSubtitle,
  heroDial,
  heroRing,
  heroRingReduced,
  heroRingValue,
  heroRingCaption,
  heroSliderLabel,
  heroSlider,
  heroFeedback,
  heroActions,
  heroPortrait,
} = styles;

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

const VIEW_MODE_OPTIONS: Array<{ value: PlannerViewMode; label: string }> = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "agenda", label: "Agenda" },
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

function PlannerViewFallback({ mode }: PlannerViewFallbackProps) {
  const copy = VIEW_FALLBACK_CONTENT[mode];

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[12rem] flex-col items-center justify-center gap-[var(--space-2)] rounded-lg border border-dashed border-border/60 bg-muted/20 p-[var(--space-6)] text-center text-muted-foreground"
    >
      <span className="text-label font-medium tracking-[0.08em] uppercase">
        {copy.title}
      </span>
      <p className="max-w-prose text-subtle">{copy.description}</p>
    </div>
  );
}

/* ───────── Page body under provider ───────── */

function Inner() {
  const { iso, today } = useFocusDate();
  const { viewMode, setViewMode } = usePlanner();
  const { start, end } = useWeek(iso);
  const hydrating = today === FOCUS_PLACEHOLDER;
  const themeContext = useOptionalTheme();
  const themeVariant = themeContext?.[0].variant ?? "aurora";
  const prefersReducedMotion = usePrefersReducedMotion();
  const [planningEnergy, setPlanningEnergy] = React.useState(72);
  const weekAnnouncement = React.useMemo(
    () => (hydrating ? "Week preview loading…" : formatWeekRangeLabel(start, end)),
    [end, hydrating, start],
  );
  const labelId = React.useId();
  const sliderId = React.useId();
  const handleViewModeChange = React.useCallback(
    (value: string) => {
      if (value === viewMode) return;
      setViewMode(value as PlannerViewMode);
    },
    [setViewMode, viewMode],
  );

  const heroPose = React.useMemo(() => {
    if (themeVariant === "noir" || themeVariant === "hardstuck") {
      return "back-to-back";
    }
    if (themeVariant === "aurora" || themeVariant === "ocean") {
      return "angel-leading";
    }
    return "demon-leading";
  }, [themeVariant]);

  return (
    <>
      <PageShell as="header" grid className="py-[var(--space-6)]">
        <section className={heroPanel} aria-labelledby="planner-hero-heading">
          <div className={heroContent}>
            <div className={cn(heroText, "col-span-full")}>
              <span className={heroEyebrow}>Planner autopilot</span>
              <h2 id="planner-hero-heading" className={heroHeading}>
                Agnes &amp; Noxi tuned this sprint blueprint
              </h2>
              <p className={heroSubtitle}>
                Tweak the focus dial before locking the week. Agnes maps the calm line, Noxi keeps the glitch guardrails on.
                Every suggestion stays editable.
              </p>
              <div className={heroDial}>
                <div
                  className={cn(
                    heroRing,
                    prefersReducedMotion && heroRingReduced,
                  )}
                >
                  <ProgressRingIcon pct={planningEnergy} size="l" />
                  <span className={heroRingValue}>{planningEnergy}%</span>
                </div>
                <span className={heroRingCaption}>Focus calibration</span>
                <label className={heroSliderLabel} htmlFor={sliderId}>
                  <span className="text-label font-medium tracking-[0.08em] uppercase">
                    Adjust energy
                  </span>
                  <input
                    id={sliderId}
                    type="range"
                    min={20}
                    max={100}
                    step={1}
                    value={planningEnergy}
                    onChange={(event) => setPlanningEnergy(Number(event.target.value))}
                    className={heroSlider}
                    aria-valuemin={20}
                    aria-valuemax={100}
                    aria-valuenow={planningEnergy}
                    aria-describedby={`${sliderId}-feedback`}
                  />
                  <span
                    id={`${sliderId}-feedback`}
                    className={heroFeedback}
                    aria-live="polite"
                  >
                    {planningEnergy >= 75
                      ? "High-intensity push queued."
                      : planningEnergy <= 40
                        ? "Keeping a low-impact tempo."
                        : "Balanced cadence engaged."}
                  </span>
                </label>
              </div>
              <div className={heroActions}>
                <Button size="sm" variant="quiet" tone="accent">
                  Retry suggestions
                </Button>
                <Button size="sm" variant="default" tone="accent">
                  Edit draft
                </Button>
                <Button size="sm" variant="quiet">
                  Cancel
                </Button>
              </div>
            </div>
            <div className={heroPortrait}>
              <PortraitFrame pose={heroPose} transparentBackground />
            </div>
          </div>
        </section>
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
                <PlannerIslandBoundary
                  name="planner:week-picker"
                  title="Week controls unavailable"
                  description="We hit an error loading the planner controls. Retry to restore the week picker."
                  retryLabel="Retry controls"
                >
                  <WeekPicker />
                </PlannerIslandBoundary>
                <div aria-live="polite" className="sr-only">
                  {weekAnnouncement}
                </div>
              </>
            ),
          }}
        />
        <div className="col-span-full mt-[var(--space-4)] flex flex-wrap items-center justify-between gap-[var(--space-2)]">
          <span
            id={labelId}
            className="text-label font-medium text-muted-foreground"
          >
            View
          </span>
          <GlitchSegmentedGroup
            value={viewMode}
            onChange={handleViewModeChange}
            ariaLabelledby={labelId}
          >
            {VIEW_MODE_OPTIONS.map((option) => {
              const tabId = `${VIEW_TAB_ID_BASE}-${option.value}-tab`;
              const panelId = `${VIEW_TAB_ID_BASE}-${option.value}-panel`;
              return (
                <GlitchSegmentedButton
                  key={option.value}
                  value={option.value}
                  id={tabId}
                  aria-controls={panelId}
                >
                  {option.label}
                </GlitchSegmentedButton>
              );
            })}
          </GlitchSegmentedGroup>
        </div>
      </PageShell>

      {VIEW_MODE_OPTIONS.map((option) => {
        const tabId = `${VIEW_TAB_ID_BASE}-${option.value}-tab`;
        const panelId = `${VIEW_TAB_ID_BASE}-${option.value}-panel`;
        const isActive = viewMode === option.value;
        const ViewComponent = VIEW_COMPONENTS[option.value];

        return (
          <div
            key={option.value}
            role="tabpanel"
            id={panelId}
            aria-labelledby={tabId}
            hidden={!isActive}
            tabIndex={isActive ? 0 : -1}
          >
            {isActive ? (
              <React.Suspense fallback={<PlannerViewFallback mode={option.value} />}>
                <ViewComponent />
              </React.Suspense>
            ) : null}
          </div>
        );
      })}
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
