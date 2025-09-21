"use client";

import * as React from "react";
import { uid, usePersistentState } from "@/lib/db";
import { isPillar, type Goal, type Pillar } from "@/lib/types";

export const ACTIVE_CAP = 3;

type AddGoalInput = {
  title: string;
  metric: string;
  notes: string;
  pillar: Pillar | "";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function decodeGoal(value: unknown): Goal | null {
  if (!isRecord(value)) return null;
  const id = value["id"];
  const title = value["title"];
  const done = value["done"];
  const createdAt = value["createdAt"];
  if (typeof id !== "string") return null;
  if (typeof title !== "string") return null;
  if (typeof done !== "boolean") return null;
  if (typeof createdAt !== "number" || !Number.isFinite(createdAt)) return null;
  const goal: Goal = { id, title, done, createdAt };
  const pillar = value["pillar"];
  if (isPillar(pillar)) {
    goal.pillar = pillar;
  }
  const metric = value["metric"];
  if (typeof metric === "string") {
    goal.metric = metric;
  }
  const notes = value["notes"];
  if (typeof notes === "string") {
    goal.notes = notes;
  }
  return goal;
}

export function decodeGoals(value: unknown): Goal[] | null {
  if (!Array.isArray(value)) return null;
  const result: Goal[] = [];
  for (const entry of value) {
    const goal = decodeGoal(entry);
    if (goal) result.push(goal);
  }
  return result;
}

export function useGoals() {
  const [goals, setGoals] = usePersistentState<Goal[]>("goals.v2", [], {
    decode: decodeGoals,
  });
  const [err, setErr] = React.useState<string | null>(null);
  const [lastDeleted, setLastDeleted] = React.useState<Goal | null>(null);
  const undoTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const addGoal = React.useCallback(
    ({ title, metric, notes, pillar }: AddGoalInput) => {
      setErr(null);
      if (!title.trim()) {
        setErr("Title required.");
        return false;
      }
      const currentActive = goals.filter((g) => !g.done).length;
      if (currentActive >= ACTIVE_CAP) {
        setErr("Cap reached. Mark something done first.");
        return false;
      }
      const g: Goal = {
        id: uid(),
        title: title.trim(),
        ...(pillar ? { pillar } : {}),
        metric: metric.trim() || undefined,
        notes: notes.trim() || undefined,
        done: false,
        createdAt: Date.now(),
      };
      setGoals((prev) => [g, ...prev]);
      return true;
    },
    [goals, setGoals],
  );

  const toggleDone = React.useCallback(
    (id: string) => {
      setErr(null);
      setGoals((prev) => {
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
          setErr("Cap is 3 active. Complete or delete another first.");
          return prev;
        }

        return next;
      });
    },
    [setGoals],
  );

  const removeGoal = React.useCallback(
    (id: string) => {
      setErr(null);
      const g = goals.find((x) => x.id === id) || null;
      setGoals((prev) => prev.filter((x) => x.id !== id));
      setLastDeleted(g);
      if (undoTimer.current) clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(() => setLastDeleted(null), 5000);
    },
    [goals, setGoals],
  );

  const updateGoal = React.useCallback(
    (id: string, updates: Pick<Goal, "title" | "metric" | "notes">) => {
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...updates } : g)),
      );
    },
    [setGoals],
  );

  const undoRemove = React.useCallback(() => {
    if (!lastDeleted) return;
    setGoals((prev) => [lastDeleted, ...prev]);
    setLastDeleted(null);
  }, [lastDeleted, setGoals]);

  React.useEffect(() => {
    return () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
    };
  }, []);

  return {
    goals,
    err,
    setErr,
    lastDeleted,
    addGoal,
    toggleDone,
    removeGoal,
    updateGoal,
    undoRemove,
  } as const;
}

