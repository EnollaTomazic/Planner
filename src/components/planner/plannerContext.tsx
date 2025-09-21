"use client";

import "./style.css";
import * as React from "react";
import { usePersistentState } from "@/lib/db";
import {
  decodePlannerDays,
  decodePlannerFocus,
  pruneOldDays,
  sanitizeDayRecord,
  todayISO,
  FOCUS_PLACEHOLDER,
} from "./plannerSerialization";
import type {
  DayRecord,
  DayTask,
  ISODate,
  Selection,
} from "./plannerTypes";

type DaysUpdateMetadata = {
  days: Record<ISODate, DayRecord>;
  changed?: Iterable<ISODate>;
};

type DaysUpdateTuple = readonly [
  Record<ISODate, DayRecord>,
  Iterable<ISODate>,
];

type DaysUpdateResult =
  | Record<ISODate, DayRecord>
  | DaysUpdateMetadata
  | DaysUpdateTuple;

type DaysSetStateAction =
  | DaysUpdateResult
  | ((current: Record<ISODate, DayRecord>) => DaysUpdateResult);

type DaysDispatch = (action: DaysSetStateAction) => void;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDaysUpdateMetadata(value: DaysUpdateResult): value is DaysUpdateMetadata {
  if (!isPlainObject(value)) return false;
  if (!Object.prototype.hasOwnProperty.call(value, "days")) return false;
  const candidate = (value as { days?: unknown }).days;
  return isPlainObject(candidate);
}

function normalizeChangedList(
  changed?: Iterable<ISODate>,
): ISODate[] | undefined {
  if (!changed) return undefined;
  if (typeof changed === "string") {
    return [changed as ISODate];
  }
  const seen = new Set<ISODate>();
  for (const iso of changed) {
    if (typeof iso === "string") {
      seen.add(iso as ISODate);
    }
  }
  return seen.size ? Array.from(seen) : undefined;
}

function extractDaysUpdate(update: DaysUpdateResult) {
  if (Array.isArray(update)) {
    const [days, changed] = update;
    return { days, changed: normalizeChangedList(changed) };
  }
  if (isDaysUpdateMetadata(update)) {
    return {
      days: update.days,
      changed: normalizeChangedList(update.changed),
    };
  }
  return { days: update as Record<ISODate, DayRecord>, changed: undefined };
}

function cleanupSelections(
  selected: Record<ISODate, Selection>,
  days: Record<ISODate, DayRecord>,
) {
  let result = selected;
  let mutated = false;

  for (const iso of Object.keys(selected)) {
    const selection = selected[iso];
    const day = days[iso];
    const projectId = selection?.projectId;
    const taskId = selection?.taskId;

    if (!day || (!projectId && !taskId)) {
      if (!mutated) {
        mutated = true;
        result = { ...result };
      }
      delete result[iso];
      continue;
    }

    if (
      projectId &&
      !day.projects.some((project) => project.id === projectId)
    ) {
      if (!mutated) {
        mutated = true;
        result = { ...result };
      }
      delete result[iso];
      continue;
    }

    if (
      taskId &&
      !(day.tasksById?.[taskId] ?? day.tasks.find((task) => task.id === taskId))
    ) {
      if (!mutated) {
        mutated = true;
        result = { ...result };
      }
      delete result[iso];
    }
  }

  return mutated ? result : selected;
}

type TaskIdMap = Record<ISODate, Record<string, DayTask>>;

type DaysState = {
  days: Record<ISODate, DayRecord>;
  setDays: DaysDispatch;
  tasksById: TaskIdMap;
};

type FocusState = {
  focus: ISODate;
  setFocus: React.Dispatch<React.SetStateAction<ISODate>>;
  today: ISODate;
};

type SelectionState = {
  selected: Record<ISODate, Selection>;
  setSelected: React.Dispatch<React.SetStateAction<Record<ISODate, Selection>>>;
};

const DaysContext = React.createContext<DaysState | null>(null);
const FocusContext = React.createContext<FocusState | null>(null);
const SelectionContext = React.createContext<SelectionState | null>(null);

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const [rawDays, setRawDays] = usePersistentState<Record<ISODate, DayRecord>>(
    "planner:days",
    {},
    { decode: decodePlannerDays },
  );
  const [focus, setFocus] = usePersistentState<ISODate>(
    "planner:focus",
    FOCUS_PLACEHOLDER,
    { decode: decodePlannerFocus },
  );
  const [selectedState, setSelectedState] = usePersistentState<
    Record<ISODate, Selection>
  >("planner:selected", {});
  const [today, setToday] = React.useState(() => todayISO());

  const days = rawDays;

  React.useEffect(() => {
    if (focus === FOCUS_PLACEHOLDER) {
      setFocus((prev) => (prev === FOCUS_PLACEHOLDER ? todayISO() : prev));
    }
  }, [focus, setFocus]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    const updateForNewDay = () => {
      if (cancelled) return;
      const nextToday = todayISO();

      setToday((prevToday) => {
        setFocus((prevFocus) => {
          if (
            prevFocus === FOCUS_PLACEHOLDER ||
            prevFocus === prevToday
          ) {
            return nextToday;
          }
          return prevFocus;
        });

        return nextToday;
      });
    };

    const scheduleNextTick = () => {
      const now = new Date();
      const next = new Date(now);
      next.setDate(now.getDate() + 1);
      next.setHours(0, 0, 0, 0);
      const delay = Math.max(0, next.getTime() - now.getTime());
      return setTimeout(() => {
        updateForNewDay();
        timeoutId = scheduleNextTick();
      }, delay);
    };

    let timeoutId: ReturnType<typeof setTimeout> = scheduleNextTick();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [setFocus, setToday]);

  const selected = React.useMemo(
    () => cleanupSelections(selectedState, days),
    [selectedState, days],
  );

  React.useEffect(() => {
    if (!Object.is(selected, selectedState)) {
      setSelectedState(selected);
    }
  }, [selected, selectedState, setSelectedState]);

  const tasksById = React.useMemo<TaskIdMap>(() => {
    const map: TaskIdMap = {};
    for (const [iso, record] of Object.entries(days)) {
      map[iso] = record.tasksById ?? {};
    }
    return map;
  }, [days]);

  React.useEffect(() => {
    if (!Object.is(rawDays, days)) {
      setRawDays(days);
    }
  }, [rawDays, days, setRawDays]);

  const setDays = React.useCallback<DaysDispatch>(
    (action) => {
      setRawDays((prev) => {
        const resolved =
          typeof action === "function"
            ? (action as (
                current: Record<ISODate, DayRecord>,
              ) => DaysUpdateResult)(prev)
            : action;

        const { days: next, changed } = extractDaysUpdate(resolved);

        let result = pruneOldDays(next);
        let mutated = !Object.is(result, next);

        const targetIsos =
          changed === undefined
            ? (Object.keys(result) as ISODate[])
            : changed.filter((iso) =>
                Object.prototype.hasOwnProperty.call(result, iso),
              );

        for (const iso of targetIsos) {
          if (prev[iso] === result[iso]) continue;
          const ensured = sanitizeDayRecord(result, iso);
          if (!ensured) continue;
          if (!mutated) {
            mutated = true;
            result = { ...result };
          }
          result[iso] = ensured;
        }

        if (!mutated && Object.is(prev, result)) {
          return prev;
        }

        return result;
      });
    },
    [setRawDays],
  );

  const daysValue = React.useMemo(
    () => ({ days, setDays, tasksById }),
    [days, setDays, tasksById],
  );
  const focusValue = React.useMemo(
    () => ({ focus, setFocus, today }),
    [focus, setFocus, today],
  );
  const setSelected = React.useCallback<
    React.Dispatch<React.SetStateAction<Record<ISODate, Selection>>>
  >(
    (update) => {
      setSelectedState((prev) => {
        const next =
          typeof update === "function"
            ? (
                update as (
                  current: Record<ISODate, Selection>,
                ) => Record<ISODate, Selection>
              )(prev)
            : update;

        if (Object.is(prev, next)) {
          return prev;
        }
        return next;
      });
    },
    [setSelectedState],
  );
  const selectionValue = React.useMemo(
    () => ({ selected, setSelected }),
    [selected, setSelected],
  );

  return React.createElement(
    DaysContext.Provider,
    { value: daysValue },
    React.createElement(
      FocusContext.Provider,
      { value: focusValue },
      React.createElement(
        SelectionContext.Provider,
        { value: selectionValue },
        children as React.ReactNode,
      ),
    ),
  );
}

export function useDays(): DaysState {
  const ctx = React.useContext(DaysContext);
  if (!ctx)
    throw new Error(
      "PlannerProvider missing. Wrap your planner page with <PlannerProvider>.",
    );
  return ctx;
}

export function useFocus(): FocusState {
  const ctx = React.useContext(FocusContext);
  if (!ctx)
    throw new Error(
      "PlannerProvider missing. Wrap your planner page with <PlannerProvider>.",
    );
  return ctx;
}

export function useSelection(): SelectionState {
  const ctx = React.useContext(SelectionContext);
  if (!ctx)
    throw new Error(
      "PlannerProvider missing. Wrap your planner page with <PlannerProvider>.",
    );
  return ctx;
}
