import { tailwindColorPalette } from "./theme/colors";

type ColorValue = string | { [key: string]: ColorValue };

const flattenColorTokens = (
  value: { [key: string]: ColorValue },
  path: string[] = [],
): string[] =>
  Object.entries(value).flatMap(([key, entry]) => {
    if (typeof entry === "string") {
      const segments = [...path];
      if (key !== "DEFAULT") {
        segments.push(key);
      }
      const token = segments.join("-");
      return token ? [`bg-${token}`] : [];
    }

    if (entry && typeof entry === "object") {
      const nextPath = key === "DEFAULT" ? path : [...path, key];
      return flattenColorTokens(entry as { [key: string]: ColorValue }, nextPath);
    }

    return [];
  });

export const colorTokens = flattenColorTokens(tailwindColorPalette);

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
