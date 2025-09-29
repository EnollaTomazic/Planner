"use client";

import * as React from "react";
import type { ISODate, DayRecord } from "../plannerTypes";
import { usePlannerStore } from "../usePlannerStore";

export function usePreloadedDays(days: readonly ISODate[]): DayRecord[] {
  const { getDay } = usePlannerStore();
  return React.useMemo(
    () => days.map((iso) => getDay(iso)),
    [days, getDay],
  );
}

