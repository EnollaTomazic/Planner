import { env } from "@/env/client";

export const CONTROL_VARIANTS = [
  "default",
  "quiet",
  "neo",
  "glitch",
] as const;

export type ControlVariant = (typeof CONTROL_VARIANTS)[number];

export const CONTROL_VARIANT_ALIASES = {
  soft: "neo",
  ghost: "quiet",
  minimal: "quiet",
  plain: "default",
  primary: "default",
  secondary: "neo",
} as const satisfies Record<string, ControlVariant>;

export type DeprecatedControlVariant = keyof typeof CONTROL_VARIANT_ALIASES;

export type AnyControlVariant = ControlVariant | DeprecatedControlVariant;

const warnedAliases = new Set<DeprecatedControlVariant>();

function warnDeprecatedAlias(alias: DeprecatedControlVariant, canonical: ControlVariant) {
  if (env.NODE_ENV === "production") {
    return;
  }

  if (warnedAliases.has(alias)) {
    return;
  }

  warnedAliases.add(alias);
  console.warn(
    `ui variant "${alias}" is deprecated. Use "${canonical}" instead.`,
  );
}

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
    const alias = variant as DeprecatedControlVariant;
    const mapped = CONTROL_VARIANT_ALIASES[alias];
    warnDeprecatedAlias(alias, mapped);
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

// Backwards-compatible exports. Prefer the `Control*` names above for new code.
export const UI_VARIANTS = CONTROL_VARIANTS;
export type UIVariant = ControlVariant;
export const UI_VARIANT_ALIASES = CONTROL_VARIANT_ALIASES;
export type DeprecatedUIVariant = DeprecatedControlVariant;
export type AnyUIVariant = AnyControlVariant;

export const normalizeUIVariant = normalizeControlVariant;
export const resolveUIVariant = resolveControlVariant;
