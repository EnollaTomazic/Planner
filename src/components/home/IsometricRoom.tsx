"use client";

import * as React from "react";
import Card from "@/components/ui/primitives/Card";
import type { Variant } from "@/lib/theme";

export const ROOM_DECOR: Record<Variant, string> = {
  lg: "Glitch setup",
  aurora: "Aurora zen",
  citrus: "Citrus nook",
  noir: "Noir lounge",
  ocean: "Ocean escape",
  kitten: "Kitten corner",
  hardstuck: "Hardstuck grind",
};

interface IsometricRoomProps {
  variant: Variant;
}

export default function IsometricRoom({ variant }: IsometricRoomProps) {
  const decor = ROOM_DECOR[variant];
  return (
    <Card
      role="img"
      aria-label={`Isometric room with ${decor}`}
      tabIndex={0}
      className="grid h-48 place-items-center focus-visible:ring-2 focus-visible:ring-[--theme-ring] focus-visible:ring-offset-0 motion-safe:animate-pulse motion-reduce:animate-none forced-colors:outline"
    >
      <span className="text-sm text-muted-foreground">{decor}</span>
    </Card>
  );
}
