"use client";

import * as React from "react";
import { addDays, toISODate, weekRangeFromISO } from "@/lib/date";
import { useFocus } from "./plannerContext";
import { FOCUS_PLACEHOLDER } from "./plannerSerialization";
import type { ISODate } from "./plannerTypes";

/**
 * Exposes the currently focused ISO date and helper to update it.
 * @returns Current focus ISO date, setter, and today's ISO string.
 */
export function useFocusDate() {
  const { focus, setFocus, today } = useFocus();
  const activeIso = focus === FOCUS_PLACEHOLDER ? today : focus;
  return { iso: activeIso, setIso: setFocus, today } as const;
}

/**
 * Derives week information for a given ISO date.
 * @param iso - ISO date to compute the week range for.
 * @returns Week start/end dates, list of day ISO strings, and today checker.
 */
export function useWeek(iso: ISODate) {
  const { today } = useFocus();
  return React.useMemo(() => {
    const { start, end } = weekRangeFromISO(iso);
    const days: ISODate[] = [];
    for (let i = 0; i < 7; i++) days.push(toISODate(addDays(start, i)));
    const isToday = (d: ISODate) => d === today;
    return { start, end, days, isToday } as const;
  }, [iso, today]);
}
