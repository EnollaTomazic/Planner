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
import Image from "next/image";
import {
  Button,
  GlitchProgress,
  HeroCol,
  HeroGrid,
  PageHeader,
  PageShell,
  SegmentedControl,
} from "@/components/ui";
import { Hero } from "@/components/ui/layout/Hero";
import { Slider } from "@/components/ui/primitives/Slider";
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
import { SmallAgnesNoxiImage } from "./SmallAgnesNoxiImage";

const {
  autopilotHero,
  heroSummaryColumn,
  heroSummaryCard,
  heroSummaryLabel,
  heroSummaryBody,
  heroMetrics,
  heroDonut,
  heroDonutRing,
  heroDonutValue,
  heroDonutCaption,
  heroStatStack,
  heroControls,
  heroActionButtons,
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
  const [planningEnergy, setPlanningEnergy] = React.useState(72);
  const { per, weekDone, weekTotal } = useWeekData(days ?? []);
  const { withBasePath } = useBasePath();
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
  const donutStyle = React.useMemo<React.CSSProperties>(
    () =>
      ({
        ["--donut-progress" as const]: planningEnergy,
      } as React.CSSProperties),
    [planningEnergy],
  );
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
        done: entry.done,
        total: entry.total,
      } as const;
    }
    return {
      value: `${entry.done}/${entry.total}`,
      ariaLabel: `${entry.done} of ${entry.total} tasks complete today`,
      done: entry.done,
      total: entry.total,
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
  const handleViewModeChange = React.useCallback(
    (value: PlannerViewMode) => {
      if (value === viewMode) return;
      setViewMode(value);
    },
    [setViewMode, viewMode],
  );

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
        <Hero
          className={cn("col-span-full md:col-span-12", autopilotHero)}
          sticky={false}
          eyebrow="Planner autopilot"
          title="Your sprint blueprint"
          subtitle="Tweak the focus dial before locking the week. Agnes maps the calm line, Noxi keeps the glitch guardrails on. Every suggestion stays editable."
          icon={
            <GlitchProgress
              value={planningEnergy}
              size="xl"
              aria-label="Planner autopilot energy"
            />
          }
          illustration={<SmallAgnesNoxiImage />}
          illustrationAlt="Agnes and Noxi calibrating the sprint blueprint"
          actions={
            quickLinks.length ? (
              <nav aria-label="Planner quick suggestions" className={quickLinksRow}>
                <ul className={quickLinksList} role="list">
                  {quickLinks.map((link) => (
                    <li key={link.id} className={quickLinkItem}>
                      <a className={quickLinkChip} href={link.href}>
                        <span className={quickLinkLabel}>{link.label}</span>
                        {link.description ? (
                          <span className={quickLinkMeta}>{link.description}</span>
                        ) : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null
          }
        >
          <HeroGrid>
            <HeroCol span={7} className={heroSummaryColumn}>
              <div className={heroSummaryCard}>
                <span className={heroSummaryLabel}>Autopilot status</span>
                <p className={heroSummaryBody}>{autopilotSummary}</p>
              </div>
              <div className={heroControls}>
                <Slider
                  label="Adjust energy"
                  min={20}
                  max={100}
                  step={1}
                  value={planningEnergy}
                  onChange={(event) => setPlanningEnergy(Number(event.target.value))}
                  minLabel="20%"
                  maxLabel="100%"
                  description={sliderFeedback}
                />
                <div className={heroActionButtons}>
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
            </HeroCol>
            <HeroCol span={5} className={heroMetrics}>
              <div className={heroDonut}>
                <div
                  className={heroDonutRing}
                  style={donutStyle}
                  role="progressbar"
                  aria-label={`Focus calibration ${planningEnergy}%`}
                  aria-valuemin={20}
                  aria-valuemax={100}
                  aria-valuenow={planningEnergy}
                >
                  <span className={heroDonutValue} aria-hidden>
                    {planningEnergy}%
                  </span>
                </div>
                <span className={heroDonutCaption}>Focus calibration</span>
              </div>
              <div className={heroStatStack}>
                {todayStat ? (
                  <PlannerStatChip
                    label="Tasks today"
                    value={todayStat.value}
                    ariaLabel={todayStat.ariaLabel}
                    current={todayStat.done}
                    total={todayStat.total}
                  />
                ) : null}
                {reminderStat ? (
                  <PlannerStatChip
                    label="Nudges today"
                    value={reminderStat.value}
                    ariaLabel={reminderStat.ariaLabel}
                  />
                ) : null}
              </div>
            </HeroCol>
          </HeroGrid>
        </Hero>
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
            title: "Week controls",
            className: "planner-header__hero",
            illustration: (
              <Image
                src="/images/noxi.svg"
                alt="Noxi guiding weekly planning"
                fill
                sizes="(min-width: 1280px) 40vw, (min-width: 768px) 60vw, 100vw"
                priority={false}
                className="object-contain object-right md:object-center"
              />
            ),
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
                <div className="flex flex-col gap-[var(--space-2)]">
                  <span
                    id={labelId}
                    className="text-label font-medium text-muted-foreground"
                  >
                    View
                  </span>
                  <SegmentedControl<PlannerViewMode>
                    options={VIEW_MODE_OPTIONS}
                    value={viewMode}
                    onValueChange={handleViewModeChange}
                    ariaLabelledBy={labelId}
                    size="lg"
                    align="start"
                    className="w-full"
                    idBase={VIEW_TAB_ID_BASE}
                  />
                </div>
                <div aria-live="polite" className="sr-only">
                  {weekAnnouncement}
                </div>
              </>
            ),
          }}
        />
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
