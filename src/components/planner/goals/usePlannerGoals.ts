"use client";

import * as React from "react";
import { uid, usePersistentState } from "@/lib/db";
import type { Goal } from "@/lib/types";
import {
  ACTIVE_CAP,
  decodeGoals,
  type AddGoalInput,
} from "@/components/goals/goalsPersistence";

export type PlannerGoalsState = {
  goals: Goal[];
  err: string | null;
  setErr: React.Dispatch<React.SetStateAction<string | null>>;
  lastDeleted: Goal | null;
  addGoal: (input: AddGoalInput) => boolean;
  toggleDone: (id: string) => void;
  removeGoal: (id: string) => void;
  updateGoal: (
    id: string,
    updates: Pick<Goal, "title" | "metric" | "notes">,
  ) => boolean;
  undoRemove: VoidFunction;
  clearGoals: VoidFunction;
};

const EMPTY_GOAL_LIST: Goal[] = [];

export function usePlannerGoals(): PlannerGoalsState {
  const [goalList, setGoalList] = usePersistentState<Goal[]>(
    "goals.v2",
    EMPTY_GOAL_LIST,
    {
      decode: decodeGoals,
    },
  );
  const [goalErr, setGoalErr] = React.useState<string | null>(null);
  const [lastDeletedGoal, setLastDeletedGoal] = React.useState<Goal | null>(
    null,
  );
  const goalUndoTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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
      const normalizedTitle = trimmedTitle.toLowerCase();
      const hasDuplicate = goalList.some(
        (goal) => goal.title.trim().toLowerCase() === normalizedTitle,
      );
      if (hasDuplicate) {
        setGoalErr("Goal already exists.");
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
      let updated = false;
      setGoalList((prev) => {
        const index = prev.findIndex((goal) => goal.id === id);
        if (index === -1) {
          return prev;
        }

        const current = prev[index];
        const next = { ...current };

        const hasTitleUpdate = Object.prototype.hasOwnProperty.call(
          updates,
          "title",
        );
        if (hasTitleUpdate) {
          const trimmedTitle = updates.title.trim();
          if (!trimmedTitle) {
            setGoalErr("Title required.");
            return prev;
          }
          const normalizedTitle = trimmedTitle.toLowerCase();
          const duplicate = prev.some(
            (goal, goalIndex) =>
              goalIndex !== index &&
              goal.title.trim().toLowerCase() === normalizedTitle,
          );
          if (duplicate) {
            setGoalErr("Goal already exists.");
            return prev;
          }
          next.title = trimmedTitle;
        }

        const metricDefined = Object.prototype.hasOwnProperty.call(
          updates,
          "metric",
        );
        if (metricDefined) {
          const trimmedMetric = updates.metric?.trim();
          next.metric = trimmedMetric ? trimmedMetric : undefined;
        }

        const notesDefined = Object.prototype.hasOwnProperty.call(
          updates,
          "notes",
        );
        if (notesDefined) {
          const trimmedNotes = updates.notes?.trim();
          next.notes = trimmedNotes ? trimmedNotes : undefined;
        }

        const didChange =
          next.title !== current.title ||
          next.metric !== current.metric ||
          next.notes !== current.notes;

        if (!didChange) {
          setGoalErr(null);
          updated = true;
          return prev;
        }

        setGoalErr(null);
        updated = true;
        const copy = [...prev];
        copy[index] = next;
        return copy;
      });
      return updated;
    },
    [setGoalErr, setGoalList],
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

  return {
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
  } as const;
}
