import { describe, expect, it } from "vitest";

import {
  MultiBucketRateLimiter,
  type RateLimitConfig,
  type RateLimitSubjects,
} from "@/lib/server/rate-limiter";

const BASE_SUBJECTS: RateLimitSubjects = {
  ip: "ip-hash",
  user: "user-hash",
  apiKey: "api-hash",
};

const baseConfig: RateLimitConfig = {
  ip: { limit: 2, windowMs: 1_000 },
  user: { limit: 2, windowMs: 1_000 },
  apiKey: { limit: 2, windowMs: 1_000 },
};

describe("MultiBucketRateLimiter", () => {
  it("allows requests while buckets have capacity", () => {
    const limiter = new MultiBucketRateLimiter(baseConfig);

    const first = limiter.check({ subjects: BASE_SUBJECTS, now: 0 });
    expect(first.ok).toBe(true);

    const second = limiter.check({ subjects: BASE_SUBJECTS, now: 0 });
    expect(second.ok).toBe(true);
  });

  it("blocks once the IP bucket is exhausted", () => {
    const config: RateLimitConfig = {
      ip: { limit: 1, windowMs: 60_000 },
      user: { limit: 5, windowMs: 60_000 },
      apiKey: { limit: 5, windowMs: 60_000 },
    };
    const limiter = new MultiBucketRateLimiter(config);

    expect(limiter.check({ subjects: BASE_SUBJECTS, now: 0 }).ok).toBe(true);
    const blocked = limiter.check({ subjects: BASE_SUBJECTS, now: 0 });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.bucket).toBe("ip");
      expect(blocked.retryAfterMs).toBe(60_000);
      expect(blocked.limit).toEqual(config.ip);
    }
  });

  it("blocks once the user bucket is exhausted", () => {
    const config: RateLimitConfig = {
      ip: { limit: 5, windowMs: 60_000 },
      user: { limit: 1, windowMs: 60_000 },
      apiKey: { limit: 5, windowMs: 60_000 },
    };
    const limiter = new MultiBucketRateLimiter(config);

    expect(limiter.check({ subjects: BASE_SUBJECTS, now: 0 }).ok).toBe(true);
    const blocked = limiter.check({ subjects: BASE_SUBJECTS, now: 0 });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.bucket).toBe("user");
      expect(blocked.retryAfterMs).toBe(60_000);
      expect(blocked.limit).toEqual(config.user);
    }
  });

  it("blocks once the API key bucket is exhausted", () => {
    const config: RateLimitConfig = {
      ip: { limit: 5, windowMs: 60_000 },
      user: { limit: 5, windowMs: 60_000 },
      apiKey: { limit: 1, windowMs: 60_000 },
    };
    const limiter = new MultiBucketRateLimiter(config);

    expect(limiter.check({ subjects: BASE_SUBJECTS, now: 0 }).ok).toBe(true);
    const blocked = limiter.check({ subjects: BASE_SUBJECTS, now: 0 });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.bucket).toBe("apiKey");
      expect(blocked.retryAfterMs).toBe(60_000);
      expect(blocked.limit).toEqual(config.apiKey);
    }
  });
});
