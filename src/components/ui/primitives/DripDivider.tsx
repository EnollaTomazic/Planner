import * as React from "react";

import { cn } from "@/lib/utils";

import type { GlitchOverlayToken } from "./BlobContainer";
import styles from "./DripDivider.module.css";

type DripDividerTone = "surface" | "primary" | "accent" | "info" | "danger";

type StyleWithVars = React.CSSProperties & {
  "--drip-divider-stop-1"?: string;
  "--drip-divider-stop-2"?: string;
  "--drip-divider-stop-3"?: string;
  "--drip-divider-alpha-1"?: string;
  "--drip-divider-alpha-2"?: string;
  "--drip-divider-alpha-3"?: string;
  "--drip-divider-height"?: string;
};

export interface DripDividerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  tone?: DripDividerTone;
  overlayToken?: GlitchOverlayToken;
  style?: StyleWithVars;
}

const toneStops: Record<DripDividerTone, readonly [string, string, string]> = {
  surface: [
    "--backdrop-drip-1",
    "--backdrop-drip-2",
    "--backdrop-drip-3",
  ],
  primary: ["--primary", "--primary", "--primary"],
  accent: ["--accent", "--accent", "--accent"],
  info: ["--accent-2", "--accent-2", "--accent-2"],
  danger: ["--danger", "--danger", "--danger"],
};

const resolveToneStops = (tone: DripDividerTone) => toneStops[tone] ?? toneStops.surface;

const DripDivider = React.forwardRef<HTMLDivElement, DripDividerProps>(
  (
    { tone = "surface", overlayToken = "glitch-overlay-opacity-card", className, style, ...rest },
    ref,
  ) => {
    const [stop1, stop2, stop3] = resolveToneStops(tone);
    const overlayVar = `var(--${overlayToken})`;

    const mergedStyle: StyleWithVars = {
      ...(style ?? {}),
      "--drip-divider-stop-1": `var(${stop1})`,
      "--drip-divider-stop-2": `var(${stop2})`,
      "--drip-divider-stop-3": `var(${stop3})`,
    };

    if (!mergedStyle["--drip-divider-alpha-1"]) {
      mergedStyle["--drip-divider-alpha-1"] = overlayVar;
    }
    if (!mergedStyle["--drip-divider-alpha-2"]) {
      mergedStyle["--drip-divider-alpha-2"] = overlayVar;
    }
    if (!mergedStyle["--drip-divider-alpha-3"]) {
      mergedStyle["--drip-divider-alpha-3"] = overlayVar;
    }

    return (
      <div
        {...rest}
        ref={ref}
        role="separator"
        aria-orientation="horizontal"
        className={cn(styles.root, className)}
        style={mergedStyle}
      />
    );
  },
);

DripDivider.displayName = "DripDivider";

export default DripDivider;
