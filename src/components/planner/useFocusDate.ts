"use client";

import * as React from "react";
import { addDays, toISODate, weekRangeFromISO } from "@/lib/date";
import { usePlanner } from "./plannerContext";
import type { ISODate } from "./plannerTypes";

/**
 * Exposes the currently focused ISO date and helper to update it.
 * @returns Current focus ISO date, setter, and today's ISO string.
 */
export function useFocusDate() {
  const { iso, setIso, today } = usePlanner();
  return { iso, setIso, today } as const;
}

/**
 * Derives week information for a given ISO date.
 * @param iso - ISO date to compute the week range for.
 * @returns Week start/end dates, list of day ISO strings, and today checker.
 */
export function useWeek(iso?: ISODate) {
  const { week, iso: currentIso, today } = usePlanner();
  return React.useMemo(() => {
    const targetIso = iso ?? currentIso;
    if (targetIso === currentIso) {
      return week;
    }
    const { start, end } = weekRangeFromISO(targetIso);
    const days: ISODate[] = [];
    for (let i = 0; i < 7; i += 1) {
      days.push(toISODate(addDays(start, i)));
    }
    const isToday = (d: ISODate) => d === today;
    return { start, end, days, isToday } as const;
  }, [iso, currentIso, today, week]);
}
