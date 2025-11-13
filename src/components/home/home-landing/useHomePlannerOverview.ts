"use client";

import * as React from "react";
import { useGoals } from "@/components/goals";
import { useChatPrompts } from "@/components/prompts";
import { useReviews } from "@/components/reviews";
import { useDay, useFocusDate, useWeek, useWeekData } from "@/components/planner";
import { formatWeekRangeLabel, fromISODate } from "@/lib/date";
import { LOCALE } from "@/lib/utils";
import type {
  PlannerOverviewCalendarDay,
  PlannerOverviewFocusProps,
  PlannerOverviewFocusTask,
  PlannerOverviewGoalsProps,
  PlannerOverviewGoalItem,
  PlannerOverviewProps,
  PlannerOverviewRangeKey,
  PlannerOverviewSummaryItem,
} from "./types";

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

const calendarMonthFormatter = new Intl.DateTimeFormat(LOCALE, {
  month: "long",
  year: "numeric",
});

type PlannerCalendarDayState = ReturnType<typeof useWeekData>["per"][number] & {
  disabled?: boolean;
  loading?: boolean;
};

export function useHomePlannerOverview(): PlannerOverviewProps {
  const { iso, setIso, hydrated } = useFocusDate();
  const hydrating = !hydrated;
  const [range, setRange] = React.useState<PlannerOverviewRangeKey>("week");
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

  const focusDate = React.useMemo(() => {
    if (hydrating) return null;
    return fromISODate(iso);
  }, [hydrating, iso]);
  const focusLabel = React.useMemo(() => {
    if (hydrating) return "Loading…";
    if (!focusDate) return iso;
    return focusDayFormatter.format(focusDate);
  }, [focusDate, hydrating, iso]);

  const focusMonthLabel = React.useMemo(() => {
    if (hydrating) return "Loading…";
    if (!focusDate) return "This month";
    return calendarMonthFormatter.format(focusDate);
  }, [focusDate, hydrating]);

  const handleToggleTask = React.useCallback(
    (taskId: string) => {
      if (hydrating) return;
      toggleTask(taskId);
    },
    [hydrating, toggleTask],
  );

  const focusTasks: PlannerOverviewFocusTask[] = React.useMemo(() => {
    return tasksPreview.map((task) => {
      const projectName = task.projectId
        ? projectNames.get(task.projectId) ?? null
        : null;
      const toggleLabel = task.done
        ? `Mark ${task.title} as not done`
        : `Mark ${task.title} as done`;
      return {
        id: task.id,
        title: task.title,
        projectName,
        done: task.done,
        toggleLabel,
      } satisfies PlannerOverviewFocusTask;
    });
  }, [projectNames, tasksPreview]);

  const { goals } = useGoals();
  const { totalCount: reviewCount, flaggedReviewCount } = useReviews();
  const { prompts } = useChatPrompts();

  const goalStats = React.useMemo(() => {
    let completed = 0;
    const active: PlannerOverviewGoalItem[] = [];
    for (const goal of goals) {
      if (goal.done) {
        completed += 1;
      } else if (active.length < 2) {
        const detail = goal.metric ?? goal.notes ?? null;
        active.push({
          id: goal.id,
          title: goal.title,
          detail,
        });
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

  const summaryItems: PlannerOverviewSummaryItem[] = React.useMemo(() => {
    const reviewValue =
      flaggedReviewCount > 0
        ? `${flaggedReviewCount} review${flaggedReviewCount === 1 ? "" : "s"}`
        : reviewCount > 0
          ? "All caught up"
          : "Start a review";
    const promptValue = promptCount > 0 ? `${promptCount} saved` : "Start a prompt";
    return [
      {
        key: "focus",
        label: "Planner focus",
        value: focusLabel,
        href: "/planner",
        cta: "Open planner",
      },
      {
        key: "reviews",
        label: "Open reviews",
        value: reviewValue,
        href: "/reviews",
        cta: flaggedReviewCount > 0 ? "Review now" : "View reviews",
      },
      {
        key: "prompts",
        label: "Team prompts",
        value: promptValue,
        href: "/prompts",
        cta: promptCount > 0 ? "View prompts" : "Browse prompts",
      },
    ];
  }, [flaggedReviewCount, focusLabel, promptCount, reviewCount]);

  const { start, end, days, isToday } = useWeek(iso);
  const { per, weekDone, weekTotal } = useWeekData(days);

  const weekLabel = React.useMemo(
    () => (hydrating ? "Week preview loading…" : formatWeekRangeLabel(start, end)),
    [end, hydrating, start],
  );

  const weekSummary = React.useMemo(() => {
    if (hydrating) {
      return "Planner week will load after setup.";
    }
    if (weekTotal > 0) {
      return `${weekDone}/${weekTotal}`;
    }
    return "No tasks scheduled this week";
  }, [hydrating, weekDone, weekTotal]);

  const daySummary = React.useMemo(() => {
    if (hydrating) {
      return "Planner day will load after setup.";
    }
    if (totalCount > 0) {
      return `${doneCount}/${totalCount}`;
    }
    return "No tasks scheduled today";
  }, [doneCount, hydrating, totalCount]);

  const monthSummary = React.useMemo(() => {
    if (hydrating) {
      return "Monthly overview loading…";
    }
    if (weekTotal > 0) {
      return `${weekTotal} scheduled this week`;
    }
    return "Schedule your month in the planner";
  }, [hydrating, weekTotal]);

  const calendarDays: PlannerOverviewCalendarDay[] = React.useMemo(() => {
    return per.map((day) => {
      const dayState = day as PlannerCalendarDayState;
      const dayDate = fromISODate(day.iso);
      const weekday = dayDate ? calendarWeekdayFormatter.format(dayDate) : day.iso;
      const dayNumber = dayDate ? calendarDayFormatter.format(dayDate) : "--";
      return {
        iso: day.iso,
        weekday,
        dayNumber,
        done: day.done,
        total: day.total,
        disabled: hydrating || Boolean(dayState.disabled),
        loading: hydrating || Boolean(dayState.loading),
        selected: day.iso === iso,
        today: !hydrating && isToday(day.iso),
      } satisfies PlannerOverviewCalendarDay;
    });
  }, [hydrating, isToday, iso, per]);

  const activityPoints = React.useMemo(
    () =>
      calendarDays.map((day) => ({
        iso: day.iso,
        label: day.weekday,
        completed: day.done,
        total: day.total,
      })),
    [calendarDays],
  );

  const activityHasData = React.useMemo(
    () => activityPoints.some((point) => point.total > 0),
    [activityPoints],
  );

  const handleSelectDay = React.useCallback(
    (nextIso: string) => {
      if (hydrating) return;
      setIso(nextIso);
    },
    [hydrating, setIso],
  );

  const focusCard: PlannerOverviewFocusProps = React.useMemo(
    () => ({
      label: "Focus day",
      title: focusLabel,
      doneCount: hydrating ? 0 : doneCount,
      totalCount: hydrating ? 0 : totalCount,
      tasks: focusTasks,
      remainingTasks: hydrating ? 0 : remainingTasks,
      onToggleTask: handleToggleTask,
    }),
    [
      doneCount,
      focusLabel,
      focusTasks,
      handleToggleTask,
      hydrating,
      remainingTasks,
      totalCount,
    ],
  );

  const goalsCard: PlannerOverviewGoalsProps = React.useMemo(
    () => ({
      label: "Goals overview",
      title: "Momentum",
      completed: goalStats.completed,
      total: goalStats.total,
      percentage: goalPct,
      active: goalStats.active,
      emptyMessage:
        "No goals tracked yet. Capture one in the goals workspace to see it here.",
      allCompleteMessage: "All active goals are complete. Great work!",
    }),
    [goalPct, goalStats.active, goalStats.completed, goalStats.total],
  );

  const calendarCard = React.useMemo(() => {
    if (range === "day") {
      return {
        label: "Focus day",
        title: focusLabel,
        summary: daySummary,
        doneCount: hydrating ? 0 : doneCount,
        totalCount: hydrating ? 0 : totalCount,
        hasPlannedTasks: !hydrating && totalCount > 0,
        days: calendarDays,
        onSelectDay: handleSelectDay,
      };
    }

    if (range === "month") {
      return {
        label: "Monthly outlook",
        title: focusMonthLabel,
        summary: monthSummary,
        doneCount: hydrating ? 0 : weekDone,
        totalCount: hydrating ? 0 : weekTotal,
        hasPlannedTasks: !hydrating && weekTotal > 0,
        days: calendarDays,
        onSelectDay: handleSelectDay,
      };
    }

    return {
      label: "Weekly calendar",
      title: weekLabel,
      summary: weekSummary,
      doneCount: hydrating ? 0 : weekDone,
      totalCount: hydrating ? 0 : weekTotal,
      hasPlannedTasks: !hydrating && weekTotal > 0,
      days: calendarDays,
      onSelectDay: handleSelectDay,
    };
  }, [
    calendarDays,
    daySummary,
    doneCount,
    focusLabel,
    focusMonthLabel,
    handleSelectDay,
    hydrating,
    monthSummary,
    range,
    totalCount,
    weekDone,
    weekLabel,
    weekSummary,
    weekTotal,
  ]);

  const summary = React.useMemo(() => {
    if (range === "day") {
      return {
        label: "Today",
        title: "Immediate focus",
        items: summaryItems.map((item) =>
          item.key === "focus"
            ? { ...item, label: "Today's focus", value: focusLabel }
            : item,
        ),
      };
    }

    if (range === "month") {
      return {
        label: "This month",
        title: "Momentum outlook",
        items: summaryItems.map((item) =>
          item.key === "focus"
            ? { ...item, label: "Monthly focus", value: focusMonthLabel }
            : item,
        ),
      };
    }

    return {
      label: "This week",
      title: "Quick summary",
      items: summaryItems.map((item) =>
        item.key === "focus" ? { ...item, label: "Weekly focus", value: weekLabel } : item,
      ),
    };
  }, [focusLabel, focusMonthLabel, range, summaryItems, weekLabel]);

  const activity = React.useMemo(
    () => ({
      loading: hydrating,
      hasData: !hydrating && activityHasData,
      totalCompleted: hydrating ? 0 : weekDone,
      totalScheduled: hydrating ? 0 : weekTotal,
      points: activityPoints,
    }),
    [activityHasData, activityPoints, hydrating, weekDone, weekTotal],
  );

  const ranges = React.useMemo(
    () =>
      [
        { key: "day", label: "Day" },
        { key: "week", label: "Week" },
        { key: "month", label: "Month" },
      ] as const,
    [],
  );

  const handleSelectRange = React.useCallback(
    (nextRange: PlannerOverviewRangeKey) => {
      setRange(nextRange);
    },
    [],
  );

  return React.useMemo(
    () => ({
      hydrating,
      hydrated,
      summary,
      focus: focusCard,
      goals: goalsCard,
      calendar: calendarCard,
      activity,
      range,
      ranges,
      onSelectRange: handleSelectRange,
    }),
    [
      activity,
      calendarCard,
      focusCard,
      goalsCard,
      handleSelectRange,
      hydrating,
      hydrated,
      range,
      ranges,
      summary,
    ],
  );
}
