import { SAFE_MODE_FALLBACK } from "./schema";

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

  const nextEnv: NodeJS.ProcessEnv = {
    ...source,
    NEXT_PUBLIC_SAFE_MODE: SAFE_MODE_FALLBACK,
  };

  if (!source.SAFE_MODE || !source.SAFE_MODE.trim()) {
    nextEnv.SAFE_MODE = SAFE_MODE_FALLBACK;
  }

  if (typeof process !== "undefined" && source === process.env) {
    process.env.NEXT_PUBLIC_SAFE_MODE = SAFE_MODE_FALLBACK;

    if (!process.env.SAFE_MODE || !process.env.SAFE_MODE.trim()) {
      process.env.SAFE_MODE = SAFE_MODE_FALLBACK;
    }
  }

  if (typeof console !== "undefined" && typeof console.warn === "function") {
    console.warn(
      '[env] NEXT_PUBLIC_SAFE_MODE was missing; defaulting to "true" so the runtime keeps stricter guardrails.',
    );
  }

  return nextEnv;
}
