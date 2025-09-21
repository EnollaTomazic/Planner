import * as React from "react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Goal } from "@/lib/types";

const GOALS_KEY = "goals.v2";
const persistentState = new Map<string, unknown>();
let goalCounter = 0;

const seedGoals = (goals: Goal[]) => {
  persistentState.set(GOALS_KEY, goals);
};

const readGoalsState = () =>
  (persistentState.get(GOALS_KEY) as Goal[] | undefined) ?? [];

vi.mock("@/lib/db", async () => {
  const actual = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");
  return {
    ...actual,
    usePersistentState: <T,>(
      key: string,
      initial: T,
      _options?: unknown,
    ) => {
      const [state, setState] = React.useState<T>(() => {
        if (persistentState.has(key)) {
          return persistentState.get(key) as T;
        }
        persistentState.set(key, initial);
        return initial;
      });

      const setStateAndCache: React.Dispatch<React.SetStateAction<T>> = (
        value,
      ) => {
        setState((prev) => {
          const next =
            typeof value === "function"
              ? (value as (prevState: T) => T)(prev)
              : value;
          persistentState.set(key, next);
          return next;
        });
      };

      return [state, setStateAndCache] as const;
    },
  };
});

import { ACTIVE_CAP, useGoals } from "@/components/goals";

const createGoal = (overrides: Partial<Goal> = {}): Goal => {
  goalCounter += 1;
  const base: Goal = {
    id: `goal-${goalCounter}`,
    title: `Goal ${goalCounter}`,
    done: false,
    createdAt: goalCounter,
  };
  return { ...base, ...overrides };
};

describe("useGoals", () => {
  beforeEach(() => {
    persistentState.clear();
    goalCounter = 0;
    vi.useRealTimers();
  });

  it("rejects blank titles", () => {
    const { result } = renderHook(() => useGoals());

    let added = true;
    act(() => {
      added = result.current.addGoal({
        title: "   ",
        metric: "",
        notes: "",
        pillar: "",
      });
    });

    expect(added).toBe(false);
    expect(result.current.err).toBe("Title required.");
    expect(result.current.goals).toHaveLength(0);
  });

  it("prevents adding beyond the active cap", () => {
    const activeGoals = Array.from({ length: ACTIVE_CAP }, (_, index) =>
      createGoal({ id: `active-${index}`, title: `Active ${index + 1}` }),
    );
    seedGoals(activeGoals);

    const { result } = renderHook(() => useGoals());

    let added = true;
    act(() => {
      added = result.current.addGoal({
        title: "Fourth goal",
        metric: "",
        notes: "",
        pillar: "",
      });
    });

    expect(added).toBe(false);
    expect(result.current.err).toBe("Cap reached. Mark something done first.");
    expect(result.current.goals.map((goal) => goal.id)).toEqual(
      activeGoals.map((goal) => goal.id),
    );
  });

  it("reverts toggle when reactivating would exceed the cap", () => {
    const activeGoals = Array.from({ length: ACTIVE_CAP }, (_, index) =>
      createGoal({ id: `active-${index}`, title: `Active ${index + 1}` }),
    );
    const dormantGoal = createGoal({
      id: "dormant",
      title: "Dormant",
      done: true,
      createdAt: 99,
    });
    const initialGoals = [dormantGoal, ...activeGoals];
    seedGoals(initialGoals);

    const { result } = renderHook(() => useGoals());
    const originalReference = result.current.goals;

    act(() => {
      result.current.toggleDone("dormant");
    });

    expect(result.current.err).toBe(
      "Cap is 3 active. Complete or delete another first.",
    );
    expect(result.current.goals).toBe(originalReference);
    const target = result.current.goals.find((goal) => goal.id === "dormant");
    expect(target?.done).toBe(true);
  });

  it("supports undo and clears timers on removal", () => {
    vi.useFakeTimers();
    const clearSpy = vi.spyOn(globalThis, "clearTimeout");
    const setSpy = vi.spyOn(globalThis, "setTimeout");

    const firstGoal = createGoal({ id: "first" });
    const secondGoal = createGoal({ id: "second" });
    seedGoals([firstGoal, secondGoal]);

    try {
      const { result, unmount } = renderHook(() => useGoals());

      act(() => {
        result.current.removeGoal("first");
      });

      expect(result.current.goals.map((goal) => goal.id)).toEqual(["second"]);
      expect(result.current.lastDeleted?.id).toBe("first");
      expect(setSpy).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.removeGoal("second");
      });

      expect(clearSpy).toHaveBeenCalledTimes(1);
      expect(setSpy).toHaveBeenCalledTimes(2);
      expect(result.current.goals).toHaveLength(0);
      expect(result.current.lastDeleted?.id).toBe("second");

      act(() => {
        result.current.undoRemove();
      });

      expect(result.current.goals.map((goal) => goal.id)).toEqual(["second"]);
      expect(result.current.lastDeleted).toBeNull();

      unmount();
      expect(clearSpy).toHaveBeenCalledTimes(2);
    } finally {
      setSpy.mockRestore();
      clearSpy.mockRestore();
      vi.useRealTimers();
    }
  });

  it("trims new goal fields and preserves merged data on update", () => {
    const existingGoal = createGoal({
      id: "existing",
      title: "Existing",
      metric: "persisted",
      notes: "keep",
      pillar: "Wave",
    });
    seedGoals([existingGoal]);

    const { result } = renderHook(() => useGoals());

    let added = false;
    act(() => {
      added = result.current.addGoal({
        title: "  Fresh goal  ",
        metric: "  progress  ",
        notes: "  detailed note  ",
        pillar: "",
      });
    });

    expect(added).toBe(true);
    const [newGoal, ...rest] = result.current.goals;
    expect(newGoal.title).toBe("Fresh goal");
    expect(newGoal.metric).toBe("progress");
    expect(newGoal.notes).toBe("detailed note");
    expect(newGoal.done).toBe(false);
    expect(rest.some((goal) => goal.id === "existing")).toBe(true);

    const updateTarget = result.current.goals.find(
      (goal) => goal.id === "existing",
    );
    expect(updateTarget).toBeDefined();

    act(() => {
      result.current.updateGoal("existing", {
        title: "Existing",
        metric: "updated metric",
        notes: "refined",
      });
    });

    const storedGoals = readGoalsState();
    const persistedExisting = storedGoals.find(
      (goal) => goal.id === "existing",
    );
    expect(persistedExisting).toMatchObject({
      title: "Existing",
      metric: "updated metric",
      notes: "refined",
      pillar: "Wave",
      done: false,
    });
    expect(persistedExisting?.createdAt).toBe(existingGoal.createdAt);
    expect(persistedExisting?.id).toBe("existing");
  });
});
