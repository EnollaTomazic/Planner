"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import styles from "./HeroScene.module.css";

type HeroSceneConfig = {
  src: string;
  alt?: string;
  align?: "left" | "center" | "right";
  bob?: string;
  scale?: string;
  objectPosition?: string;
};

const HERO_SCENES: Record<string, HeroSceneConfig> = {
  "agnes-floating": {
    src: "/hero-art/agnes-floating.svg",
    alt: "Agnes floating above a neon ring",
    align: "right",
    bob: "var(--space-4)",
    scale: "1.02",
    objectPosition: "62% 50%",
  },
  "agnes-neutral": {
    src: "/hero-art/agnes-neutral.svg",
    alt: "Agnes standing with a calm stance",
    align: "center",
  },
  "agnes-hacking": {
    src: "/hero-art/agnes-hacking.svg",
    alt: "Agnes leaning toward a holo terminal",
    align: "right",
    bob: "var(--space-3)",
    objectPosition: "58% 52%",
  },
  "noxi-floating": {
    src: "/hero-art/noxi-floating.svg",
    alt: "Noxi floating with support drones",
    align: "right",
    bob: "calc(var(--space-3) + var(--space-1))",
    scale: "1.04",
  },
  "noxi-hacking": {
    src: "/hero-art/noxi-hacking.svg",
    alt: "Noxi focused on a hacking console",
    align: "left",
    objectPosition: "48% 50%",
  },
};

export type HeroSceneKey = keyof typeof HERO_SCENES;

export interface HeroSceneProps {
  scene: HeroSceneKey;
  alt?: string;
  heading?: string;
  className?: string;
}

export function HeroScene({ scene, alt, heading, className }: HeroSceneProps) {
  const config = HERO_SCENES[scene];
  const trimmedAlt = typeof alt === "string" ? alt.trim() : "";
  const sceneAlt =
    trimmedAlt.length > 0
      ? trimmedAlt
      : config?.alt ??
          (heading && heading.trim().length > 0
            ? `${heading.trim()} hero art`
            : "");
  const ariaHidden = sceneAlt.length === 0;

  if (!config) {
    return null;
  }

  const bobAmount = config.bob ?? "var(--space-3)";
  const scale = config.scale ?? "1";
  const objectPosition = config.objectPosition ?? "60% 50%";

  return (
    <div
      className={cn("absolute inset-0", styles.scene, className)}
      data-align={config.align ?? "right"}
      style={{
        ["--scene-bob" as string]: bobAmount,
        ["--scene-scale" as string]: scale,
      }}
    >
      <div aria-hidden className={styles.blob} />
      <div aria-hidden className={styles.bloom} />
      <Image
        src={config.src}
        alt={sceneAlt}
        aria-hidden={ariaHidden ? true : undefined}
        fill
        sizes="(min-width: 1280px) 50vw, (min-width: 768px) 70vw, 100vw"
        priority={false}
        className={styles.figure}
        style={{ objectPosition }}
      />
    </div>
  );
}
