export const UI_VARIANTS = [
  "default",
  "soft",
  "ghost",
  "neo",
  "minimal",
  "glitch",
] as const;

export type UIVariant = (typeof UI_VARIANTS)[number];

export const UI_VARIANT_ALIASES = {
  plain: "default",
  primary: "default",
  secondary: "soft",
} as const satisfies Record<string, UIVariant>;

export type DeprecatedUIVariant = keyof typeof UI_VARIANT_ALIASES;

export type AnyUIVariant = UIVariant | DeprecatedUIVariant;

export function normalizeUIVariant(
  variant: AnyUIVariant | null | undefined,
): UIVariant | undefined {
  if (!variant) {
    return undefined;
  }

  if ((UI_VARIANTS as readonly string[]).includes(variant)) {
    return variant as UIVariant;
  }

  if (variant in UI_VARIANT_ALIASES) {
    const mapped = UI_VARIANT_ALIASES[variant as DeprecatedUIVariant];
    return mapped;
  }

  return undefined;
}

export function resolveUIVariant<Allowed extends UIVariant>(
  variant: AnyUIVariant | null | undefined,
  options: { allowed: readonly Allowed[]; fallback: Allowed },
): Allowed {
  const normalized = normalizeUIVariant(variant);

  if (normalized && options.allowed.includes(normalized as Allowed)) {
    return normalized as Allowed;
  }

  return options.fallback;
}
