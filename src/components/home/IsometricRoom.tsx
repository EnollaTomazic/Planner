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

const VARIANT_STYLES: Record<Variant, string> = {
  lg: "[--room-floor:var(--lg-black)] [--room-wall:var(--lg-violet)] [--room-accent:var(--lg-cyan)]",
  aurora:
    "[--room-floor:var(--aurora-g)] [--room-wall:var(--aurora-p)] [--room-accent:var(--aurora-g-light)]",
  citrus:
    "[--room-floor:var(--citrus-teal)] [--room-wall:var(--citrus-teal)] [--room-accent:var(--ring)]",
  noir: "[--room-floor:var(--noir-ink)] [--room-wall:var(--noir-rose)] [--room-accent:var(--noir-red)]",
  ocean:
    "[--room-floor:var(--ocean-indigo)] [--room-wall:var(--ocean-cyan)] [--room-accent:var(--ocean-cyan)]",
  kitten:
    "[--room-floor:var(--kitten-pink)] [--room-wall:var(--kitten-rose)] [--room-accent:var(--kitten-blush)]",
  hardstuck:
    "[--room-floor:var(--hardstuck-deep)] [--room-wall:var(--hardstuck-forest)] [--room-accent:var(--hardstuck-forest)]",
};

export default function IsometricRoom({ variant }: IsometricRoomProps) {
  const decor = ROOM_DECOR[variant];
  return (
    <Card
      role="img"
      aria-label={`Isometric room with ${decor}`}
      tabIndex={0}
      className={`relative h-48 overflow-hidden bg-background border shadow transition-transform motion-reduce:transition-none hover:-translate-y-1 hover:shadow-md active:shadow focus-visible:ring-2 focus-visible:ring-[--theme-ring] focus-visible:ring-offset-0 motion-reduce:hover:translate-y-0 ${VARIANT_STYLES[variant]}`}
    >
      <div className="absolute inset-0 [transform-style:preserve-3d]">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[hsl(var(--room-floor))] origin-bottom [transform:rotateX(90deg)]" />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-[hsl(var(--room-wall))] origin-left [transform:rotateY(90deg)]" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[hsl(var(--room-accent))] origin-right [transform:rotateY(-90deg)]" />
      </div>
      {variant === "lg" && (
        <div
          aria-hidden
          className="absolute inset-0 overflow-hidden pointer-events-none animate-[glx-flicker_6s_linear_infinite] motion-reduce:animate-none"
        >
          <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,hsl(var(--room-accent)/0.15)_0_2px,transparent_2px_4px)] [background-size:200%_100%] mix-blend-screen opacity-40 animate-[room-glitch_8s_linear_infinite] motion-reduce:animate-none" />
        </div>
      )}
      {variant === "kitten" && (
        <div
          aria-hidden
          className="absolute inset-0 overflow-hidden pointer-events-none"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--room-accent)/0.25)_2px,transparent_3px)] [background-size:20px_20px] opacity-30 animate-[room-kitten_8s_linear_infinite] motion-reduce:animate-none" />
        </div>
      )}
      <span className="sr-only">{decor}</span>
    </Card>
  );
}
