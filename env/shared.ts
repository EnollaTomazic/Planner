import { SAFE_MODE_FALLBACK, type ClientEnv, type ServerEnv } from "./schema";

export const CLIENT_ENV_KEYS = [
  "NEXT_PUBLIC_BASE_PATH",
  "NEXT_PUBLIC_DEPTH_THEME",
  "NEXT_PUBLIC_ENABLE_METRICS",
  "NEXT_PUBLIC_METRICS_ENDPOINT",
  "NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS",
  "NEXT_PUBLIC_ORGANIC_DEPTH",
  "NEXT_PUBLIC_SAFE_MODE",
  "NEXT_PUBLIC_SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_ENVIRONMENT",
  "NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE",
  "NEXT_PUBLIC_FEATURE_GLITCH_LANDING",
  "NEXT_PUBLIC_UI_GLITCH_LANDING",
] as const satisfies readonly (keyof ClientEnv)[];

export const SERVER_ENV_KEYS = [
  "GITHUB_PAGES",
  "NEXT_PHASE",
  "NODE_ENV",
  "SAFE_MODE",
  "SENTRY_DSN",
  "SENTRY_ENVIRONMENT",
  "SENTRY_TRACES_SAMPLE_RATE",
  "SKIP_PREVIEW_STATIC",
] as const satisfies readonly (keyof ServerEnv)[];

type EnvKeys = readonly string[];

type EnvRecord<K extends EnvKeys[number]> = Record<K, string | undefined>;

export function pickEnvValues<K extends EnvKeys[number]>(
  source: NodeJS.ProcessEnv,
  keys: readonly K[],
): EnvRecord<K> {
  return keys.reduce((accumulator, key) => {
    accumulator[key] = source[key];
    return accumulator;
  }, Object.create(null) as EnvRecord<K>);
}

export function createEnvSignature<K extends EnvKeys[number]>(
  values: EnvRecord<K>,
  keys: readonly K[],
): string {
  return keys
    .map((key) => `${key}:${values[key] ?? ""}`)
    .join("|");
}

interface SafeModeFallbackConfig {
  readonly targetKey: "SAFE_MODE" | "NEXT_PUBLIC_SAFE_MODE";
  readonly mirrorKey?: "SAFE_MODE" | "NEXT_PUBLIC_SAFE_MODE";
  readonly shouldWarn: boolean;
  readonly warningMessage: string;
  readonly mutateRuntime: boolean;
}

export function applySafeModeFallback(
  source: NodeJS.ProcessEnv,
  { targetKey, mirrorKey, shouldWarn, warningMessage, mutateRuntime }: SafeModeFallbackConfig,
): NodeJS.ProcessEnv {
  const env = mutateRuntime ? source : { ...source };

  const needsFallback = env[targetKey] === undefined;

  if (needsFallback) {
    env[targetKey] = SAFE_MODE_FALLBACK;

    if (mirrorKey && (!env[mirrorKey] || env[mirrorKey]!.trim().length === 0)) {
      env[mirrorKey] = SAFE_MODE_FALLBACK;
    }

    if (shouldWarn && typeof console !== "undefined" && typeof console.warn === "function") {
      console.warn(warningMessage);
    }
  }

  return env;
}

export function getRuntimeEnv(): {
  readonly env: NodeJS.ProcessEnv;
  readonly mutateRuntime: boolean;
} {
  if (typeof process !== "undefined") {
    return {
      env: process.env as NodeJS.ProcessEnv,
      mutateRuntime: true,
    };
  }

  return {
    env: Object.create(null) as NodeJS.ProcessEnv,
    mutateRuntime: false,
  };
}

export function handleRuntimeParseFailure(scope: "client" | "server", error: unknown): never {
  if (typeof console !== "undefined" && typeof console.error === "function") {
    console.error(`[env] Failed to load ${scope} environment variables.`, error);
  }

  if (
    typeof process !== "undefined" &&
    typeof process.exit === "function" &&
    process.env.NODE_ENV !== "test"
  ) {
    process.exit(1);
  }

  throw error;
}
