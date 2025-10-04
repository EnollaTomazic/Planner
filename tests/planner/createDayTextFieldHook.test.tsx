import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { DayRecord, ISODate } from "@/components/planner";

const iso: ISODate = "2025-03-14";
const initialNotes = "Persisted text   ";

const makeDay = (notes = initialNotes): DayRecord => ({
  projects: [],
  tasks: [],
  tasksById: {},
  tasksByProject: {},
  doneCount: 0,
  totalCount: 0,
  notes,
});

const daysByIso: Record<ISODate, DayRecord> = {};

const ensureDay = (date: ISODate) => {
  if (!daysByIso[date]) {
    daysByIso[date] = makeDay("");
  }
  return daysByIso[date];
};

const getDayMock = vi.fn((date: ISODate) => ensureDay(date));
const upsertDayMock = vi.fn(
  (date: ISODate, updater: (day: DayRecord) => DayRecord) => {
    const current = ensureDay(date);
    const next = updater(current);
    daysByIso[date] = next;
  },
);

const store = { getDay: getDayMock, upsertDay: upsertDayMock } as const;

vi.mock("@/components/planner/usePlannerStore", async () => {
  const actual = await vi.importActual<
    typeof import("@/components/planner/usePlannerStore")
  >("@/components/planner/usePlannerStore");
  return {
    ...actual,
    usePlannerStore: () => store,
  };
});

import {
  createDayTextFieldHook,
  scheduleSavingReset,
} from "@/components/planner";

const selectNotes = (day: DayRecord) => day.notes;

describe("createDayTextFieldHook", () => {
  beforeEach(() => {
    Object.keys(daysByIso).forEach((key) => delete daysByIso[key as ISODate]);
    daysByIso[iso] = makeDay();
    getDayMock.mockClear();
    upsertDayMock.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("skips redundant commits and trims edits before persisting", () => {
    const applyValue = vi.fn((day: DayRecord, value: string) => ({
      ...day,
      notes: value,
    }));
    const scheduled: VoidFunction[] = [];
    const scheduleReset = vi.fn((callback: VoidFunction) => {
      scheduled.push(callback);
    });
    const useNotesField = createDayTextFieldHook({
      selectValue: selectNotes,
      applyValue,
      scheduleSavingReset: scheduleReset,
    });

    const { result } = renderHook(() => useNotesField(iso));

    expect(result.current.value).toBe(initialNotes);
    expect(result.current.lastSavedRef.current).toBe(initialNotes.trim());
    expect(result.current.isDirty).toBe(false);

    act(() => {
      result.current.commit();
    });

    expect(applyValue).not.toHaveBeenCalled();
    expect(upsertDayMock).not.toHaveBeenCalled();
    expect(scheduleReset).not.toHaveBeenCalled();
    expect(result.current.lastSavedRef.current).toBe(initialNotes.trim());

    const editedWithWhitespace = "  Updated summary   ";
    act(() => {
      result.current.setValue(editedWithWhitespace);
    });

    expect(result.current.value).toBe(editedWithWhitespace);
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.commit();
    });

    expect(applyValue).toHaveBeenCalledTimes(1);
    expect(applyValue).toHaveBeenLastCalledWith(
      expect.objectContaining({ notes: initialNotes }),
      "Updated summary",
    );
    expect(upsertDayMock).toHaveBeenCalledTimes(1);
    expect(upsertDayMock).toHaveBeenCalledWith(iso, expect.any(Function));
    expect(scheduleReset).toHaveBeenCalledTimes(1);
    expect(result.current.saving).toBe(true);
    expect(daysByIso[iso].notes).toBe("Updated summary");
    expect(result.current.lastSavedRef.current).toBe("Updated summary");
    expect(result.current.isDirty).toBe(false);

    act(() => {
      scheduled.forEach((callback) => callback());
    });

    expect(result.current.saving).toBe(false);
    expect(result.current.isDirty).toBe(false);
  });

  it("clears saving with queueMicrotask when available", () => {
    vi.useFakeTimers();
    const applyValue = vi.fn((day: DayRecord, value: string) => ({
      ...day,
      notes: value,
    }));
    const useNotesField = createDayTextFieldHook({
      selectValue: selectNotes,
      applyValue,
      scheduleSavingReset,
    });
    const microtasks: VoidFunction[] = [];
    const originalQueueMicrotask = globalThis.queueMicrotask;
    const queueMicrotaskSpy = vi.fn((callback: VoidFunction) => {
      microtasks.push(callback);
    });
    vi.stubGlobal("queueMicrotask", queueMicrotaskSpy as typeof queueMicrotask);

    const { result } = renderHook(() => useNotesField(iso));

    act(() => {
      result.current.setValue("Queue reset");
    });
    act(() => {
      result.current.commit();
    });

    expect(queueMicrotaskSpy).toHaveBeenCalledTimes(1);
    expect(result.current.saving).toBe(true);

    act(() => {
      microtasks.forEach((callback) => callback());
    });

    expect(result.current.saving).toBe(false);
    expect(queueMicrotaskSpy).toHaveBeenCalledTimes(1);

    vi.stubGlobal("queueMicrotask", originalQueueMicrotask);
    vi.useRealTimers();
  });

  it("falls back to setTimeout when queueMicrotask is missing", () => {
    vi.useFakeTimers();
    const applyValue = vi.fn((day: DayRecord, value: string) => ({
      ...day,
      notes: value,
    }));
    const useNotesField = createDayTextFieldHook({
      selectValue: selectNotes,
      applyValue,
      scheduleSavingReset,
    });

    const originalQueueMicrotask = globalThis.queueMicrotask;
    vi.stubGlobal("queueMicrotask", undefined);
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

    const { result } = renderHook(() => useNotesField(iso));

    act(() => {
      result.current.setValue("Timer reset");
    });
    act(() => {
      result.current.commit();
    });

    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(result.current.saving).toBe(true);

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.saving).toBe(false);
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);

    setTimeoutSpy.mockRestore();
    vi.stubGlobal("queueMicrotask", originalQueueMicrotask);
    vi.useRealTimers();
  });

  it("does not update state after unmounting post-commit", () => {
    const applyValue = vi.fn((day: DayRecord, value: string) => ({
      ...day,
      notes: value,
    }));
    const scheduled: VoidFunction[] = [];
    const scheduleReset = vi.fn((callback: VoidFunction) => {
      scheduled.push(callback);
    });
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      const useNotesField = createDayTextFieldHook({
        selectValue: selectNotes,
        applyValue,
        scheduleSavingReset: scheduleReset,
      });

      const { result, unmount } = renderHook(() => useNotesField(iso));

      act(() => {
        result.current.setValue("Unmounted commit");
      });

      act(() => {
        result.current.commit();
      });

      expect(scheduleReset).toHaveBeenCalledTimes(1);
      expect(result.current.saving).toBe(true);

      unmount();

      act(() => {
        scheduled.forEach((callback) => callback());
      });

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
