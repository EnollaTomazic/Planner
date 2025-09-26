"use client";

import * as React from "react";
import Card from "@/components/ui/primitives/Card";
import { cn } from "@/lib/utils";
import { VARIANT_LABELS, type Variant } from "@/lib/theme";

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
  const label = VARIANT_LABELS[variant];
  return (
    <Card
      role="img"
      aria-label={`Isometric room with ${label}`}
      className={cn(
        "relative h-[var(--room-size)] overflow-hidden bg-background border shadow-neo transition-[transform,box-shadow] duration-quick ease-out motion-reduce:transition-none hover:-translate-y-[var(--space-1)] hover:shadow-neo-soft focus-visible:shadow-neo-soft active:translate-y-0 active:shadow-neo-soft focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-0 motion-reduce:hover:translate-y-0 [--room-size:calc(var(--space-8)*3)] [--room-depth:calc(var(--room-size)/2)]",
        VARIANT_STYLES[variant],
      )}
    >
      <div className="absolute inset-0 [transform-style:preserve-3d]">
        <div className="absolute inset-x-0 bottom-0 h-[var(--room-depth)] bg-[hsl(var(--room-floor))] origin-bottom [transform:rotateX(90deg)]" />
        <div className="absolute inset-y-0 left-0 w-[var(--room-depth)] bg-[hsl(var(--room-wall))] origin-left [transform:rotateY(90deg)]" />
        <div
          className="absolute inset-y-0 right-0 w-[var(--room-depth)] bg-[hsl(var(--room-accent))] origin-right [transform:rotateY(-90deg)]"
          style={
            variant === "aurora"
              ? { backgroundColor: "var(--aurora-g-light)" }
              : undefined
          }
        />
      </div>
      {variant === "lg" && (
        <div
          aria-hidden
          className="absolute inset-0 overflow-hidden pointer-events-none animate-[glx-flicker_6s_linear_infinite] motion-reduce:animate-none"
        >
          <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,hsl(var(--room-accent)/0.15)_0_calc(var(--space-1)/2),transparent_calc(var(--space-1)/2)_var(--space-1))] [background-size:200%_100%] mix-blend-screen opacity-40 animate-[room-glitch_8s_linear_infinite] motion-reduce:animate-none" />
        </div>
      )}
      <span className="sr-only">{label}</span>
    </Card>
  );
}
