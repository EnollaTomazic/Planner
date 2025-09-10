"use client";

import * as React from "react";
import { ensureDay, type ISODate } from "./plannerStore";
import { usePlannerStore } from "./usePlannerStore";

export function useWeekData(days: ISODate[]) {
  const { days: map } = usePlannerStore();

  return React.useMemo(() => {
    const per = days.map((iso) => {
      const rec = ensureDay(map, iso);
      const pDone = rec.projects.filter((p) => p?.done).length;
      const tDone = rec.tasks.filter((t) => t?.done).length;
      const total = rec.projects.length + rec.tasks.length;
      return { iso, done: pDone + tDone, total };
    });
    const weekDone = per.reduce((a, b) => a + b.done, 0);
    const weekTotal = per.reduce((a, b) => a + b.total, 0);
    return { per, weekDone, weekTotal };
  }, [days, map]);
}
