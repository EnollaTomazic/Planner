import loadClientEnvImpl from "./client";
import loadServerEnvImpl from "./server";
import {
  SAFE_MODE_FALLBACK,
  type ClientEnv,
  type ServerEnv,
} from "./schema";
import { ensureClientSafeMode, resolveProcessEnv } from "./shared";

let cachedClientEnv: ClientEnv | null = null;
let cachedServerEnv: ServerEnv | null = null;

export const loadClientEnv = loadClientEnvImpl;
export const loadServerEnv = loadServerEnvImpl;
export type { ClientEnv, ServerEnv };

export function resetClientEnvCache(): void {
  cachedClientEnv = null;
}

export function resetServerEnvCache(): void {
  cachedServerEnv = null;
}

export function resetEnvCaches(): void {
  resetClientEnvCache();
  resetServerEnvCache();
}

export function readClientEnv(): ClientEnv {
  if (cachedClientEnv) {
    return cachedClientEnv;
  }

  const prepared = ensureClientSafeMode(resolveProcessEnv());

  try {
    cachedClientEnv = loadClientEnvImpl(prepared);
    return cachedClientEnv;
  } catch (error) {
    console.error("[env] Failed to load client environment variables.", error);

    if (typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
      process.exitCode = 1;
    }

    throw error;
  }
}

export function readServerEnv(): ServerEnv {
  if (cachedServerEnv) {
    return cachedServerEnv;
  }

  try {
    cachedServerEnv = loadServerEnvImpl();
    return cachedServerEnv;
  } catch (error) {
    console.error("[env] Failed to load server environment variables.", error);

    if (typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
      process.exitCode = 1;
    }

    throw error;
  }
}

export { SAFE_MODE_FALLBACK };
