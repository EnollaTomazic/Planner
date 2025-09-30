export type DesignTokenCategory =
  | "color"
  | "state"
  | "spacing"
  | "radius"
  | "typography"
  | "shadow"
  | "z"
  | "motion";

export interface DesignTokenMeta {
  readonly name: string;
  readonly cssVar: string;
  readonly originalName: string;
  readonly value: string;
  readonly category: DesignTokenCategory;
  readonly search: string;
}

export interface DesignTokenGroup {
  readonly id: DesignTokenCategory;
  readonly label: string;
  readonly tokens: readonly DesignTokenMeta[];
}

export const DESIGN_TOKEN_CATEGORY_ORDER: readonly DesignTokenCategory[] = [
  "color",
  "state",
  "spacing",
  "radius",
  "typography",
  "shadow",
  "z",
  "motion",
] as const;

export const DESIGN_TOKEN_CATEGORY_LABELS: Record<DesignTokenCategory, string> = {
  color: "Color",
  state: "State",
  spacing: "Spacing",
  radius: "Radius",
  typography: "Typography",
  shadow: "Shadow",
  z: "Z-index",
  motion: "Motion",
};

const EXACT_CATEGORY_OVERRIDES = new Map<string, DesignTokenCategory>([
  ["shadow-color", "color"],
  ["glow-strong", "color"],
  ["glow-soft", "color"],
  ["blob-radius-soft", "radius"],
]);

const SPACING_SPECIFIC_NAMES = new Set<string>([
  "control-px",
  "header-stack",
  "hairline-w",
  "neo-depth-sm",
  "neo-depth-md",
  "neo-depth-lg",
]);

const MOTION_PREFIXES = ["ease-", "dur-", "motion-"];

const TYPOGRAPHY_SUFFIXES = ["-fs"];

const SHADOW_NAMES = new Set<string>(["shadow"]);

const STATE_TOKEN_KEYWORDS = ["disabled", "loading", "visually-hidden"];

const isStateUtilityValue = (value: string): boolean => {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return false;
  }

  if (!/^\d*(?:\.\d+)?$/.test(value)) {
    return false;
  }

  return numericValue > 0 && numericValue < 1;
};

const toCssVarIdentifier = (original: string): string => {
  const hyphenated = original
    .replace(/([A-Z])/g, "-$1")
    .replace(/([0-9]+)/g, "-$1")
    .replace(/^-/, "")
    .toLowerCase();

  return hyphenated
    .replace(/-0([0-9]+)/g, (_match, digits: string) => `-0-${digits}`)
    .replace(/-{2,}/g, "-")
    .replace(/^-/, "");
};

const categorizeDesignToken = (
  name: string,
  value: string,
): DesignTokenCategory => {
  const exact = EXACT_CATEGORY_OVERRIDES.get(name);
  if (exact) {
    return exact;
  }

  const normalizedName = name.toLowerCase();

  if (
    STATE_TOKEN_KEYWORDS.some((keyword) => normalizedName.includes(keyword)) ||
    isStateUtilityValue(value)
  ) {
    return "state";
  }

  if (MOTION_PREFIXES.some((prefix) => name.startsWith(prefix))) {
    return "motion";
  }

  if (name.startsWith("z-")) {
    return "z";
  }

  if (name.startsWith("radius-") || name.endsWith("-radius")) {
    return "radius";
  }

  if (
    name.startsWith("spacing-") ||
    name.startsWith("space-") ||
    name.startsWith("control-h") ||
    SPACING_SPECIFIC_NAMES.has(name)
  ) {
    return "spacing";
  }

  if (
    name.startsWith("font-") ||
    TYPOGRAPHY_SUFFIXES.some((suffix) => name.endsWith(suffix))
  ) {
    return "typography";
  }

  if (
    SHADOW_NAMES.has(name) ||
    name.startsWith("shadow-") ||
    name.endsWith("-shadow")
  ) {
    return "shadow";
  }

  if (value.includes("cubic-bezier") || value.includes("ms")) {
    return "motion";
  }

  return "color";
};

export const buildDesignTokenGroups = (
  tokens: Record<string, string>,
): readonly DesignTokenGroup[] => {
  const groups = new Map<DesignTokenCategory, DesignTokenMeta[]>();

  for (const category of DESIGN_TOKEN_CATEGORY_ORDER) {
    groups.set(category, []);
  }

  for (const [originalName, rawValue] of Object.entries(tokens)) {
    const value = rawValue.trim();
    const name = toCssVarIdentifier(originalName);
    const category = categorizeDesignToken(name, value);
    const cssVar = `--${name}`;
    const search = [name, cssVar, value, originalName, category]
      .join(" ")
      .toLowerCase();

    const bucket = groups.get(category);
    if (!bucket) {
      continue;
    }

    bucket.push({
      name,
      cssVar,
      originalName,
      value,
      category,
      search,
    });
  }

  const result: DesignTokenGroup[] = [];

  for (const category of DESIGN_TOKEN_CATEGORY_ORDER) {
    const bucket = groups.get(category);
    if (!bucket || bucket.length === 0) {
      continue;
    }

    bucket.sort((a, b) => a.name.localeCompare(b.name));

    result.push({
      id: category,
      label: DESIGN_TOKEN_CATEGORY_LABELS[category],
      tokens: bucket as readonly DesignTokenMeta[],
    });
  }

  return result;
};

