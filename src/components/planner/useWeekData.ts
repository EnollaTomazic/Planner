"use client";

import * as React from "react";
import { ensureDay, type ISODate } from "./plannerStore";
import { usePlannerStore } from "./usePlannerStore";

export function useWeekData(days: ISODate[]) {
  const { days: map } = usePlannerStore();

  return React.useMemo(() => {
    let weekDone = 0;
    let weekTotal = 0;
    const per = days.map((iso) => {
      const rec = ensureDay(map, iso);
      let done = 0;
      let total = 0;
      for (const p of rec.projects) {
        total++;
        if (p?.done) done++;
      }
      for (const t of rec.tasks) {
        total++;
        if (t?.done) done++;
      }
      weekDone += done;
      weekTotal += total;
      return { iso, done, total };
    });
    return { per, weekDone, weekTotal };
  }, [days, map]);
}
