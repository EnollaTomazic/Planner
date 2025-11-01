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
import { PlannerProvider, usePlanner, type PlannerViewMode } from "./plannerContext";
import { FOCUS_PLACEHOLDER } from "./plannerSerialization";
import { WeekPicker } from "./WeekPicker";
import { CalendarDays } from "lucide-react";
import { formatWeekDay, formatWeekRangeLabel } from "@/lib/date";
import { RemindersProvider } from "@/components/goals/reminders/useReminders";
import { PlannerIslandBoundary } from "./PlannerIslandBoundary";
import { useWeekData } from "./useWeekData";
import useBasePath from "@/lib/useBasePath";
import { PlannerStatChip } from "./PlannerStatChip";
import { useDay } from "./useDay";

const {
  heroRow: heroPanel,
  heroNoise,
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
  heroPortraitChipStack,
  heroPortraitChip,
  heroPortraitChipReminder,
  heroPortraitFrame,
  heroPortraitFrameShell,
  quickLinksRow,
  quickLinksList,
  quickLinkItem,
  quickLinkChip,
  quickLinkLabel,
  quickLinkMeta,
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
  const themeContext = useOptionalTheme();
  const themeVariant = themeContext?.[0].variant ?? "aurora";
  const prefersReducedMotion = usePrefersReducedMotion();
  const [planningEnergy, setPlanningEnergy] = React.useState(72);
  const { per, weekDone, weekTotal } = useWeekData(days ?? []);
  const { withBasePath } = useBasePath();
  const weekAnnouncement = React.useMemo(
    () => (hydrating ? "Week preview loading…" : formatWeekRangeLabel(start, end)),
    [end, hydrating, start],
  );
  const todayStat = React.useMemo(() => {
    if (hydrating || !per.length) {
      return null;
    }
    const entry = per.find((day) => day.iso === today);
    if (!entry) {
      return null;
    }
    if (entry.total === 0) {
      return {
        value: "0",
        ariaLabel: "No tasks scheduled for today",
      } as const;
    }
    return {
      value: `${entry.done}/${entry.total}`,
      ariaLabel: `${entry.done} of ${entry.total} tasks complete today`,
    } as const;
  }, [hydrating, per, today]);
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

  type QuickLink = {
    id: string;
    label: string;
    description?: string;
    href: string;
  };

  const quickLinks = React.useMemo<QuickLink[]>(() => {
    if (!per.length) {
      return [];
    }
    const plannerRoot = withBasePath("/planner/");
    const completionPct = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;
    const catchUpTarget = per.find((day) => day.total > day.done) ?? per[0];
    const leadingDay = per.reduce((winner, candidate) => {
      if (!winner) return candidate;
      const winnerRate = winner.total ? winner.done / winner.total : 0;
      const candidateRate = candidate.total ? candidate.done / candidate.total : 0;
      if (candidateRate === winnerRate) {
        return candidate.done > winner.done ? candidate : winner;
      }
      return candidateRate > winnerRate ? candidate : winner;
    }, per[0]);

    const items: QuickLink[] = [
      {
        id: "progress",
        label: `${completionPct}% synced`,
        description:
          weekTotal > 0
            ? `${weekDone} of ${weekTotal} tasks locked`
            : "Draft your first tasks",
        href: `${plannerRoot}#planner-view-week-panel`,
      },
    ];

    if (catchUpTarget) {
      items.push({
        id: "focus",
        label: `Focus ${formatWeekDay(catchUpTarget.iso)}`,
        description: `${catchUpTarget.done}/${catchUpTarget.total} tasks cleared`,
        href: `${plannerRoot}#planner-view-day-panel`,
      });
    }

    if (leadingDay) {
      items.push({
        id: `streak-${leadingDay.iso}`,
        label: `${formatWeekDay(leadingDay.iso)} streak`,
        description:
          leadingDay.done > 0
            ? `${leadingDay.done} tasks complete`
            : "Kick off the streak",
        href: `${plannerRoot}#planner-view-month-panel`,
      });
    }

    items.push({
      id: "agenda",
      label: "Review agenda",
      description: "See reminders and open loops",
      href: `${plannerRoot}#planner-view-agenda-panel`,
    });

    return items;
  }, [per, weekDone, weekTotal, withBasePath]);

  return (
    <>
      <PageShell as="header" grid className="py-[var(--space-7)]">
        <section
          className={cn(
            "col-span-full md:col-span-12",
            heroPanel,
            "rounded-card r-card-lg border border-card-hairline-60 shadow-neo-strong shadow-depth-outer-strong",
          )}
          aria-labelledby="planner-hero-heading"
        >
          <div
            aria-hidden="true"
            className={cn(
              heroNoise,
              "bg-glitch-noise bg-cover mix-blend-screen",
              prefersReducedMotion
                ? "motion-reduce:animate-none"
                : "motion-safe:animate-glitch-noise",
            )}
          />
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
              {quickLinks.length ? (
                <nav aria-label="Planner quick suggestions" className={quickLinksRow}>
                  <ul className={quickLinksList} role="list">
                    {quickLinks.map((link) => (
                      <li key={link.id} className={quickLinkItem}>
                        <a
                          className={cn(
                            quickLinkChip,
                            "rounded-card r-card-md border border-card-hairline-60 shadow-depth-soft",
                          )}
                          href={link.href}
                        >
                          <span className={quickLinkLabel}>{link.label}</span>
                          {link.description ? (
                            <span className={quickLinkMeta}>{link.description}</span>
                          ) : null}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : null}
            </div>
            <div className={heroPortrait}>
              {todayStat || reminderStat ? (
                <div className={heroPortraitChipStack}>
                  {todayStat ? (
                    <PlannerStatChip
                      label="Tasks today"
                      value={todayStat.value}
                      ariaLabel={todayStat.ariaLabel}
                      className={heroPortraitChip}
                    />
                  ) : null}
                  {reminderStat ? (
                    <PlannerStatChip
                      label="Nudges today"
                      value={reminderStat.value}
                      ariaLabel={reminderStat.ariaLabel}
                      className={cn(heroPortraitChip, heroPortraitChipReminder)}
                    />
                  ) : null}
                </div>
              ) : null}
              <div className={heroPortraitFrameShell}>
                <PortraitFrame
                  pose={heroPose}
                  transparentBackground
                  pulse={(reminderStat?.count ?? 0) > 0}
                  className={heroPortraitFrame}
                  size="xl"
                  priority
                />
              </div>
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
            className: "planner-header__hero",
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
