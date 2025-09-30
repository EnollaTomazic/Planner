import * as React from "react";

import { cn } from "@/lib/utils";

import type { GlitchOverlayToken } from "./BlobContainer";
import styles from "./DripDivider.module.css";

type DripTone = "primary" | "accent" | "info" | "danger" | "surface";

type StyleWithVars = React.CSSProperties & {
  "--drip-divider-stop-1"?: string;
  "--drip-divider-stop-2"?: string;
  "--drip-divider-stop-3"?: string;
  "--drip-divider-alpha-1"?: string;
  "--drip-divider-alpha-2"?: string;
  "--drip-divider-alpha-3"?: string;
  "--drip-divider-thickness"?: string;
  "--drip-divider-angle"?: string;
};

const toneStops: Record<DripTone, [string, string, string]> = {
  primary: ["--primary", "--primary", "--primary"],
  accent: ["--accent", "--accent", "--accent"],
  info: ["--accent-2", "--accent-2", "--accent-2"],
  danger: ["--danger", "--danger", "--danger"],
  surface: [
    "--backdrop-drip-1",
    "--backdrop-drip-2",
    "--backdrop-drip-3",
  ],
};

const thicknessTokens = {
  hairline: "var(--hairline-w)",
  sm: "var(--spacing-0-5)",
  md: "var(--space-1)",
} as const;

export interface DripDividerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  tone?: DripTone;
  overlayToken?: GlitchOverlayToken;
  orientation?: "horizontal" | "vertical";
  thickness?: keyof typeof thicknessTokens;
  animated?: boolean;
  style?: React.CSSProperties;
}

const resolveToneStops = (tone: DripTone) => toneStops[tone] ?? toneStops.surface;

const DripDivider = React.forwardRef<HTMLDivElement, DripDividerProps>(
  (
    {
      className,
      tone = "surface",
      overlayToken = "glitch-overlay-button-opacity",
      orientation = "horizontal",
      thickness = "hairline",
      animated = true,
      style,
      ...rest
    },
    ref,
  ) => {
    const [stop1, stop2, stop3] = resolveToneStops(tone);
    const overlayVar = `var(--${overlayToken})`;
    const resolvedThickness = thicknessTokens[thickness] ?? thicknessTokens.hairline;

    const mergedStyle: StyleWithVars = {
      ...(style as StyleWithVars | undefined),
      "--drip-divider-stop-1": `var(${stop1})`,
      "--drip-divider-stop-2": `var(${stop2})`,
      "--drip-divider-stop-3": `var(${stop3})`,
      "--drip-divider-alpha-1": overlayVar,
      "--drip-divider-alpha-2": overlayVar,
      "--drip-divider-alpha-3": overlayVar,
      "--drip-divider-thickness": resolvedThickness,
    };

    if (orientation === "vertical") {
      mergedStyle["--drip-divider-angle"] = "180deg";
    }

    return (
      <div
        {...rest}
        ref={ref}
        aria-hidden
        className={cn(styles.root, className)}
        data-orientation={orientation}
        data-animated={animated ? "true" : undefined}
        style={mergedStyle}
      >
        <span className={styles.inner} />
      </div>
    );
  },
);

DripDivider.displayName = "DripDivider";

export default DripDivider;
