export const colorTokens = [
  "bg-border",
  "bg-input",
  "bg-ring",
  "bg-background",
  "bg-foreground",
  "bg-card",
  "bg-panel",
  "bg-card-hairline",
  "bg-primary",
  "bg-accent",
  "bg-accent-2",
  "bg-glow",
  "bg-ring-muted",
  "bg-danger",
  "bg-warning",
  "bg-success",
  "bg-aurora-g",
  "bg-aurora-g-light",
  "bg-aurora-p",
  "bg-aurora-p-light",
  "bg-muted",
  "bg-lav-deep",
  "bg-surface-vhs",
  "bg-surface-streak",
  "bg-card-foreground",
  "bg-accent-foreground",
  "bg-destructive",
  "bg-destructive-foreground",
];

export const spacingTokens = [4, 8, 12, 16, 24, 32, 48, 64];

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
