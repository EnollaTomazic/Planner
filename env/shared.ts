import { SAFE_MODE_FALLBACK } from "./schema";

const inlineSafeMode = process.env.NEXT_PUBLIC_SAFE_MODE;

export function resolveProcessEnv(
  source?: NodeJS.ProcessEnv,
): NodeJS.ProcessEnv {
  if (source) {
    return source;
  }

  if (typeof process !== "undefined") {
    return process.env as NodeJS.ProcessEnv;
  }

  return {} as NodeJS.ProcessEnv;
}

export function ensureClientSafeMode(
  source: NodeJS.ProcessEnv,
): NodeJS.ProcessEnv {
  if (source.NEXT_PUBLIC_SAFE_MODE !== undefined) {
    return source;
  }

  const resolvedSafeMode = inlineSafeMode ?? SAFE_MODE_FALLBACK;

  const setProcessEnvValue = (key: keyof NodeJS.ProcessEnv, value: string) => {
    if (typeof process === "undefined") {
      return;
    }

    Reflect.set(process.env, key, value);
  };

  const nextEnv: NodeJS.ProcessEnv = {
    ...source,
    NEXT_PUBLIC_SAFE_MODE: resolvedSafeMode,
  };

  const shouldMirrorSafeMode = !source.SAFE_MODE || !source.SAFE_MODE.trim();

  if (shouldMirrorSafeMode) {
    nextEnv.SAFE_MODE = resolvedSafeMode;
  }

  if (typeof process !== "undefined" && source === process.env) {
    setProcessEnvValue("NEXT_PUBLIC_SAFE_MODE", resolvedSafeMode);

    if (shouldMirrorSafeMode) {
      setProcessEnvValue("SAFE_MODE", resolvedSafeMode);
    }
  }

  if (
    inlineSafeMode === undefined &&
    typeof console !== "undefined" &&
    typeof console.warn === "function"
  ) {
    console.warn(
      '[env] NEXT_PUBLIC_SAFE_MODE was missing; defaulting to "true" so the runtime keeps stricter guardrails.',
    );
  }

  return nextEnv;
}
