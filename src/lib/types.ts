// src/lib/types.ts
export type Pillar =
  | "Wave"
  | "Trading"
  | "Vision"
  | "Tempo"
  | "Positioning"
  | "Comms";

export type Side = "Blue" | "Red";

/** Single canonical Role type. Stop redefining this elsewhere. */
export type Role = "TOP" | "JUNGLE" | "MID" | "BOT" | "SUPPORT";

export type ReviewMarker = {
  id: string;
  time: string;     // "MM:SS"
  seconds: number;  // canonical
  note: string;
  noteOnly?: boolean;
};

export type Review = {
  id: string;
  title: string;
  opponent?: string;
  lane?: string;
  side?: Side;
  patch?: string;
  duration?: string;
  matchup?: string;
  tags: string[];
  pillars: Pillar[];
  notes?: string;
  createdAt: number;

  // Extended UI fields
  result?: "Win" | "Loss";
  score?: number;            // 1..10
  role?: Role;               // one of five, not three
  focusOn?: boolean;
  focus?: number;            // 1..10
  markers?: ReviewMarker[];
  status?: "new";           // transient UI flag
};

export type Goal = {
  id: string;
  title: string;
  pillar?: Pillar;
  metric?: string;
  notes?: string;
  done: boolean;
  createdAt: number;
};

const PILLAR_VALUES = [
  "Wave",
  "Trading",
  "Vision",
  "Tempo",
  "Positioning",
  "Comms",
] as const;

const SIDE_VALUES = ["Blue", "Red"] as const;

const ROLE_VALUES = ["TOP", "JUNGLE", "MID", "BOT", "SUPPORT"] as const;

const PILLAR_SET = new Set<string>(PILLAR_VALUES);
const SIDE_SET = new Set<string>(SIDE_VALUES);
const ROLE_SET = new Set<string>(ROLE_VALUES);

export function isPillar(value: unknown): value is Pillar {
  return typeof value === "string" && PILLAR_SET.has(value);
}

export function isSide(value: unknown): value is Side {
  return typeof value === "string" && SIDE_SET.has(value);
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && ROLE_SET.has(value);
}
