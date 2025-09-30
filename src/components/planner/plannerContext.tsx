"use client";

import "./style.css";
import * as React from "react";
import { uid, usePersistentState } from "@/lib/db";
import {
  RemindersProvider,
  RemindersContext,
  useReminders,
  type RemindersContextValue,
} from "../goals/reminders/useReminders";
import { addDays, toISODate, weekRangeFromISO } from "@/lib/date";
import type { Goal } from "@/lib/types";
import { ACTIVE_CAP, decodeGoals, type AddGoalInput } from "../goals/goalsPersistence";
import {
  decodePlannerDays,
  decodePlannerFocus,
  pruneOldDays,
  sanitizeDayRecord,
  todayISO,
  FOCUS_PLACEHOLDER,
  HYDRATION_TODAY,
  ensureDay,
} from "./plannerSerialization";
import type {
  DayRecord,
  DayTask,
  ISODate,
  Selection,
} from "./plannerTypes";
import {
  setFocus as applyFocusToDay,
  setNotes as applyNotesToDay,
} from "./plannerCrud";

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

type PlannerWeek = {
  start: Date;
  end: Date;
  days: ISODate[];
  isToday: (iso: ISODate) => boolean;
};

type PlannerGoalsState = {
  goals: Goal[];
  err: string | null;
  setErr: React.Dispatch<React.SetStateAction<string | null>>;
  lastDeleted: Goal | null;
  addGoal: (input: AddGoalInput) => boolean;
  toggleDone: (id: string) => void;
  removeGoal: (id: string) => void;
  updateGoal: (
    id: string,
    updates: Pick<Goal, "title" | "metric" | "notes">
  ) => void;
  undoRemove: VoidFunction;
  clearGoals: VoidFunction;
};

type PlannerState = {
  iso: ISODate;
  today: ISODate;
  setIso: React.Dispatch<React.SetStateAction<ISODate>>;
  viewMode: PlannerViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<PlannerViewMode>>;
  week: PlannerWeek;
  goals: PlannerGoalsState;
  reminders: RemindersContextValue;
  getFocus: (iso: ISODate) => string;
  updateFocus: (iso: ISODate, value: string) => void;
  getNote: (iso: ISODate) => string;
  updateNote: (iso: ISODate, value: string) => void;
};

export type PlannerViewMode = "day" | "week" | "month" | "agenda";

const DaysContext = React.createContext<DaysState | null>(null);
const FocusContext = React.createContext<FocusState | null>(null);
const SelectionContext = React.createContext<SelectionState | null>(null);
const PlannerStateContext = React.createContext<PlannerState | null>(null);
const PlannerRemindersContext = React.createContext<
  RemindersContextValue | null
>(null);

function PlannerProviderInner({
  children,
}: {
  children: React.ReactNode;
}) {
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
  const [viewMode, setViewMode] = usePersistentState<PlannerViewMode>(
    "planner:view-mode",
    "day",
  );
  const [today, setToday] = React.useState<ISODate>(FOCUS_PLACEHOLDER);
  const [goalList, setGoalList] = usePersistentState<Goal[]>("goals.v2", [], {
    decode: decodeGoals,
  });
  const [goalErr, setGoalErr] = React.useState<string | null>(null);
  const [lastDeletedGoal, setLastDeletedGoal] = React.useState<Goal | null>(
    null,
  );
  const goalUndoTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const reminders = useReminders();

  const days = rawDays;
  const [tasksById, setTasksById] = React.useState<TaskIdMap>(() => {
    const initial: TaskIdMap = {};
    for (const [iso, record] of Object.entries(rawDays)) {
      initial[iso as ISODate] = record.tasksById ?? {};
    }
    return initial;
  });
  const tasksByIdRef = React.useRef<TaskIdMap>(tasksById);

  React.useEffect(() => {
    tasksByIdRef.current = tasksById;
  }, [tasksById]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const localToday = todayISO();
    setToday((prev) => (prev === localToday ? prev : localToday));
    setFocus((prev) => {
      if (prev === FOCUS_PLACEHOLDER || prev === HYDRATION_TODAY) {
        return localToday;
      }
      return prev;
    });
  }, [setFocus]);

  React.useEffect(() => {
    return () => {
      if (goalUndoTimer.current) {
        clearTimeout(goalUndoTimer.current);
        goalUndoTimer.current = null;
      }
    };
  }, []);

  const addGoal = React.useCallback(
    ({ title, metric, notes, pillar }: AddGoalInput) => {
      setGoalErr(null);
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        setGoalErr("Title required.");
        return false;
      }
      const currentActive = goalList.filter((goal) => !goal.done).length;
      if (currentActive >= ACTIVE_CAP) {
        setGoalErr("Cap reached. Mark something done first.");
        return false;
      }
      const nextGoal: Goal = {
        id: uid(),
        title: trimmedTitle,
        ...(pillar ? { pillar } : {}),
        metric: metric.trim() || undefined,
        notes: notes.trim() || undefined,
        done: false,
        createdAt: Date.now(),
      };
      setGoalList((prev) => [nextGoal, ...prev]);
      return true;
    },
    [goalList, setGoalErr, setGoalList],
  );

  const toggleGoalDone = React.useCallback(
    (id: string) => {
      setGoalErr(null);
      setGoalList((prev) => {
        let activeCount = 0;
        let found = false;
        let targetWasDone = false;

        const next = prev.map((goal) => {
          if (goal.id === id) {
            found = true;
            targetWasDone = goal.done;
            const nextDone = !goal.done;
            if (!nextDone) {
              activeCount += 1;
            }
            return { ...goal, done: nextDone };
          }

          if (!goal.done) {
            activeCount += 1;
          }
          return goal;
        });

        if (!found) {
          return prev;
        }

        if (targetWasDone && activeCount > ACTIVE_CAP) {
          setGoalErr("Cap is 3 active. Complete or delete another first.");
          return prev;
        }

        return next;
      });
    },
    [setGoalErr, setGoalList],
  );

  const removeGoal = React.useCallback(
    (id: string) => {
      setGoalErr(null);
      setGoalList((prev) => {
        let removed: Goal | null = null;
        const next = prev.filter((entry) => {
          if (entry.id === id) {
            removed = entry;
            return false;
          }
          return true;
        });
        if (!removed) {
          return prev;
        }
        setLastDeletedGoal(removed);
        if (goalUndoTimer.current) {
          clearTimeout(goalUndoTimer.current);
          goalUndoTimer.current = null;
        }
        goalUndoTimer.current = setTimeout(() => {
          setLastDeletedGoal(null);
          goalUndoTimer.current = null;
        }, 5000);
        return next;
      });
    },
    [setGoalErr, setGoalList],
  );

  const clearGoals = React.useCallback(() => {
    setGoalErr(null);
    setGoalList(() => []);
    setLastDeletedGoal(null);
    if (goalUndoTimer.current) {
      clearTimeout(goalUndoTimer.current);
      goalUndoTimer.current = null;
    }
  }, [setGoalList]);

  const updateGoal = React.useCallback(
    (id: string, updates: Pick<Goal, "title" | "metric" | "notes">) => {
      setGoalList((prev) =>
        prev.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal)),
      );
    },
    [setGoalList],
  );

  const undoRemoveGoal = React.useCallback(() => {
    if (!lastDeletedGoal) return;
    setGoalList((prev) => [lastDeletedGoal, ...prev]);
    setLastDeletedGoal(null);
    if (goalUndoTimer.current) {
      clearTimeout(goalUndoTimer.current);
      goalUndoTimer.current = null;
    }
  }, [lastDeletedGoal, setGoalList]);

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
            prevFocus === HYDRATION_TODAY ||
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

  React.useEffect(() => {
    if (!Object.is(rawDays, days)) {
      setRawDays(days);
    }
  }, [rawDays, days, setRawDays]);

  const setDays = React.useCallback<DaysDispatch>(
    (action) => {
      const currentTasksById = tasksByIdRef.current;
      let pendingUpdates:
        | Array<[ISODate, Record<string, DayTask>]>
        | undefined;
      let pendingRemovals: ISODate[] | undefined;

      setRawDays((prev) => {
        pendingUpdates = undefined;
        pendingRemovals = undefined;

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

        const updateCandidates = new Set<ISODate>(targetIsos);
        for (const iso of Object.keys(result) as ISODate[]) {
          if (Object.prototype.hasOwnProperty.call(currentTasksById, iso)) {
            continue;
          }
          updateCandidates.add(iso);
        }

        const nextUpdates: Array<[ISODate, Record<string, DayTask>]> = [];
        for (const iso of updateCandidates) {
          const record = result[iso];
          if (!record) continue;
          const nextTasks = record.tasksById ?? {};
          if (currentTasksById[iso] === nextTasks) continue;
          nextUpdates.push([iso, nextTasks]);
        }

        const nextRemovals: ISODate[] = [];
        for (const iso of Object.keys(currentTasksById) as ISODate[]) {
          if (Object.prototype.hasOwnProperty.call(result, iso)) continue;
          nextRemovals.push(iso);
        }

        pendingUpdates = nextUpdates.length ? nextUpdates : undefined;
        pendingRemovals = nextRemovals.length ? nextRemovals : undefined;

        return result;
      });

      if (
        (pendingUpdates?.length ?? 0) === 0 &&
        (pendingRemovals?.length ?? 0) === 0
      ) {
        return;
      }

      setTasksById((prevMap) => {
        let nextMap = prevMap;
        let mutatedMap = false;

        if (pendingRemovals) {
          for (const iso of pendingRemovals) {
            if (!Object.prototype.hasOwnProperty.call(nextMap, iso)) {
              continue;
            }
            if (!mutatedMap) {
              mutatedMap = true;
              nextMap = { ...nextMap };
            }
            delete nextMap[iso];
          }
        }

        if (pendingUpdates) {
          for (const [iso, map] of pendingUpdates) {
            if (nextMap[iso] === map) continue;
            if (!mutatedMap) {
              mutatedMap = true;
              nextMap = { ...nextMap };
            }
            nextMap[iso] = map;
          }
        }

        if (mutatedMap) {
          tasksByIdRef.current = nextMap;
          return nextMap;
        }

        return prevMap;
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

  const iso = focus === FOCUS_PLACEHOLDER ? today : focus;
  const normalizedIso =
    iso === FOCUS_PLACEHOLDER ? HYDRATION_TODAY : iso;
  const isToday = React.useCallback(
    (candidate: ISODate) =>
      today !== FOCUS_PLACEHOLDER && candidate === today,
    [today],
  );
  const week = React.useMemo(() => {
    const { start, end } = weekRangeFromISO(normalizedIso);
    const weekDays: ISODate[] = [];
    for (let i = 0; i < 7; i += 1) {
      weekDays.push(toISODate(addDays(start, i)));
    }
    return { start, end, days: weekDays, isToday } as const;
  }, [normalizedIso, isToday]);

  const getDayFocus = React.useCallback(
    (targetIso: ISODate) => {
      const record = days[targetIso] ?? ensureDay(days, targetIso);
      return record.focus ?? "";
    },
    [days],
  );

  const updateDayFocus = React.useCallback(
    (targetIso: ISODate, value: string) => {
      setDays((prev) => {
        const base = ensureDay(prev, targetIso);
        if ((base.focus ?? "") === value) {
          return prev;
        }
        const next = applyFocusToDay(base, value);
        return { ...prev, [targetIso]: next };
      });
    },
    [setDays],
  );

  const getNote = React.useCallback(
    (targetIso: ISODate) => {
      const record = days[targetIso] ?? ensureDay(days, targetIso);
      return record.notes ?? "";
    },
    [days],
  );

  const updateNote = React.useCallback(
    (targetIso: ISODate, value: string) => {
      setDays((prev) => {
        const base = ensureDay(prev, targetIso);
        if ((base.notes ?? "") === value) {
          return prev;
        }
        const next = applyNotesToDay(base, value);
        return { ...prev, [targetIso]: next };
      });
    },
    [setDays],
  );

  const goalsValue = React.useMemo(
    () => ({
      goals: goalList,
      err: goalErr,
      setErr: setGoalErr,
      lastDeleted: lastDeletedGoal,
      addGoal,
      toggleDone: toggleGoalDone,
      removeGoal,
      updateGoal,
      undoRemove: undoRemoveGoal,
      clearGoals,
    }),
    [
      goalList,
      goalErr,
      setGoalErr,
      lastDeletedGoal,
      addGoal,
      toggleGoalDone,
      removeGoal,
      updateGoal,
      undoRemoveGoal,
      clearGoals,
    ],
  );

  const plannerValue = React.useMemo(
    () => ({
      iso,
      today,
      setIso: setFocus,
      viewMode,
      setViewMode,
      week,
      goals: goalsValue,
      reminders,
      getFocus: getDayFocus,
      updateFocus: updateDayFocus,
      getNote,
      updateNote,
    }),
    [
      iso,
      today,
      setFocus,
      viewMode,
      setViewMode,
      week,
      goalsValue,
      reminders,
      getDayFocus,
      updateDayFocus,
      getNote,
      updateNote,
    ],
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
        React.createElement(
          PlannerRemindersContext.Provider,
          { value: reminders },
          React.createElement(
            PlannerStateContext.Provider,
            { value: plannerValue },
            children as React.ReactNode,
          ),
        ),
      ),
    ),
  );
}

export function PlannerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const reminders = React.useContext(RemindersContext);
  if (reminders) {
    return <PlannerProviderInner>{children}</PlannerProviderInner>;
  }
  return (
    <RemindersProvider>
      <PlannerProviderInner>{children}</PlannerProviderInner>
    </RemindersProvider>
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

export function usePlanner(): PlannerState {
  const ctx = React.useContext(PlannerStateContext);
  if (!ctx)
    throw new Error(
      "PlannerProvider missing. Wrap your planner page with <PlannerProvider>.",
    );
  return ctx;
}

export function usePlannerReminders(): RemindersContextValue {
  const ctx = React.useContext(PlannerRemindersContext);
  if (!ctx)
    throw new Error(
      "PlannerProvider missing. Wrap your planner page with <PlannerProvider>.",
    );
  return ctx;
}
