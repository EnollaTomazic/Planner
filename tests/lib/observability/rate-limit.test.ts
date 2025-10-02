import { afterEach, describe, expect, it } from "vitest";

import {
  clearRateLimit,
  consumeRateLimit,
  type RateLimitConfig,
} from "@/lib/observability/rate-limit";

const config: RateLimitConfig = {
  max: 3,
  windowMs: 1_000,
};

describe("rate limiter", () => {
  afterEach(() => {
    clearRateLimit();
  });

  it("allows the first request and decrements the remaining count", () => {
    const first = consumeRateLimit("client", config);
    expect(first.limited).toBe(false);
    expect(first.remaining).toBe(2);
  });

  it("blocks requests once the budget is consumed", () => {
    consumeRateLimit("client", config);
    consumeRateLimit("client", config);
    consumeRateLimit("client", config);

    const limited = consumeRateLimit("client", config);
    expect(limited.limited).toBe(true);
    expect(limited.remaining).toBe(0);
  });

  it("resets the window after the timeout elapses", () => {
    const now = Date.now();
    consumeRateLimit("client", { ...config, now });
    const limited = consumeRateLimit("client", { ...config, now });
    expect(limited.remaining).toBe(1);

    const nextWindow = consumeRateLimit("client", {
      ...config,
      now: now + config.windowMs + 1,
    });

    expect(nextWindow.limited).toBe(false);
    expect(nextWindow.remaining).toBe(2);
  });

  it("normalizes empty identifiers", () => {
    const first = consumeRateLimit("   ", config);
    const second = consumeRateLimit("", config);

    expect(first.remaining).toBe(2);
    expect(second.remaining).toBe(1);
  });
});

