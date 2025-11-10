// src/components/team/cheatSheet.model.ts
import { ROLES } from "./constants";
import type { Role } from "./constants";

export type LaneExamples = Partial<Record<Role, string[]>>;

export type Archetype = {
  id: string;
  title: string;
  description: string;
  wins: string[];
  struggles?: string[];
  tips?: string[];
  examples: LaneExamples;
};

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
};

export function decodeCheatSheet(value: unknown): Archetype[] | null {
  if (!Array.isArray(value)) return null;

  const safeList: Archetype[] = [];

  for (const entry of value) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      return null;
    }

    const {
      id,
      title,
      description,
      wins,
      struggles,
      tips,
      examples,
    } = entry as Record<string, unknown>;

    if (
      typeof id !== "string" ||
      typeof title !== "string" ||
      typeof description !== "string" ||
      !isStringArray(wins)
    ) {
      return null;
    }

    if (typeof struggles !== "undefined" && !isStringArray(struggles)) {
      return null;
    }

    if (typeof tips !== "undefined" && !isStringArray(tips)) {
      return null;
    }

    const laneExamples: LaneExamples = {};

    if (typeof examples !== "undefined") {
      if (
        examples === null ||
        typeof examples !== "object" ||
        Array.isArray(examples)
      ) {
        return null;
      }

      for (const [role, champs] of Object.entries(
        examples as Record<string, unknown>,
      )) {
        if (!ROLES.includes(role as Role)) continue;
        if (!isStringArray(champs)) return null;
        laneExamples[role as Role] = [...champs];
      }
    }

    const archetype: Archetype = {
      id,
      title,
      description,
      wins: [...wins],
      examples: laneExamples,
    };

    if (typeof struggles !== "undefined") {
      archetype.struggles = [...struggles];
    }

    if (typeof tips !== "undefined") {
      archetype.tips = [...tips];
    }

    safeList.push(archetype);
  }

  return safeList;
}

export function ensureExamples(examples?: LaneExamples): [LaneExamples, boolean] {
  if (!examples) {
    const safe = ROLES.reduce<LaneExamples>((acc, role) => {
      acc[role] = [];
      return acc;
    }, {} as LaneExamples);
    return [safe, true];
  }

  let changed = false;
  const safe: LaneExamples = { ...examples };

  for (const role of ROLES) {
    const lane = examples[role];
    if (Array.isArray(lane)) continue;
    safe[role] = [];
    if (!changed) changed = true;
  }

  return changed ? [safe, true] : [examples, false];
}
