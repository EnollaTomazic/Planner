import { isPillar, type Goal, type Pillar } from "@/lib/types";

export const ACTIVE_CAP = 3;

export type AddGoalInput = {
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

