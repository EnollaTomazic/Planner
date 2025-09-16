"use client";

import * as React from "react";
import { type ISODate } from "./plannerStore";
import { usePlannerStore } from "./usePlannerStore";

export function useWeekData(days: ISODate[]) {
  const { days: map } = usePlannerStore();

  return React.useMemo(() => {
    let weekDone = 0;
    let weekTotal = 0;
    const per = days.map((iso) => {
      const rec = map[iso];
      const { done, total } = (rec ? [...rec.projects, ...rec.tasks] : []).reduce(
        (counts, item) => {
          counts.total += 1;
          if (item.done) counts.done += 1;
          return counts;
        },
        { done: 0, total: 0 },
      );
      weekDone += done;
      weekTotal += total;
      return { iso, done, total };
    });
    return { per, weekDone, weekTotal };
  }, [days, map]);
}
