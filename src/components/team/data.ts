// src/components/team/data.ts
// Source: union of current jungle tier lists and role tags (see notes in file).
export type ClearSpeed = "Very Fast" | "Fast" | "Medium" | "Slow";

export const SPEED_HINT: Record<ClearSpeed, string> = {
  "Very Fast": "~3:00",
  Fast: "~3:05–3:20",
  Medium: "~3:25–3:40",
  Slow: "≥3:45",
};

export type JungleRow = {
  champ: string;
  speed: ClearSpeed;
  type?: string[];   // small chips only: e.g., ["AD","Assassin"], ["AP","Tank"]
  notes?: string;
};

/**
 * JUNGLE_ROWS
 * Built from live tier lists (Mobalytics low + high elo) and commonly accepted jungle picks.
 * Keep speeds as a heuristic; adjust per patch if you care about seconds.
 */
export const JUNGLE_ROWS: JungleRow[] = [
  // ——— VERY FAST ———
  { champ: "Nidalee",      speed: "Very Fast", type: ["AD", "Skirm"], notes: "Spear angles > perma farm" },
  { champ: "Elise",        speed: "Very Fast", type: ["AP", "Diver"], notes: "3-camp into lane pressure" },
  { champ: "Graves",       speed: "Very Fast", type: ["AD", "Skirm"] },
  { champ: "Kindred",      speed: "Very Fast", type: ["AD", "Skirm"], notes: "Mark tracking decides map" },
  { champ: "Rek'Sai",      speed: "Very Fast", type: ["AD", "Diver"] },
  { champ: "Bel'Veth",     speed: "Very Fast", type: ["AD", "Skirm"] },
  { champ: "Shyvana",      speed: "Very Fast", type: ["AP/AD", "Farm"] },
  { champ: "Udyr",         speed: "Very Fast", type: ["AD", "Farm"] },
  { champ: "Nunu & Willump", speed: "Very Fast", type: ["Tank", "Objective"], notes: "Secure early; gank on tempo" },
  { champ: "Fiddlesticks", speed: "Very Fast", type: ["AP", "Control"], notes: "Efficient drain clears" },
  { champ: "Karthus",      speed: "Very Fast", type: ["AP", "Farm"] },
  { champ: "Briar",        speed: "Very Fast", type: ["AD", "Diver"] },

  // ——— FAST ———
  { champ: "Lee Sin",   speed: "Fast", type: ["AD", "Skirm"] },
  { champ: "Jarvan IV", speed: "Fast", type: ["AD", "Engage"] },
  { champ: "Xin Zhao",  speed: "Fast", type: ["AD", "Duel"] },
  { champ: "Nocturne",  speed: "Fast", type: ["AD", "Dive"] },
  { champ: "Hecarim",   speed: "Fast", type: ["AD", "Dive"] },
  { champ: "Rengar",    speed: "Fast", type: ["AD", "Assassin"] },
  { champ: "Shaco",     speed: "Fast", type: ["AD/AP", "Pick"] },
  { champ: "Vi",        speed: "Fast", type: ["AD", "Engage"] },
  { champ: "Trundle",   speed: "Fast", type: ["AD", "Bruiser"] },
  { champ: "Warwick",   speed: "Fast", type: ["AD", "Duel"] },
  { champ: "Kayn",      speed: "Fast", type: ["AD", "Flex"], notes: "SA = pick; Rhaast = brawler" },
  { champ: "Taliyah",   speed: "Fast", type: ["AP", "Control"] },
  { champ: "Lillia",    speed: "Fast", type: ["AP", "Skirm"] },
  { champ: "Morgana",   speed: "Fast", type: ["AP", "Farm"] },
  { champ: "Master Yi", speed: "Fast", type: ["AD", "Scaling"] },
  { champ: "Rammus",    speed: "Fast", type: ["Tank", "Anti-AD"] },
  { champ: "Viego",     speed: "Fast", type: ["AD", "Reset"] },
  { champ: "Kha'Zix",   speed: "Fast", type: ["AD", "Assassin"] },
  { champ: "Volibear",  speed: "Fast", type: ["AD", "Diver"] },
  { champ: "Diana",     speed: "Fast", type: ["AP", "Diver"] },
  { champ: "Gragas",    speed: "Fast", type: ["AP", "Engage"] },
  { champ: "Rek'Sai",   speed: "Fast", type: ["AD", "Diver"] }, // duplicate choice if you prefer "Fast" bucket instead
  { champ: "Talon",     speed: "Fast", type: ["AD", "Assassin"] },
  { champ: "Elise",     speed: "Fast", type: ["AP", "Diver"] }, // duplicate alt bucket option

  // ——— MEDIUM ———
  { champ: "Amumu",     speed: "Medium", type: ["AP", "Tank"] },
  { champ: "Zac",       speed: "Medium", type: ["AP", "Tank"] },
  { champ: "Sejuani",   speed: "Medium", type: ["Tank", "Engage"], notes: "Staple jungler; slower full clear" },
  { champ: "Maokai",    speed: "Medium", type: ["AP", "Engage"] },
  { champ: "Wukong",    speed: "Medium", type: ["AD", "Bruiser"] },
  { champ: "Poppy",     speed: "Medium", type: ["Tank", "Anti-dash"] },
  { champ: "Ekko",      speed: "Medium", type: ["AP", "Skirm"] },
  { champ: "Ivern",     speed: "Medium", type: ["Enabler"], notes: "Unique marking clears" },
  { champ: "Pantheon",  speed: "Medium", type: ["AD", "Gank"] },
  { champ: "Naafiri",   speed: "Medium", type: ["AD", "Assassin"] },
  { champ: "Rumble",    speed: "Medium", type: ["AP", "Skirm"] },
  { champ: "Gwen",      speed: "Medium", type: ["AP", "Bruiser"] },
  { champ: "Jax",       speed: "Medium", type: ["AD", "Bruiser"] },
  { champ: "Evelynn",   speed: "Medium", type: ["AP", "Assassin"], notes: "True game starts at 6" },
  { champ: "Zed",       speed: "Medium", type: ["AD", "Assassin"] },
  { champ: "Skarner",   speed: "Medium", type: ["Tank", "Engage"] },
  { champ: "Gwen",      speed: "Medium", type: ["AP", "Bruiser"] },
  { champ: "Viego",     speed: "Medium", type: ["AD", "Reset"] },

  // ——— SLOW ———
  { champ: "Zyra",      speed: "Slow", type: ["AP", "Off-meta"], notes: "Shows up in high elo lists occasionally" },
  { champ: "Dr. Mundo", speed: "Slow", type: ["AD", "Bruiser"] },
  // You can keep "Slow" sparse; most meta jg clear at least Medium in modern patches.
];

/**
 * SOURCING NOTES (human-readable, not used by app):
 * - Mobalytics Jungle Tier Lists list concrete jungle-viable champions for Low and High Elo.
 * - Some classic junglers (e.g., Sejuani, Maokai) are included via official role tags.
 * - If you want strictly “present-in-list only,” delete anything not on the two Mobalytics lists.
 */
