"use client";

import * as React from "react";
import { ensureDay } from "./plannerSerialization";
import type { ISODate } from "./plannerTypes";
import { usePlannerStore } from "./usePlannerStore";

export function useWeekData(days: ISODate[]) {
  const { days: map } = usePlannerStore();

  return React.useMemo(() => {
    let weekDone = 0;
    let weekTotal = 0;
    const per = days.map((iso) => {
      const record = ensureDay(map, iso);
      const { doneCount, totalCount } = record;
      weekDone += doneCount;
      weekTotal += totalCount;
      return { iso, done: doneCount, total: totalCount };
    });
    return { per, weekDone, weekTotal };
  }, [days, map]);
}
