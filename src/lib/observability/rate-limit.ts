// src/lib/observability/rate-limit.ts
// Sliding window rate limiting helpers for API routes.

export type RateLimitConfig = {
  /** Maximum number of requests allowed within the window. */
  max: number;
  /** Duration of the window in milliseconds. */
  windowMs: number;
  /** Override the timestamp used for calculations. Intended for tests. */
  now?: number;
};

export type RateLimitResult = {
  limited: boolean;
  remaining: number;
  reset: number;
};

type Bucket = {
  remaining: number;
  reset: number;
};

const buckets = new Map<string, Bucket>();

function getTimestamp(config: RateLimitConfig): number {
  return typeof config.now === "number" ? config.now : Date.now();
}

/**
 * Consume a single token for the provided identifier and return the limiter status.
 * Uses a naive in-memory sliding window that is sufficient for single-process deployments
 * (our static export and local dev environments). For multi-region deploys, swap the map
 * implementation with a distributed store.
 */
export function consumeRateLimit(
  identifier: string,
  config: RateLimitConfig,
): RateLimitResult {
  const normalizedId = identifier.trim() || "anonymous";
  const now = getTimestamp(config);
  const existing = buckets.get(normalizedId);

  if (!existing || existing.reset <= now) {
    const reset = now + config.windowMs;
    const remaining = Math.max(config.max - 1, 0);
    buckets.set(normalizedId, { remaining, reset });
    return { limited: false, remaining, reset };
  }

  if (existing.remaining <= 0) {
    return { limited: true, remaining: 0, reset: existing.reset };
  }

  existing.remaining -= 1;
  return {
    limited: false,
    remaining: existing.remaining,
    reset: existing.reset,
  };
}

/** Clear limiter buckets for deterministic testing. */
export function clearRateLimit(identifier?: string): void {
  if (typeof identifier === "string") {
    buckets.delete(identifier.trim() || "anonymous");
    return;
  }
  buckets.clear();
}

