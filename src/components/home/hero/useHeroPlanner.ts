"use client";

import * as React from "react";
import { fromISODate } from "@/lib/date";
import { LOCALE } from "@/lib/utils";
import type { DayTask, Project } from "@/components/planner/plannerStore";

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

export function useFocusDayLabel(iso: string): string {
  return React.useMemo(() => {
    const date = fromISODate(iso);
    if (!date) return iso;
    return focusDayFormatter.format(date);
  }, [iso]);
}

export function useProjectNameMap(projects: readonly Project[]) {
  return React.useMemo(() => {
    const map = new Map<string, string>();
    for (const project of projects) {
      map.set(project.id, project.name);
    }
    return map as ReadonlyMap<string, string>;
  }, [projects]);
}

export function useTaskPreview(tasks: readonly DayTask[], limit: number) {
  return React.useMemo(() => {
    const preview = tasks.slice(0, Math.max(0, limit));
    const remaining = Math.max(tasks.length - preview.length, 0);
    return { preview, remaining } as const;
  }, [tasks, limit]);
}

export function formatCalendarDayParts(iso: string) {
  const date = fromISODate(iso);
  if (!date) {
    return { weekday: iso, dayNumber: "--" } as const;
  }

  return {
    weekday: calendarWeekdayFormatter.format(date),
    dayNumber: calendarDayFormatter.format(date),
  } as const;
}
