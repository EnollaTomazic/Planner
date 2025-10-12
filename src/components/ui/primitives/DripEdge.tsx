import * as React from "react";

import { cn } from "@/lib/utils";

import type { GlitchOverlayToken } from "./BlobContainer";
import styles from "./DripEdge.module.css";

type DripTone = "primary" | "accent" | "info" | "danger" | "surface";

type StyleWithVars = React.CSSProperties & {
  "--drip-edge-stop-1"?: string;
  "--drip-edge-stop-2"?: string;
  "--drip-edge-stop-3"?: string;
  "--drip-edge-alpha-1"?: string;
  "--drip-edge-alpha-2"?: string;
  "--drip-edge-alpha-3"?: string;
};

export type DripEdgeProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "style"
> & {
  tone?: DripTone;
  overlayToken?: GlitchOverlayToken;
  style?: React.CSSProperties;
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

const resolveToneStops = (tone: DripTone) => toneStops[tone] ?? toneStops.surface;

const DripEdge = React.forwardRef<HTMLSpanElement, DripEdgeProps>(
  (
    {
      className,
      tone = "surface",
      overlayToken = "glitch-overlay-button-opacity",
      style,
      ...rest
    },
    ref,
  ) => {
    const [stop1, stop2, stop3] = resolveToneStops(tone);
    const overlayVar = `var(--${overlayToken})`;

    const mergedStyle: StyleWithVars = {
      ...(style as StyleWithVars | undefined),
      "--drip-edge-stop-1": `var(${stop1})`,
      "--drip-edge-stop-2": `var(${stop2})`,
      "--drip-edge-stop-3": `var(${stop3})`,
    };

    if (!mergedStyle["--drip-edge-alpha-1"]) {
      mergedStyle["--drip-edge-alpha-1"] = overlayVar;
    }
    if (!mergedStyle["--drip-edge-alpha-2"]) {
      mergedStyle["--drip-edge-alpha-2"] = overlayVar;
    }
    if (!mergedStyle["--drip-edge-alpha-3"]) {
      mergedStyle["--drip-edge-alpha-3"] = overlayVar;
    }

    return (
      <span
        {...rest}
        ref={ref}
        aria-hidden
        className={cn(styles.root, className)}
        style={mergedStyle}
      />
    );
  },
);

DripEdge.displayName = "DripEdge";
export { DripEdge };
