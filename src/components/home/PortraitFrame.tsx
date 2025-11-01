import * as React from "react";
import Image from "next/image";

import { AvatarFrame } from "@/components/ui/primitives/AvatarFrame";
import { cn, withBasePath } from "@/lib/utils";

import styles from "./PortraitFrame.module.css";

export type PoseVariant =
  | "duo"
  | "angel-leading"
  | "demon-leading"
  | "back-to-back";

export interface PortraitFrameProps {
  pose?: PoseVariant;
  /**
   * When true, the inner surface keeps the rim treatment but exposes a transparent backdrop.
   */
  transparentBackground?: boolean;
  /**
   * When true, renders an accent pulse outside the rim to highlight planner activity.
   */
  pulse?: boolean;
  className?: string;
  priority?: boolean;
}

type CharacterConfig = {
  description: string;
};

type PoseConfig = {
  label: string;
  stageClassName?: string;
  bloomClassName?: string;
  image: {
    src: string;
    alt: string;
    className?: string;
  };
  angel: CharacterConfig;
  demon: CharacterConfig;
};

const poseConfigs: Record<PoseVariant, PoseConfig> = {
  duo: {
    label: "Angel and demon busts sharing a circular portrait frame",
    image: {
      src: "/portraits/agnes-noxi-duo.svg",
      alt: "Agnes and Noxi posed together inside a circular portrait frame with opposing lighting.",
    },
    bloomClassName: styles.bloomDuo,
    angel: {
      description:
        "Luminous angel bust facing forward with wings framing the left edge of the frame.",
    },
    demon: {
      description:
        "Violet demon bust leaning inward with curved horns catching the rim lighting on the right.",
    },
  },
  "angel-leading": {
    label: "Angel steps forward while the demon softens into the rim light",
    image: {
      src: "/portraits/agnes-angel.svg",
      alt: "Agnes in angel form leaning forward with wings glowing inside a soft neon frame.",
      className: styles.imageAngel,
    },
    bloomClassName: styles.bloomAngel,
    angel: {
      description:
        "Angel bust leading the frame with wings swept wide and haloed highlights toward the viewer.",
    },
    demon: {
      description:
        "Demon bust recessed behind the angel, horns still outlined by the accent glow.",
    },
  },
  "demon-leading": {
    label: "Demon steps into focus while the angel supports from behind",
    image: {
      src: "/portraits/noxi-demon.svg",
      alt: "Noxi in demon form stepping into the spotlight with neon magenta bloom.",
      className: styles.imageDemon,
    },
    bloomClassName: styles.bloomDemon,
    angel: {
      description:
        "Angel bust easing back with wings diffused while keeping the left rim illuminated.",
    },
    demon: {
      description:
        "Demon bust leading the pose with forward-set horns and a saturated rim highlight.",
    },
  },
  "back-to-back": {
    label: "Angel and demon posed back to back with crossed silhouettes",
    stageClassName: styles.stageBackToBack,
    image: {
      src: "/portraits/agnes-noxi-duo.svg",
      alt: "Agnes and Noxi posed back to back with complimentary lighting inside a circular frame.",
      className: styles.imageDuoBackToBack,
    },
    bloomClassName: styles.bloomDuo,
    angel: {
      description:
        "Angel bust glancing over the shoulder with wings fanning outward across the left rim.",
    },
    demon: {
      description:
        "Demon bust rotated outward with horns arcing above the right edge of the frame.",
    },
  },
};

export function PortraitFrame({
  pose = "duo",
  transparentBackground = false,
  pulse = false,
  className,
  priority = false,
}: PortraitFrameProps) {
  const config = poseConfigs[pose];
  const figureId = React.useId();
  const angelId = React.useId();
  const demonId = React.useId();

  return (
    <AvatarFrame
      as="figure"
      frame
      size="lg"
      role="img"
      aria-labelledby={`${figureId} ${angelId} ${demonId}`}
      className={cn(styles.root, className)}
      rimClassName={styles.rim}
      glowClassName={styles.glow}
      innerClassName={cn(
        styles.inner,
        transparentBackground && styles.innerTransparent,
      )}
      media={
        <Image
          src={withBasePath(config.image.src)}
          alt={config.image.alt}
          width={1024}
          height={1024}
          className={cn(styles.portraitImage, config.image.className)}
          priority={priority}
        />
      }
      after={
        pulse ? (
          <span
            aria-hidden
            className={cn(styles.pulseRing, styles.pulseRingActive)}
          />
        ) : null
      }
      before={
        <>
          <span id={figureId} className="sr-only">
            {config.label}
          </span>
          <span id={angelId} className="sr-only">
            {config.angel.description}
          </span>
          <span id={demonId} className="sr-only">
            {config.demon.description}
          </span>
        </>
      }
    >
      <span aria-hidden className={styles.rimLighting} />
      <span
        aria-hidden
        className={cn(styles.bloom, config.bloomClassName)}
      />
      <div
        aria-hidden
        className={cn(
          styles.stage,
          config.stageClassName,
          transparentBackground && styles.stageTransparent,
        )}
      />
    </AvatarFrame>
  );
}
