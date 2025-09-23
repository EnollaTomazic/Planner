export const colorTokens = [
  "bg-border",
  "bg-input",
  "bg-ring",
  "bg-background",
  "bg-foreground",
  "bg-card",
  "bg-surface",
  "bg-surface-foreground",
  "bg-surface-2",
  "bg-surface-2-foreground",
  "bg-panel",
  "bg-card-hairline",
  "bg-primary",
  "bg-primary-foreground",
  "bg-primary-soft",
  "bg-accent",
  "bg-accent-foreground",
  "bg-accent-soft",
  "bg-accent-overlay",
  "bg-accent-3",
  "bg-accent-2",
  "bg-accent-2-foreground",
  "bg-glow",
  "bg-ring-muted",
  "bg-danger",
  "bg-danger-foreground",
  "bg-warning",
  "bg-warning-soft",
  "bg-warning-soft-strong",
  "bg-success",
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
];

export const spacingTokens = [4, 8, 12, 16, 24, 32, 48, 64];

export const shellWidthToken = "--shell-width";

const radiusEntries = [
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
