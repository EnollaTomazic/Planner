export const colorTokens = [
  "bg-border",
  "bg-border-subtle",
  "bg-border-strong",
  "bg-input",
  "bg-ring",
  "bg-ring-accent",
  "bg-background",
  "bg-foreground",
  "bg-card",
  "bg-surface",
  "bg-surface-muted",
  "bg-surface-raised",
  "bg-surface-hover",
  "bg-surface-foreground",
  "bg-surface-2",
  "bg-surface-2-foreground",
  "bg-panel",
  "bg-card-hairline",
  "bg-card-hairline-40",
  "bg-card-hairline-45",
  "bg-card-hairline-55",
  "bg-card-hairline-60",
  "bg-card-hairline-65",
  "bg-card-hairline-70",
  "bg-card-hairline-75",
  "bg-card-hairline-90",
  "bg-primary",
  "bg-primary-foreground",
  "bg-primary-soft",
  "bg-accent",
  "bg-accent-foreground",
  "bg-accent-soft",
  "bg-accent-overlay",
  "bg-on-accent",
  "bg-accent-3",
  "bg-accent-2",
  "bg-accent-2-foreground",
  "bg-glow",
  "bg-ring-muted",
  "bg-danger",
  "bg-danger-foreground",
  "bg-warning",
  "bg-warning-foreground",
  "bg-warning-soft",
  "bg-warning-soft-strong",
  "bg-success",
  "bg-success-foreground",
  "bg-success-soft",
  "bg-success-glow",
  "bg-tone-top",
  "bg-tone-jg",
  "bg-tone-mid",
  "bg-tone-bot",
  "bg-tone-sup",
  "bg-aurora-g",
  "bg-aurora-g-light",
  "bg-aurora-p",
  "bg-aurora-p-light",
  "bg-muted",
  "bg-muted-foreground",
  "bg-lav-deep",
  "bg-surface-vhs",
  "bg-surface-streak",
  "bg-card-foreground",
  "bg-interaction-primary-hover",
  "bg-interaction-primary-active",
  "bg-interaction-focus-hover",
  "bg-interaction-focus-active",
  "bg-interaction-focus-surfaceHover",
  "bg-interaction-focus-surfaceActive",
  "bg-interaction-focus-tintHover",
  "bg-interaction-focus-tintActive",
  "bg-interaction-accent-hover",
  "bg-interaction-accent-active",
  "bg-interaction-accent-surfaceHover",
  "bg-interaction-accent-surfaceActive",
  "bg-interaction-accent-tintHover",
  "bg-interaction-accent-tintActive",
  "bg-interaction-info-hover",
  "bg-interaction-info-active",
  "bg-interaction-info-surfaceHover",
  "bg-interaction-info-surfaceActive",
  "bg-interaction-info-tintHover",
  "bg-interaction-info-tintActive",
  "bg-interaction-danger-hover",
  "bg-interaction-danger-active",
  "bg-interaction-danger-surfaceHover",
  "bg-interaction-danger-surfaceActive",
  "bg-interaction-danger-tintHover",
  "bg-interaction-danger-tintActive",
  "bg-interaction-foreground-tintHover",
  "bg-interaction-foreground-tintActive",
  "bg-ring-contrast",
];

export const spacingTokens = [4, 8, 12, 16, 24, 32, 48, 64];

export const shellWidthToken = "--shell-width";

const ringEntries = [
  ["xs", { diameter: spacingTokens[4], stroke: spacingTokens[0] }],
  ["s", { diameter: spacingTokens[5], stroke: spacingTokens[0] }],
  ["m", { diameter: spacingTokens[7], stroke: spacingTokens[0] }],
  ["l", { diameter: spacingTokens[7] * 3.5, stroke: spacingTokens[0] }],
] as const;

type RingEntry = (typeof ringEntries)[number];
export type RingSize = RingEntry[0];

const ringTokenMap: Record<
  RingSize,
  { diameter: `--ring-diameter-${RingSize}`; stroke: `--ring-stroke-${RingSize}` }
> = ringEntries.reduce(
  (acc, [token]) => {
    acc[token] = {
      diameter: `--ring-diameter-${token}` as const,
      stroke: `--ring-stroke-${token}` as const,
    };
    return acc;
  },
  {} as Record<
    RingSize,
    { diameter: `--ring-diameter-${RingSize}`; stroke: `--ring-stroke-${RingSize}` }
  >,
);

const ringFallbacks: Record<
  RingSize,
  { diameter: number; stroke: number; inset: number }
> = ringEntries.reduce(
  (acc, [token, { diameter, stroke }]) => {
    acc[token] = {
      diameter,
      stroke,
      inset: spacingTokens[2] / 2,
    };
    return acc;
  },
  {} as Record<RingSize, { diameter: number; stroke: number; inset: number }>,
);

export interface RingMetrics {
  diameter: number;
  stroke: number;
  inset: number;
}

export const getRingMetrics = (
  size: RingSize,
  overrides?: Partial<RingMetrics>,
): RingMetrics => {
  const tokens = ringTokenMap[size];
  const fallback = ringFallbacks[size];
  const diameterFallback = overrides?.diameter ?? fallback.diameter;
  const strokeFallback = overrides?.stroke ?? fallback.stroke;
  const insetFallback = overrides?.inset ?? fallback.inset;
  const diameter = readNumberToken(tokens.diameter, diameterFallback);
  const stroke = readNumberToken(tokens.stroke, strokeFallback);
  const inset = readNumberToken(
    `--ring-inset-${size}`,
    readNumberToken("--ring-inset", insetFallback),
  );

  return {
    diameter,
    stroke,
    inset,
  };
};

const radiusEntries = [
  ["sm", 6],
  ["md", 8],
  ["lg", 12],
  ["xl", 16],
  ["2xl", 24],
  ["full", 9999],
] as const;

type RadiusKey = (typeof radiusEntries)[number][0];
type RadiusVar = `--radius-${RadiusKey}`;

export const radiusScale: Record<RadiusKey, number> = radiusEntries.reduce(
  (acc, [token, value]) => {
    acc[token] = value;
    return acc;
  },
  {} as Record<RadiusKey, number>,
);

export const radiusTokens = radiusEntries.map(
  ([token]) => `--radius-${token}` as RadiusVar,
);

export const radiusValues: Record<RadiusVar, string> = radiusEntries.reduce(
  (acc, [token, value]) => {
    const variable = `--radius-${token}` as RadiusVar;
    acc[variable] = `${value}px`;
    return acc;
  },
  {} as Record<RadiusVar, string>,
);

const parseCssNumber = (value: string): number | null => {
  if (!value) {
    return null;
  }
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : null;
};

export const readNumberToken = (token: string, fallback: number): number => {
  if (typeof document === "undefined") {
    return fallback;
  }

  const root = document.documentElement;
  const computed = getComputedStyle(root).getPropertyValue(token).trim();
  const resolved = parseCssNumber(computed);

  if (resolved !== null) {
    return resolved;
  }

  return fallback;
};
