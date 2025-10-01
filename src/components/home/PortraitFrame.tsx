import * as React from "react";
import { cn } from "@/lib/utils";
import frameStyles from "./HeroPortraitFrame.module.css";
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
  className?: string;
}

type CharacterConfig = {
  className: string;
  description: string;
};

type PoseConfig = {
  label: string;
  stageClassName?: string;
  angel: CharacterConfig;
  demon: CharacterConfig;
};

const poseConfigs: Record<PoseVariant, PoseConfig> = {
  duo: {
    label: "Angel and demon busts sharing a circular portrait frame",
    angel: {
      className: cn(styles.poseDuoAngel, styles.layerFront),
      description:
        "Luminous angel bust facing forward with wings framing the left edge of the frame.",
    },
    demon: {
      className: cn(styles.poseDuoDemon, styles.layerRear),
      description:
        "Violet demon bust leaning inward with curved horns catching the rim lighting on the right.",
    },
  },
  "angel-leading": {
    label: "Angel steps forward while the demon softens into the rim light",
    angel: {
      className: cn(styles.poseAngelLeadingAngel, styles.layerFront),
      description:
        "Angel bust leading the frame with wings swept wide and haloed highlights toward the viewer.",
    },
    demon: {
      className: cn(styles.poseAngelLeadingDemon, styles.layerRear, styles.layerDimmed),
      description:
        "Demon bust recessed behind the angel, horns still outlined by the accent glow.",
    },
  },
  "demon-leading": {
    label: "Demon steps into focus while the angel supports from behind",
    angel: {
      className: cn(styles.poseDemonLeadingAngel, styles.layerRear, styles.layerDimmed),
      description:
        "Angel bust easing back with wings diffused while keeping the left rim illuminated.",
    },
    demon: {
      className: cn(styles.poseDemonLeadingDemon, styles.layerFront),
      description:
        "Demon bust leading the pose with forward-set horns and a saturated rim highlight.",
    },
  },
  "back-to-back": {
    label: "Angel and demon posed back to back with crossed silhouettes",
    stageClassName: styles.stageBackToBack,
    angel: {
      className: cn(styles.poseBackToBackAngel, styles.layerFront),
      description:
        "Angel bust glancing over the shoulder with wings fanning outward across the left rim.",
    },
    demon: {
      className: cn(styles.poseBackToBackDemon, styles.layerFront),
      description:
        "Demon bust rotated outward with horns arcing above the right edge of the frame.",
    },
  },
};

export default function PortraitFrame({
  pose = "duo",
  transparentBackground = false,
  className,
}: PortraitFrameProps) {
  const config = poseConfigs[pose];
  const figureId = React.useId();
  const angelId = React.useId();
  const demonId = React.useId();

  return (
    <figure
      role="img"
      aria-labelledby={`${figureId} ${angelId} ${demonId}`}
      className={cn(
        "relative isolate flex shrink-0 items-center justify-center",
        frameStyles.framed,
        className,
      )}
    >
      <span id={figureId} className="sr-only">
        {config.label}
      </span>
      <span id={angelId} className="sr-only">
        {config.angel.description}
      </span>
      <span id={demonId} className="sr-only">
        {config.demon.description}
      </span>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-[calc(var(--portrait-rim)*1.6)] rounded-full blur-[var(--hero-illustration-blur,var(--portrait-glow))] opacity-[var(--hero-illustration-opacity,0.8)]",
          frameStyles.glow,
        )}
      />
      <span
        aria-hidden
        className="glitch-rail pointer-events-none absolute -inset-[calc(var(--portrait-rim)*1.1)] rounded-full mix-blend-screen opacity-[var(--glitch-intensity-hero-rail,0.74)]"
      />
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full shadow-depth-outer",
          frameStyles.rim,
        )}
      >
        <div
          className={cn(
            "relative flex h-full w-full items-center justify-center overflow-hidden rounded-full",
            frameStyles.inner,
            transparentBackground && styles.innerTransparent,
          )}
        >
          <span aria-hidden className={styles.rimLighting} />
          <div
            aria-hidden
            className={cn(
              styles.stage,
              config.stageClassName,
              transparentBackground && styles.stageTransparent,
            )}
          >
            <div className={cn(styles.character, styles.angel, config.angel.className)}>
              <span aria-hidden className={styles.angelWings} />
              <span aria-hidden className={styles.characterBody} />
              <span aria-hidden className={styles.characterCollar} />
              <span aria-hidden className={styles.characterHead} />
            </div>
            <div className={cn(styles.character, styles.demon, config.demon.className)}>
              <span aria-hidden className={styles.demonHorns} />
              <span aria-hidden className={styles.characterBody} />
              <span aria-hidden className={styles.characterCollar} />
              <span aria-hidden className={styles.characterHead} />
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
