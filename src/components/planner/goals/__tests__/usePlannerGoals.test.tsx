import * as React from "react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Goal } from "@/lib/types";
import { ACTIVE_CAP } from "@/components/goals/goalsPersistence";
import { PlannerGoalsProvider, usePlannerGoalsContext } from "../../plannerGoalsContext";

const GOALS_KEY = "goals.v2";
const persistentState = new Map<string, unknown>();
let uidCounter = 0;

vi.mock("@/lib/db", async () => {
  const actual = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");
  return {
    ...actual,
    uid: () => {
      uidCounter += 1;
      return `goal-${uidCounter}`;
    },
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

      const setStateAndCache: React.Dispatch<React.SetStateAction<T>> = (value) => {
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

describe("usePlannerGoals", () => {
  beforeEach(() => {
    persistentState.clear();
    uidCounter = 0;
    vi.useRealTimers();
  });

  const renderGoalsHook = () =>
    renderHook(() => usePlannerGoalsContext(), {
      wrapper: ({ children }) => <PlannerGoalsProvider>{children}</PlannerGoalsProvider>,
    });

  it("prevents duplicate goal titles", () => {
    persistentState.set(GOALS_KEY, [
      { id: "goal-1", title: "Ship", done: false, createdAt: 1 } satisfies Goal,
    ]);

    const { result } = renderGoalsHook();

    let added = true;
    act(() => {
      added = result.current.addGoal({
        title: " ship  ",
        metric: "",
        notes: "",
        pillar: "",
      });
    });

    expect(added).toBe(false);
    expect(result.current.err).toBe("Goal already exists.");
    expect(result.current.goals).toHaveLength(1);
  });

  it("enforces the active goal cap", () => {
    const activeGoals: Goal[] = Array.from({ length: ACTIVE_CAP }, (_, index) => ({
      id: `g-${index}`,
      title: `Active ${index + 1}`,
      done: false,
      createdAt: index,
    }));
    persistentState.set(GOALS_KEY, activeGoals);

    const { result } = renderGoalsHook();

    let added = true;
    act(() => {
      added = result.current.addGoal({
        title: "Too many",
        metric: "",
        notes: "",
        pillar: "",
      });
    });

    expect(added).toBe(false);
    expect(result.current.err).toBe("Cap reached. Mark something done first.");
    expect(result.current.goals).toHaveLength(ACTIVE_CAP);
  });

  it("clears the undo timeout when restoring a deleted goal", () => {
    vi.useFakeTimers();
    const goal: Goal = { id: "goal-1", title: "Focus", done: false, createdAt: 1 };
    persistentState.set(GOALS_KEY, [goal]);

    const { result } = renderGoalsHook();

    act(() => {
      result.current.removeGoal(goal.id);
    });

    expect(result.current.lastDeleted?.id).toBe(goal.id);
    expect(vi.getTimerCount()).toBe(1);

    act(() => {
      result.current.undoRemove();
    });

    expect(result.current.lastDeleted).toBeNull();
    expect(result.current.goals[0]?.id).toBe(goal.id);
    expect(vi.getTimerCount()).toBe(0);
  });
});
