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

type PlannerCalendarDayState = ReturnType<typeof useWeekData>["per"][number] & {
  disabled?: boolean;
  loading?: boolean;
};

export function useHomePlannerOverview(): PlannerOverviewProps {
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
        label: "Next focus",
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
    () => formatWeekRangeLabel(start, end),
    [start, end],
  );

  const weekSummary = React.useMemo(() => {
    if (weekTotal > 0) {
      return `${weekDone}/${weekTotal}`;
    }
    return "No tasks scheduled this week";
  }, [weekDone, weekTotal]);

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
        disabled: Boolean(dayState.disabled),
        loading: Boolean(dayState.loading),
        selected: day.iso === iso,
        today: isToday(day.iso),
      } satisfies PlannerOverviewCalendarDay;
    });
  }, [isToday, iso, per]);

  const handleSelectDay = React.useCallback(
    (nextIso: string) => {
      setIso(nextIso);
    },
    [setIso],
  );

  const focusCard: PlannerOverviewFocusProps = React.useMemo(
    () => ({
      label: "Focus day",
      title: focusLabel,
      doneCount,
      totalCount,
      tasks: focusTasks,
      remainingTasks,
      onToggleTask: handleToggleTask,
    }),
    [doneCount, focusLabel, focusTasks, handleToggleTask, remainingTasks, totalCount],
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

  const calendarCard = React.useMemo(
    () => ({
      label: "Weekly calendar",
      title: weekLabel,
      summary: weekSummary,
      doneCount: weekDone,
      totalCount: weekTotal,
      hasPlannedTasks: weekTotal > 0,
      days: calendarDays,
      onSelectDay: handleSelectDay,
    }),
    [calendarDays, handleSelectDay, weekDone, weekLabel, weekSummary, weekTotal],
  );

  return {
    summary: {
      label: "Highlights",
      title: "Quick summary",
      items: summaryItems,
    },
    focus: focusCard,
    goals: goalsCard,
    calendar: calendarCard,
  };
}
