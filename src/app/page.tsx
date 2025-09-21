"use client";

import * as React from "react";
import { Suspense } from "react";
import { Home } from "lucide-react";
import Link from "next/link";
import {
  DashboardCard,
  QuickActions,
  TodayCard,
  GoalsCard,
  ReviewsCard,
  TeamPromptsCard,
  IsometricRoom,
  DashboardList,
  WelcomeHeroFigure,
} from "@/components/home";
import {
  PageHeader,
  PageShell,
  Button,
  ThemeToggle,
  Spinner,
  NeoCard,
  CheckCircle,
} from "@/components/ui";
import {
  PlannerProvider,
  useDay,
  useFocusDate,
  useWeek,
  useWeekData,
} from "@/components/planner";
import { useGoals } from "@/components/goals";
import { useReviews } from "@/components/reviews";
import { useChatPrompts } from "@/components/prompts";
import { useTheme } from "@/lib/theme-context";
import { useThemeQuerySync } from "@/lib/theme-hooks";
import type { Goal } from "@/lib/types";
import { formatWeekRangeLabel, fromISODate } from "@/lib/date";
import { LOCALE, cn } from "@/lib/utils";
import ProgressRingIcon from "@/icons/ProgressRingIcon";

type WeeklyHighlight = {
  id: string;
  title: string;
  schedule: string;
  summary: string;
};

const weeklyHighlights = [
  {
    id: "strategy-sync",
    title: "Strategy sync",
    schedule: "Today · 3:00 PM",
    summary: "Align backlog for the Q2 milestone and confirm owners.",
  },
  {
    id: "retro",
    title: "Sprint retro",
    schedule: "Wed · 11:00 AM",
    summary: "Collect insights to finalize review prompts and next sprint goals.",
  },
  {
    id: "review-window",
    title: "Review window",
    schedule: "Fri · All day",
    summary: "Encourage the team to log highlights before the week wraps.",
  },
] as const satisfies readonly WeeklyHighlight[];

const focusDayFormatter = new Intl.DateTimeFormat(LOCALE, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

const calendarWeekdayFormatter = new Intl.DateTimeFormat(LOCALE, {
  weekday: "short",
});

const calendarDayFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
});

function HeroPlannerCards() {
  const { iso, setIso } = useFocusDate();
  const { projects, tasks, toggleTask, doneCount, totalCount } = useDay(iso);
  const tasksPreview = React.useMemo(() => tasks.slice(0, 4), [tasks]);
  const remainingTasks = Math.max(tasks.length - tasksPreview.length, 0);

  const projectNames = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const project of projects) {
      map.set(project.id, project.name);
    }
    return map;
  }, [projects]);

  const focusDate = React.useMemo(() => fromISODate(iso), [iso]);
  const focusLabel = React.useMemo(() => {
    if (!focusDate) return iso;
    return focusDayFormatter.format(focusDate);
  }, [focusDate, iso]);

  const handleToggleTask = React.useCallback(
    (taskId: string) => {
      toggleTask(taskId);
    },
    [toggleTask],
  );

  const { goals } = useGoals();
  const { totalCount: reviewCount, flaggedReviewCount } = useReviews();
  const { prompts } = useChatPrompts();
  const goalStats = React.useMemo(() => {
    let completed = 0;
    const active: Goal[] = [];
    for (const goal of goals) {
      if (goal.done) {
        completed += 1;
      } else if (active.length < 2) {
        active.push(goal);
      }
    }
    return {
      total: goals.length,
      completed,
      active,
    } as const;
  }, [goals]);

  const goalPct = React.useMemo(() => {
    if (goalStats.total === 0) return 0;
    const pct = (goalStats.completed / goalStats.total) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }, [goalStats.completed, goalStats.total]);
  const promptCount = prompts.length;

  const heroSummaryItems = React.useMemo(
    () => {
      const reviewValue =
        flaggedReviewCount > 0
          ? `${flaggedReviewCount} review${flaggedReviewCount === 1 ? "" : "s"}`
          : reviewCount > 0
            ? "All caught up"
            : "No reviews yet";
      const promptValue =
        promptCount > 0 ? `${promptCount} saved` : "Start a prompt";
      return [
        {
          key: "focus" as const,
          label: "Next focus",
          value: focusLabel,
          href: "/planner",
          cta: "Open planner",
        },
        {
          key: "reviews" as const,
          label: "Open reviews",
          value: reviewValue,
          href: "/reviews",
          cta: flaggedReviewCount > 0 ? "Review now" : "View reviews",
        },
        {
          key: "prompts" as const,
          label: "Team prompts",
          value: promptValue,
          href: "/prompts",
          cta: promptCount > 0 ? "View prompts" : "Browse prompts",
        },
      ] as const;
    },
    [flaggedReviewCount, focusLabel, promptCount, reviewCount],
  );

  const heroSummary = (
    <div className="col-span-12 md:col-span-6 lg:col-span-4">
      <NeoCard className="flex h-full flex-col gap-[var(--space-3)] md:p-[var(--space-5)]">
        <div className="space-y-[var(--space-1)]">
          <p className="text-label text-muted-foreground">Highlights</p>
          <h3 className="text-body font-semibold text-card-foreground tracking-[-0.01em]">
            Quick summary
          </h3>
        </div>
        <ul className="grid gap-[var(--space-2)]" role="list">
          {heroSummaryItems.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center justify-between gap-[var(--space-3)] rounded-card r-card-md border border-border/60 bg-card/70 px-[var(--space-3)] py-[var(--space-2)] transition",
                  "hover:border-primary/40 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
                )}
              >
                <div className="flex min-w-0 flex-col gap-[var(--space-1)]">
                  <span className="text-label text-muted-foreground">{item.label}</span>
                  <span className="text-ui font-semibold text-card-foreground text-balance">
                    {item.value}
                  </span>
                </div>
                <span className="shrink-0 text-label font-medium text-primary transition-colors group-hover:text-primary-foreground">
                  {item.cta}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </NeoCard>
    </div>
  );

  const { start, end, days, isToday } = useWeek(iso);
  const { per, weekDone, weekTotal } = useWeekData(days);
  const weekLabel = React.useMemo(
    () => formatWeekRangeLabel(start, end),
    [start, end],
  );

  const handleSelectDay = React.useCallback(
    (nextIso: string) => {
      setIso(nextIso);
    },
    [setIso],
  );

  return (
    <div className="grid grid-cols-12 gap-[var(--space-5)]">
      {heroSummary}
      <div className="col-span-12 md:col-span-6 lg:col-span-4">
        <NeoCard className="flex h-full flex-col gap-[var(--space-4)] p-[var(--space-4)] md:p-[var(--space-5)]">
          <header className="flex items-start justify-between gap-[var(--space-3)]">
            <div className="space-y-[var(--space-1)]">
              <p className="text-label text-muted-foreground">Focus day</p>
              <h3 className="text-body font-semibold text-card-foreground tracking-[-0.01em]">
                {focusLabel}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-label text-muted-foreground">Progress</p>
              <p className="text-ui font-medium tabular-nums text-card-foreground">
                {doneCount}/{totalCount}
              </p>
            </div>
          </header>
          <ul className="flex flex-col gap-[var(--space-3)]" aria-live="polite">
            {tasksPreview.length > 0 ? (
              tasksPreview.map((task) => {
                const projectName = task.projectId
                  ? projectNames.get(task.projectId) ?? null
                  : null;
                const toggleLabel = task.done
                  ? `Mark ${task.title} as not done`
                  : `Mark ${task.title} as done`;
                return (
                  <li key={task.id} className="flex items-start gap-[var(--space-3)]">
                    <CheckCircle
                      checked={task.done}
                      onChange={() => handleToggleTask(task.id)}
                      aria-label={toggleLabel}
                      size="sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      aria-pressed={task.done}
                      aria-label={toggleLabel}
                      className={cn(
                        "flex flex-col items-start gap-[var(--space-1)] rounded-card r-card-sm px-[var(--space-1)] py-[var(--space-1)] text-left transition",
                        "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
                        "active:text-foreground/80",
                      )}
                    >
                      <span
                        className={cn(
                          "text-ui font-medium text-card-foreground",
                          task.done && "line-through-soft text-muted-foreground",
                        )}
                      >
                        {task.title}
                      </span>
                      {projectName ? (
                        <span className="text-label text-muted-foreground">{projectName}</span>
                      ) : null}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="rounded-card r-card-md border border-dashed border-border px-[var(--space-3)] py-[var(--space-3)] text-label text-muted-foreground">
                No tasks captured for this day.
              </li>
            )}
          </ul>
          {remainingTasks > 0 ? (
            <p className="text-label text-muted-foreground">
              +{remainingTasks} more task{remainingTasks === 1 ? "" : "s"} in planner
            </p>
          ) : null}
        </NeoCard>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4">
        <NeoCard className="flex h-full flex-col gap-[var(--space-4)] p-[var(--space-4)] md:p-[var(--space-5)]">
          <header className="flex items-start justify-between gap-[var(--space-3)]">
            <div className="space-y-[var(--space-1)]">
              <p className="text-label text-muted-foreground">Goals overview</p>
              <h3 className="text-body font-semibold text-card-foreground tracking-[-0.01em]">
                Momentum
              </h3>
            </div>
            <div className="text-right">
              <p className="text-label text-muted-foreground">Completed</p>
              <p className="text-ui font-medium tabular-nums text-card-foreground">
                {goalStats.completed}/{goalStats.total}
              </p>
            </div>
          </header>
          <div className="flex flex-col gap-[var(--space-4)] md:flex-row md:items-center md:gap-[var(--space-5)]">
            <div className="flex items-center justify-center">
              <div className="relative flex h-[var(--space-8)] w-[var(--space-8)] items-center justify-center">
                <ProgressRingIcon pct={goalPct} size={64} />
                <span className="absolute text-ui font-semibold tabular-nums text-card-foreground">
                  {goalStats.total === 0 ? "0%" : `${goalPct}%`}
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-[var(--space-3)]">
              {goalStats.total === 0 ? (
                <p className="text-label text-muted-foreground">
                  No goals tracked yet. Capture one in the goals workspace to see it here.
                </p>
              ) : goalStats.active.length > 0 ? (
                goalStats.active.map((goal) => (
                  <div key={goal.id} className="space-y-[var(--space-1)]">
                    <p className="text-ui font-medium text-card-foreground">{goal.title}</p>
                    {goal.metric ? (
                      <p className="text-label text-muted-foreground">{goal.metric}</p>
                    ) : goal.notes ? (
                      <p className="text-label text-muted-foreground">{goal.notes}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-label text-muted-foreground">
                  All active goals are complete. Great work!
                </p>
              )}
            </div>
          </div>
        </NeoCard>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4">
        <NeoCard className="flex h-full flex-col gap-[var(--space-4)] p-[var(--space-4)] md:p-[var(--space-5)]">
          <header className="space-y-[var(--space-1)]">
            <p className="text-label text-muted-foreground">Weekly calendar</p>
            <h3 className="text-body font-semibold text-card-foreground tracking-[-0.01em]">
              {weekLabel}
            </h3>
            <p className="text-label text-muted-foreground">
              {weekTotal > 0 ? (
                <span className="tabular-nums text-card-foreground">
                  {weekDone}/{weekTotal}
                </span>
              ) : (
                "No tasks scheduled this week"
              )}
            </p>
          </header>
          <div className="flex overflow-x-auto rounded-card r-card-lg border border-border/60 p-[var(--space-2)]">
            <ul className="flex w-full min-w-0 gap-[var(--space-2)]" aria-label="Select focus day">
              {per.map((day) => {
                const dayDate = fromISODate(day.iso);
                const weekday = dayDate
                  ? calendarWeekdayFormatter.format(dayDate)
                  : day.iso;
                const dayNumber = dayDate
                  ? calendarDayFormatter.format(dayDate)
                  : "--";
                const selected = day.iso === iso;
                const todayMarker = isToday(day.iso);
                return (
                  <li
                    key={day.iso}
                    className="flex-1 min-w-[calc(var(--space-8)+var(--space-2))]"
                  >
                    <button
                      type="button"
                      aria-pressed={selected}
                      aria-current={todayMarker ? "date" : undefined}
                      onClick={() => handleSelectDay(day.iso)}
                      className={cn(
                        "flex w-full flex-col items-start gap-[var(--space-1)] rounded-card r-card-md border px-[var(--space-3)] py-[var(--space-2)] text-left transition",
                        "border-card-hairline bg-card/70 hover:border-primary/40 hover:bg-card/80",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
                        "active:bg-card/90",
                        selected && "border-primary/70 bg-card",
                      )}
                    >
                      <span
                        className={cn(
                          "text-label text-muted-foreground",
                          todayMarker && "text-accent-3",
                        )}
                      >
                        {weekday}
                      </span>
                      <span className="text-ui font-semibold tabular-nums text-card-foreground">
                        {dayNumber}
                      </span>
                      <span className="text-label text-muted-foreground tabular-nums">
                        {day.done}/{day.total}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </NeoCard>
      </div>
    </div>
  );
}

function HomePageContent() {
  const [theme] = useTheme();
  useThemeQuerySync();

  const heroSurfaceClass =
    "relative z-10 isolate rounded-[var(--radius-2xl)] bg-card/30 shadow-neoSoft backdrop-blur-lg";
  const contentSurfaceClass =
    "relative z-10 isolate rounded-[var(--radius-2xl)] border border-border/50 bg-card/30 shadow-neoSoft backdrop-blur-lg";
  const floatingPaddingClass =
    "p-[var(--space-4)] md:p-[var(--space-5)]";

  return (
    <PlannerProvider>
      <PageShell
        as="main"
        aria-labelledby="home-header"
        className="py-[var(--space-6)] md:pb-[var(--space-8)]"
      >
        <div className="relative isolate rounded-[var(--radius-2xl)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] border border-border/40 bg-panel/70 shadow-neo-inset"
          />
          <div className="relative space-y-[var(--space-6)] p-[var(--space-4)] md:space-y-[var(--space-8)] md:p-[var(--space-5)]">
            <div className={cn(heroSurfaceClass, floatingPaddingClass)}>
              <section
                id="landing-hero"
                role="region"
                aria-label="Intro"
                className="grid grid-cols-12 gap-[var(--space-4)] pb-[var(--space-2)] md:pb-[var(--space-3)]"
              >
                <div className="col-span-12">
                  <PageHeader
                    header={{
                      id: "home-header",
                      heading: "Welcome to Planner",
                      subtitle: "Plan your day, track goals, and review games.",
                      icon: <Home className="opacity-80" />,
                      sticky: false,
                    }}
                    hero={{
                      heading: "Your day at a glance",
                      sticky: false,
                      barVariant: "raised",
                      glitch: "subtle",
                      topClassName: "top-0",
                      actions: (
                        <div className="grid w-full grid-cols-12 gap-[var(--space-4)] sm:items-center">
                          <div className="col-span-12 flex w-full flex-wrap items-center justify-end gap-[var(--space-2)] sm:flex-nowrap md:col-span-8 lg:col-span-7">
                            <ThemeToggle className="shrink-0" />
                            <Button
                              asChild
                              variant="primary"
                              size="sm"
                              tactile
                              className="whitespace-nowrap"
                            >
                              <Link href="/planner">Plan Week</Link>
                            </Button>
                          </div>
                          <WelcomeHeroFigure className="col-span-12 md:col-span-4 lg:col-span-5" />
                        </div>
                      ),
                    }}
                  />
                </div>
              </section>
            </div>
            <div
              className={cn(
                "space-y-[var(--space-7)]",
                contentSurfaceClass,
                floatingPaddingClass,
              )}
            >
              <div className="grid items-start gap-[var(--space-4)] md:grid-cols-12">
                <div className="md:col-span-6">
                  <QuickActions />
                </div>
                <div className="md:col-span-6">
                  <IsometricRoom variant={theme.variant} />
                </div>
              </div>
              <div className="pt-[var(--space-4)]">
                <HeroPlannerCards />
              </div>
              <section className="grid grid-cols-1 gap-[var(--space-6)] md:grid-cols-12">
                <div className="md:col-span-4">
                  <TodayCard />
                </div>
                <div className="md:col-span-4">
                  <GoalsCard />
                </div>
                <div className="md:col-span-4">
                  <ReviewsCard />
                </div>
                <div className="md:col-span-4">
                  <DashboardCard
                    title="Weekly focus"
                    cta={{ label: "Open planner", href: "/planner" }}
                  >
                    <DashboardList
                      items={weeklyHighlights}
                      getKey={(highlight) => highlight.id}
                      itemClassName="py-[var(--space-2)]"
                      empty="No highlights scheduled"
                      renderItem={(highlight) => (
                        <div className="flex flex-col gap-[var(--space-2)]">
                          <div className="flex items-baseline justify-between gap-[var(--space-3)]">
                            <p className="text-ui font-medium">{highlight.title}</p>
                            <span className="text-label text-muted-foreground">
                              {highlight.schedule}
                            </span>
                          </div>
                          <p className="text-body text-muted-foreground">
                            {highlight.summary}
                          </p>
                        </div>
                      )}
                    />
                  </DashboardCard>
                </div>
                <div className="md:col-span-12">
                  <TeamPromptsCard />
                </div>
              </section>
            </div>
          </div>
        </div>
      </PageShell>
    </PlannerProvider>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <PageShell as="main" aria-busy="true">
          <div className="flex justify-center p-[var(--space-6)]">
            <Spinner />
          </div>
        </PageShell>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
