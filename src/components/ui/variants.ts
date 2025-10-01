export const CONTROL_VARIANTS = [
  "default",
  "ghost",
  "neo",
  "minimal",
  "glitch",
] as const;

export type ControlVariant = (typeof CONTROL_VARIANTS)[number];

export const CONTROL_VARIANT_ALIASES = {
  plain: "default",
  primary: "default",
  secondary: "neo",
  soft: "neo",
} as const satisfies Record<string, ControlVariant>;

export type DeprecatedControlVariant = keyof typeof CONTROL_VARIANT_ALIASES;

export type AnyControlVariant = ControlVariant | DeprecatedControlVariant;

export function normalizeControlVariant(
  variant: AnyControlVariant | null | undefined,
): ControlVariant | undefined {
  if (!variant) {
    return undefined;
  }

  if ((CONTROL_VARIANTS as readonly string[]).includes(variant)) {
    return variant as ControlVariant;
  }

  if (variant in CONTROL_VARIANT_ALIASES) {
    const mapped = CONTROL_VARIANT_ALIASES[variant as DeprecatedControlVariant];
    return mapped;
  }

  return undefined;
}

export function resolveControlVariant<Allowed extends ControlVariant>(
  variant: AnyControlVariant | null | undefined,
  options: { allowed: readonly Allowed[]; fallback: Allowed },
): Allowed {
  const normalized = normalizeControlVariant(variant);

  if (normalized && options.allowed.includes(normalized as Allowed)) {
    return normalized as Allowed;
  }

  return options.fallback;
}

// Backwards compatibility exports – remove once callers migrate to ControlVariant APIs.
export const UI_VARIANTS = CONTROL_VARIANTS;
export type UIVariant = ControlVariant;
export const UI_VARIANT_ALIASES = CONTROL_VARIANT_ALIASES;
export type DeprecatedUIVariant = DeprecatedControlVariant;
export type AnyUIVariant = AnyControlVariant;

export function normalizeUIVariant(
  variant: AnyUIVariant | null | undefined,
): UIVariant | undefined {
  return normalizeControlVariant(variant);
}

export function resolveUIVariant<Allowed extends UIVariant>(
  variant: AnyUIVariant | null | undefined,
  options: { allowed: readonly Allowed[]; fallback: Allowed },
): Allowed {
  return resolveControlVariant<Allowed>(variant, options);
}
