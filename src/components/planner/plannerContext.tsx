"use client";

import "./style.css";
import * as React from "react";
import {
  createStorageKey,
  readLocal,
  removeLocal,
  scheduleWrite,
  usePersistentState,
} from "@/lib/db";
import { parseJSON } from "@/lib/local-bootstrap";
import {
  decodePlannerDay,
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

const DAYS_STORAGE_KEY = "planner:days";
const DAY_STORAGE_PREFIX = `${DAYS_STORAGE_KEY}:`;

type PendingPersistence = {
  writes: Map<ISODate, DayRecord>;
  removals: Set<ISODate>;
};

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
  const [rawDays, setRawDays] = React.useState<Record<ISODate, DayRecord>>({});
  const pendingPersistenceRef = React.useRef<PendingPersistence | null>(null);
  const hydratedRef = React.useRef(false);

  const queuePersistence = React.useCallback(
    (writes: Map<ISODate, DayRecord> | null, removals: readonly ISODate[]) => {
      if ((!writes || writes.size === 0) && removals.length === 0) return;
      const existing = pendingPersistenceRef.current;
      if (existing) {
        if (writes) {
          for (const [iso, day] of writes) {
            existing.writes.set(iso, day);
            existing.removals.delete(iso);
          }
        }
        for (const iso of removals) {
          existing.writes.delete(iso);
          existing.removals.add(iso);
        }
        return;
      }
      pendingPersistenceRef.current = {
        writes: writes ? new Map(writes) : new Map(),
        removals: new Set(removals),
      };
    },
    [],
  );

  const flushPendingPersistence = React.useCallback(() => {
    const pending = pendingPersistenceRef.current;
    if (!pending) return;
    pendingPersistenceRef.current = null;
    for (const [iso, day] of pending.writes) {
      scheduleWrite(createStorageKey(`${DAY_STORAGE_PREFIX}${iso}`), day);
    }
    for (const iso of pending.removals) {
      removeLocal(`${DAY_STORAGE_PREFIX}${iso}`);
    }
  }, []);

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
      setToday(nextToday);
      setFocus(nextToday);
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

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    const perDayPrefix = createStorageKey(DAY_STORAGE_PREFIX);
    const prefixLength = perDayPrefix.length;
    const storedIsos = new Set<ISODate>();
    const validIsos = new Set<ISODate>();
    const staleIsos = new Set<ISODate>();
    const missingIsos = new Set<ISODate>();
    const nextDays: Record<ISODate, DayRecord> = {};

    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(perDayPrefix)) continue;
      const iso = key.slice(prefixLength) as ISODate;
      storedIsos.add(iso);
      const raw = window.localStorage.getItem(key);
      const parsed = parseJSON<unknown>(raw);
      if (parsed === null) {
        staleIsos.add(iso);
        continue;
      }
      const decoded = decodePlannerDay(parsed);
      if (!decoded) {
        staleIsos.add(iso);
        continue;
      }
      nextDays[iso] = decoded;
      validIsos.add(iso);
    }

    const legacySnapshot = readLocal<Record<string, unknown>>(DAYS_STORAGE_KEY);
    if (legacySnapshot) {
      const decodedLegacy = decodePlannerDays(legacySnapshot);
      for (const [iso, day] of Object.entries(decodedLegacy)) {
        const typedIso = iso as ISODate;
        if (validIsos.has(typedIso)) continue;
        nextDays[typedIso] = day;
        if (!storedIsos.has(typedIso) || staleIsos.has(typedIso)) {
          missingIsos.add(typedIso);
        }
      }
    }

    const pruned = pruneOldDays(nextDays);
    const prunedIsos = new Set(Object.keys(pruned) as ISODate[]);
    for (const iso of storedIsos) {
      if (!prunedIsos.has(iso)) {
        staleIsos.add(iso);
      }
    }

    if (cancelled) return;

    setRawDays(pruned);
    hydratedRef.current = true;

    removeLocal(DAYS_STORAGE_KEY);
    if (staleIsos.size > 0) {
      for (const iso of staleIsos) {
        removeLocal(`${DAY_STORAGE_PREFIX}${iso}`);
      }
    }

    if (missingIsos.size > 0) {
      const writes = new Map<ISODate, DayRecord>();
      for (const iso of missingIsos) {
        const day = pruned[iso];
        if (day) {
          writes.set(iso, day);
        }
      }
      if (writes.size > 0) {
        queuePersistence(writes, []);
      }
    }

    flushPendingPersistence();

    return () => {
      cancelled = true;
    };
  }, [flushPendingPersistence, queuePersistence]);

  React.useEffect(() => {
    if (!hydratedRef.current) return;
    flushPendingPersistence();
  }, [rawDays, flushPendingPersistence]);

  const [selected, tasksById] = React.useMemo(() => {
    const cleaned = cleanupSelections(selectedState, rawDays);
    const map: TaskIdMap = {};
    for (const [iso, record] of Object.entries(rawDays)) {
      map[iso as ISODate] = record.tasksById ?? {};
    }
    return [cleaned, map] as const;
  }, [selectedState, rawDays]);

  React.useEffect(() => {
    if (!Object.is(selected, selectedState)) {
      setSelectedState(selected);
    }
  }, [selected, selectedState, setSelectedState]);

  const setDays = React.useCallback<DaysDispatch>(
    (action) => {
      setRawDays((prev) => {
        const resolved =
          typeof action === "function"
            ? (action as (
                current: Record<ISODate, DayRecord>,
              ) => DaysUpdateResult)(prev)
            : action;

        const { days: candidate, changed } = extractDaysUpdate(resolved);

        const next = pruneOldDays(candidate);
        let mutated = !Object.is(next, candidate);

        const targetIsos = changed ?? (Object.keys(next) as ISODate[]);

        let result = next;
        if (targetIsos.length > 0) {
          const sanitizedEntries: Array<[ISODate, DayRecord]> = [];
          for (const iso of targetIsos) {
            const sanitized = sanitizeDayRecord(result, iso);
            if (sanitized) {
              sanitizedEntries.push([iso, sanitized]);
            }
          }
          if (sanitizedEntries.length > 0) {
            if (!mutated) {
              mutated = true;
              result = { ...result };
            } else if (Object.is(result, next)) {
              result = { ...result };
            }
            for (const [iso, sanitized] of sanitizedEntries) {
              result[iso] = sanitized;
            }
          }
        }

        const writes: Array<[ISODate, DayRecord]> = [];
        for (const iso of targetIsos) {
          const nextDay = result[iso];
          if (!nextDay) continue;
          if (!Object.is(prev[iso], nextDay)) {
            writes.push([iso, nextDay]);
          }
        }

        const removals: ISODate[] = [];
        for (const iso of Object.keys(prev) as ISODate[]) {
          if (!Object.prototype.hasOwnProperty.call(result, iso)) {
            removals.push(iso);
          }
        }

        const changedMap =
          mutated ||
          writes.length > 0 ||
          removals.length > 0 ||
          !Object.is(prev, result);

        if (!changedMap) {
          return prev;
        }

        if (writes.length > 0 || removals.length > 0) {
          queuePersistence(
            writes.length > 0 ? new Map(writes) : null,
            removals,
          );
          if (hydratedRef.current) {
            flushPendingPersistence();
          }
        }

        return result;
      });
    },
    [flushPendingPersistence, queuePersistence],
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
