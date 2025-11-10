// src/components/team/data.ts
// Source: union of current jungle tier lists and role tags (see notes in file).
import type { Archetype } from "./cheatSheet.model";
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

export const DEFAULT_SHEET: Archetype[] = [
  {
    id: "front-to-back",
    title: "Front to Back",
    description:
      "Anchor team fights around tanks and carries. Peel, kite, and win extended fights.",
    wins: [
      "You frontload engage and kite back cleanly",
      "Enemy blows cooldowns on tanks and loses threat",
      "Your Bot hits free DPS windows",
    ],
    struggles: ["Flank TP and backline dive", "Hard poke before engage"],
    tips: [
      "Track enemy flash + engage timers.",
      "Peel first, chase later. Don’t burn mobility spells early.",
    ],
    examples: {
      Top: ["Ornn", "Sion", "Shen"],
      Jungle: ["Sejuani", "Maokai"],
      Mid: ["Orianna", "Azir"],
      Bot: ["Jinx", "Zeri"],
      Support: ["Braum", "Lulu"],
    },
  },
  {
    id: "dive",
    title: "Dive",
    description:
      "Commit layered engage onto backline. Burst, then reset or exit.",
    wins: [
      "You stack CC on first target",
      "Sidewaves force enemy to group awkwardly",
      "Vision denial creates clean angles",
    ],
    struggles: ["Exhaust/peel supports", "Stopwatches and GA timings"],
    tips: ["Ping dive target early. Commit ults together."],
    examples: {
      Top: ["Kennen", "Camille"],
      Jungle: ["Jarvan IV", "Wukong"],
      Mid: ["Sylas", "Akali"],
      Bot: ["Kai’Sa", "Samira"],
      Support: ["Rakan", "Nautilus"],
    },
  },
  {
    id: "pick",
    title: "Pick",
    description:
      "Create numbers advantage through fog traps, hooks, and skirmish picks.",
    wins: [
      "You control river/entrances with wards and traps",
      "Enemy face-checks first",
      "You convert pick to objective fast",
    ],
    struggles: ["Stall comps with cleanse/QSS", "Stubborn 5-man mid ARAM"],
    tips: ["Don’t overchase. Reset tempo after each pick."],
    examples: {
      Jungle: ["Elise", "Viego"],
      Mid: ["Ahri", "Twisted Fate"],
      Bot: ["Ashe", "Varus"],
      Support: ["Thresh", "Blitzcrank", "Rell"],
    },
  },
  {
    id: "poke-siege",
    title: "Poke & Siege",
    description:
      "Chip HP bars and take structures on timers. Disengage hard engages.",
    wins: [
      "You hit turret windows with waves synced",
      "Enemy has limited engage or no flanks",
      "HP diff forces objective flips",
    ],
    struggles: ["Hard flank TP", "Long-range engage"],
    tips: ["Place wards deep on flanks. Don’t overstay post-poke."],
    examples: {
      Top: ["Jayce"],
      Mid: ["Zoe", "Ziggs"],
      Bot: ["Varus", "Ezreal"],
      Support: ["Karma", "Janna"],
    },
  },
  {
    id: "splitpush-131",
    title: "1-3-1 Split",
    description:
      "Pressure two sides, deny engage, and trade up on map with TP advantage.",
    wins: [
      "You maintain vision and mid prio for cross-map",
      "Your sidelaner wins 1v1 or escapes cleanly",
      "Enemy comp needs 5-man to engage",
    ],
    struggles: ["Hard engage with fast mid-to-side collapse"],
    tips: ["Keep timers: waves, TP, objectives. Don’t group unless forced."],
    examples: {
      Top: ["Camille", "Jax", "Fiora"],
      Mid: ["Ryze", "Azir"],
      Bot: ["Xayah"],
      Support: ["Tahm Kench", "Rakan"],
    },
  },
  {
    id: "wombo",
    title: "Wombo Combo",
    description:
      "Stack AoE CC + AoE damage. Fight on chokes and objective pits.",
    wins: [
      "You force fights in tight spaces",
      "Enemy lacks stopwatches/peel",
      "You layer ults, not overlap them",
    ],
    struggles: ["Disengage and spacing comps"],
    tips: ["Ping ult order. Hold last engage for cleanup."],
    examples: {
      Top: ["Malphite", "Kennen"],
      Jungle: ["Sejuani", "Amumu"],
      Mid: ["Orianna", "Yasuo"],
      Bot: ["Miss Fortune"],
      Support: ["Rell", "Alistar"],
    },
  },
];
