import { Crosshair, Eye, HandCoins, MessagesSquare, Timer, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Pillar } from "./types";

export const PILLAR_ORDER: Pillar[] = [
  "Wave",
  "Trading",
  "Vision",
  "Tempo",
  "Positioning",
  "Comms",
];

export const PILLAR_ICONS: Record<Pillar, LucideIcon> = {
  Wave: Waves,
  Trading: HandCoins,
  Vision: Eye,
  Tempo: Timer,
  Positioning: Crosshair,
  Comms: MessagesSquare,
};

export const pillarToLabel = (pillar: Pillar): Pillar => pillar;
