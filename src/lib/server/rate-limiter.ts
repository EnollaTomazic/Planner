export type RateLimitBucket = "ip" | "user" | "apiKey";

export type BucketConfig = {
  /** Maximum number of requests allowed within the window. */
  limit: number;
  /** Fixed window duration in milliseconds. */
  windowMs: number;
};

export type RateLimitConfig = Record<RateLimitBucket, BucketConfig>;

export type RateLimitSubjects = Partial<Record<RateLimitBucket, string>>;

export type RateLimitSuccess = { ok: true };

export type RateLimitFailure = {
  ok: false;
  bucket: RateLimitBucket;
  retryAfterMs: number;
  limit: BucketConfig;
};

export type RateLimitDecision = RateLimitSuccess | RateLimitFailure;

const BUCKET_ORDER: RateLimitBucket[] = ["apiKey", "user", "ip"];

export const DEFAULT_RATE_LIMITS: RateLimitConfig = {
  ip: { limit: 60, windowMs: 60_000 },
  user: { limit: 120, windowMs: 60_000 },
  apiKey: { limit: 300, windowMs: 60_000 },
};

type BucketState = {
  count: number;
  windowStart: number;
};

type ConsumeResult = { allowed: true } | { allowed: false; retryAfterMs: number };

export type RateLimitCheckInput = {
  subjects: RateLimitSubjects;
  now?: number;
};

export class MultiBucketRateLimiter {
  private readonly buckets = new Map<string, BucketState>();

  constructor(
    private readonly config: RateLimitConfig,
    private readonly getNow: () => number = () => Date.now(),
  ) {
    for (const key of Object.keys(config) as RateLimitBucket[]) {
      const entry = config[key];
      if (!Number.isFinite(entry.limit) || entry.limit < 0) {
        throw new Error(`Invalid limit for bucket "${key}"`);
      }
      if (!Number.isFinite(entry.windowMs) || entry.windowMs <= 0) {
        throw new Error(`Invalid window for bucket "${key}"`);
      }
    }
  }

  check(input: RateLimitCheckInput): RateLimitDecision {
    const timestamp = input.now ?? this.getNow();

    for (const bucket of BUCKET_ORDER) {
      const identifier = input.subjects[bucket];
      if (!identifier) {
        continue;
      }

      const outcome = this.consume(bucket, identifier, timestamp);
      if (!outcome.allowed) {
        const limit = this.config[bucket];
        return {
          ok: false,
          bucket,
          retryAfterMs: outcome.retryAfterMs,
          limit,
        } satisfies RateLimitFailure;
      }
    }

    return { ok: true } satisfies RateLimitSuccess;
  }

  reset(): void {
    this.buckets.clear();
  }

  private consume(
    bucket: RateLimitBucket,
    identifier: string,
    timestamp: number,
  ): ConsumeResult {
    const config = this.config[bucket];
    if (config.limit === 0) {
      return { allowed: false, retryAfterMs: config.windowMs };
    }

    const key = `${bucket}:${identifier}`;
    const state = this.buckets.get(key);

    if (!state) {
      this.buckets.set(key, { count: 1, windowStart: timestamp });
      return { allowed: true };
    }

    const windowEnd = state.windowStart + config.windowMs;

    if (timestamp >= windowEnd) {
      this.buckets.set(key, { count: 1, windowStart: timestamp });
      return { allowed: true };
    }

    if (state.count < config.limit) {
      state.count += 1;
      return { allowed: true };
    }

    return {
      allowed: false,
      retryAfterMs: Math.max(0, windowEnd - timestamp),
    } satisfies ConsumeResult;
  }
}

declare global {
  var __plannerRateLimiter: MultiBucketRateLimiter | undefined;
}

export function getSharedRateLimiter(): MultiBucketRateLimiter {
  if (!globalThis.__plannerRateLimiter) {
    globalThis.__plannerRateLimiter = new MultiBucketRateLimiter(DEFAULT_RATE_LIMITS);
  }
  return globalThis.__plannerRateLimiter;
}

export { BUCKET_ORDER };
