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
      const done = rec?.doneCount ?? 0;
      const total = rec?.totalCount ?? 0;
      weekDone += done;
      weekTotal += total;
      return { iso, done, total };
    });
    return { per, weekDone, weekTotal };
  }, [days, map]);
}
