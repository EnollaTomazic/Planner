import { serverEnvSchema, type ServerEnv } from "./schema";
import { ensureClientSafeMode, resolveProcessEnv } from "./shared";

function withSafeModeFallback(source: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const envWithFallback = ensureClientSafeMode(source);

  if (envWithFallback.SAFE_MODE !== undefined) {
    return envWithFallback;
  }

  const safeModeKey = "SAFE_MODE";

  const nextEnv: NodeJS.ProcessEnv = {
    ...envWithFallback,
    [safeModeKey]: envWithFallback.NEXT_PUBLIC_SAFE_MODE,
  };

  if (typeof process !== "undefined" && source === process.env) {
    process.env[safeModeKey] = nextEnv[safeModeKey];
  }

  return nextEnv;
}

export function loadServerEnv(source?: NodeJS.ProcessEnv): ServerEnv {
  const envSource = withSafeModeFallback(resolveProcessEnv(source));

  return serverEnvSchema.parse({
    GITHUB_PAGES: envSource.GITHUB_PAGES,
    NEXT_PHASE: envSource.NEXT_PHASE,
    NODE_ENV: envSource.NODE_ENV,
    SAFE_MODE: envSource.SAFE_MODE,
    SENTRY_DSN: envSource.SENTRY_DSN,
    SENTRY_ENVIRONMENT: envSource.SENTRY_ENVIRONMENT,
    SENTRY_TRACES_SAMPLE_RATE: envSource.SENTRY_TRACES_SAMPLE_RATE,
    SKIP_PREVIEW_STATIC: envSource.SKIP_PREVIEW_STATIC,
  });
}

export default loadServerEnv;
