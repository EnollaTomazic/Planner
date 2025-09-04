import type { ComponentType } from "react";
import type { Pillar, Role } from "@/lib/types";
import {
  Flag,
  MapPin,
  Target,
  Crosshair,
  Shield,
  Skull,
  Meh,
  Smile,
  Trophy,
} from "lucide-react";

/** Persisted key for role memory */
export const LAST_ROLE_KEY = "last_role";

/** Lane/pillar enums used in UI */
export const ALL_PILLARS: Pillar[] = [
  "Wave",
  "Trading",
  "Vision",
  "Tempo",
  "Positioning",
  "Comms",
];

/** Lane/role options shown as segmented buttons in the editor */
export const ROLE_OPTIONS: Array<{
  value: Role;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}> = [
  { value: "TOP", label: "Top", Icon: Flag },
  { value: "JUNGLE", label: "Jungle", Icon: MapPin },
  { value: "MID", label: "Mid", Icon: Target },
  { value: "ADC", label: "ADC", Icon: Crosshair },
  { value: "SUPPORT", label: "Support", Icon: Shield },
];

/** Deterministic index selector (cheap string hash) */
export function pickIndex(seed: string, modulo: number): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % Math.max(1, modulo);
}

/** Icon + color class for a score bucket */
export function scoreIcon(score: number): {
  Icon: ComponentType<{ className?: string }>;
  cls: string;
} {
  if (score <= 3) return { Icon: Skull, cls: "text-rose-400" };
  if (score <= 6) return { Icon: Meh, cls: "text-amber-400" };
  if (score >= 9) return { Icon: Trophy, cls: "text-emerald-400" };
  return { Icon: Smile, cls: "text-emerald-300" };
}

/** Short quips for performance score 0..10 (5 per tier) */
export const SCORE_POOLS: Record<number, string[]> = {
  0: [
    "The minions deserved better.",
    "Gameplay was a rumor.",
    "Clicked everything but enemies.",
    "Ward diff, player diff, life diff.",
    "Report the mouse.",
  ],
  1: [
    "ADC stood for Accidentally Donated CS.",
    "Bought items, forgot purpose.",
    "Reinvented throwing.",
    "Hands on cooldown.",
    "Tutorial island energy.",
  ],
  2: [
    "Bronze with ambitions.",
    "Lane? Optional curriculum.",
    "You dodged responsibility.",
    "Macro via astrology.",
    "Teamfight interpretive dance.",
  ],
  3: [
    "A for effort, C- for results.",
    "Mechanics doing jazz.",
    "Outplayed by minions twice.",
    "You pinged, then prayed.",
    "Drafted regrets.",
  ],
  4: [
    "Almost warmed up.",
    "Half-commit legend.",
    "Vision? Soon.",
    "Clicks had ideas.",
    "Tempo decided later.",
  ],
  5: [
    "Fine is fine.",
    "Macro microwave-safe.",
    "Minimap every other beat.",
    "You and wave negotiated.",
    "Serviceable decisions.",
  ],
  6: [
    "Solid lane brain.",
    "Reads landing.",
    "Cooldowns mostly tracked.",
    "Pressure was real.",
    "No tilt tax paid.",
  ],
  7: [
    "Calm hands, sharp reads.",
    "Plates with purpose.",
    "Camera was a weapon.",
    "Punished habits on sight.",
    "Macro had receipts.",
  ],
  8: [
    "Gamer zen detected.",
    "Tempo conductor arc.",
    "You were the pressure.",
    "Plays predicted Twitch chat.",
    "Crisp fundamentals.",
  ],
  9: [
    "Hyperlocked menace.",
    "Three moves ahead.",
    "Teamfight librarian.",
    "Objective whisperer.",
    "Clean, clinical, cold.",
  ],
  10: [
    "Coach took notes.",
    "Patch notes feared you.",
    "Main-character episode.",
    "Fourth monitor: sixth sense.",
    "Perfection speedrun.",
  ],
};

/** Meme pools for FOCUS rating 0..10 (10 per tier) */
export const FOCUS_POOLS: Record<number, string[]> = {
  0: [
    "Alt-tabbed to Narnia.",
    "Monitor was a mirror.",
    "Clicked grass for CS.",
    "AFK but spiritually.",
    "Pinged, then vanished.",
    "Brain.exe not found.",
    "Eyes open, mind closed.",
    "Full spectator mode.",
    "AFK farming excuses.",
    "Controller unplugged vibes.",
  ],
  1: [
    "Goldfish memory arc.",
    "UI: on. Brain: off.",
    "Pressed S to think.",
    "Coffee said no.",
    "Mini-map lore only.",
    "Mind on cooldown.",
    "Focus DLC locked.",
    "Alt-tab speedrun.",
    "Micro naps mid-fight.",
    "Tunnel vision tutorial.",
  ],
  2: [
    "Half-baked reads.",
    "Right-click regrets.",
    "Macro by horoscope.",
    "Hovering IRL.",
    "Lane? Optional.",
    "Notifications won.",
    "Pinged danger for vibes.",
    "Daydream jungling.",
    "Cait traps for décor.",
    "Focus at 144p.",
  ],
  3: [
    "Almost warmed up.",
    "Focus in beta.",
    "Dodged one skill. Pride.",
    "Cursor sightseeing.",
    "Minions juked you.",
    "Reading chat like gospel.",
    "Brain ping 200ms.",
    "Micro went macro wrong.",
    "Side questing mid-lane.",
    "Alt key main character.",
  ],
  4: [
    "Some thoughts detected.",
    "Map glanced, not seen.",
    "Skillshots negotiated.",
    "Clicked intentions, not targets.",
    "Focus: trial version.",
    "Decision cache missed.",
    "Macro-ish.",
    "Half-commit legend.",
    "Drafting excuses.",
    "Ping roulette winner.",
  ],
  5: [
    "Baseline gamer focus.",
    "Eyes on lane, mostly.",
    "Okay reads, okay clicks.",
    "Focus medium rare.",
    "Mini-map every other beat.",
    "Solid bronze halo.",
    "Mid fight TED talk.",
    "Microwave meal macro.",
    "You and wave had a chat.",
    "Cursor behaved… sometimes.",
  ],
  6: [
    "Dialing in.",
    "Reads landing.",
    "Third eye buffering.",
    "Good timers, better patience.",
    "Focus with flavor.",
    "Map pings with purpose.",
    "Respectable clarity.",
    "CS and thoughts aligned.",
    "Cooldown tracking-ish.",
    "Pretty clean lane brain.",
  ],
  7: [
    "Locked but humane.",
    "Reads ahead of time.",
    "Map sense online.",
    "No doomscrolling micro.",
    "Camera was a weapon.",
    "Win-ready focus.",
    "Plate math in head.",
    "You saw the turn.",
    "Jukes with intent.",
    "Calm hands, sharp clicks.",
  ],
  8: [
    "Gamer zen achieved.",
    "Plays predicted chat.",
    "Minimap whisperer.",
    "Cooldown librarian.",
    "Focus speedrun PB.",
    "Macro clairvoyance.",
    "Pressure chef’s kiss.",
    "No tilt tax today.",
    "Reads wrote themselves.",
    "Mechanics obeyed brain.",
  ],
  9: [
    "Hyperlocked menace.",
    "Saw three plays ahead.",
    "Mini-map was your HUD.",
    "Eyes like ward bots.",
    "Tempo conductor.",
    "Punished everything.",
    "You were the macro.",
    "Frame-perfect habits.",
    "Clutch tax refunded.",
    "Clicked with prophecy.",
  ],
  10: [
    "Main-character focus.",
    "E-sports cam ready.",
    "Chess while others drew circles.",
    "Third eye 4K HDR.",
    "Perfect tempo pilgrim.",
    "Predicted the patch notes.",
    "You were the objective.",
    "Focus over 9000.",
    "Reads so crisp they hurt.",
    "Coach took notes.",
  ],
};
