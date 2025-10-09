import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMetricsHandler,
  type MetricsHandler,
  type RateLimiter,
} from "@/app/api/metrics/handler";
import { createMockMetricsPayload } from "@/metrics/fixtures";

function createRequest(options: {
  body?: string;
  headers?: Record<string, string>;
  method?: string;
} = {}): Request {
  const headers = new Headers({
    "content-type": "application/json",
    ...options.headers,
  });

  return new Request("https://example.com/api/metrics", {
    method: options.method ?? "POST",
    body: options.body,
    headers,
  });
}

function getServerTimingHeader(response: Response): string | null {
  return response.headers.get("server-timing");
}

describe("metrics route handler", () => {
  let handler: MetricsHandler;
  let rateLimiter: RateLimiter;
  let consumeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    consumeMock = vi.fn().mockReturnValue({
      limited: false,
      remaining: 23,
      reset: Date.now() + 60_000,
    });

    rateLimiter = {
      consume: consumeMock,
      clear: vi.fn(),
    };

    handler = createMetricsHandler({ rateLimiter, now: () => 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 200 for valid submissions", async () => {
    const payload = createMockMetricsPayload({ page: "/metrics" });
    const request = createRequest({ body: JSON.stringify(payload) });

    const response = await handler(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "accepted" });
    expect(getServerTimingHeader(response)).toMatch(/^app;dur=/);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(consumeMock).toHaveBeenCalledTimes(1);
  });

  it("returns 400 for invalid JSON payloads", async () => {
    const request = createRequest({ body: "{invalid" });

    const response = await handler(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_json" });
    expect(getServerTimingHeader(response)).toMatch(/^app;dur=/);
  });

  it("returns 405 for unsupported methods", async () => {
    const request = createRequest({ method: "GET" });

    const response = await handler(request);

    expect(response.status).toBe(405);
    expect(await response.json()).toEqual({ error: "method_not_allowed" });
    expect(response.headers.get("allow")).toBe("POST");
    expect(getServerTimingHeader(response)).toMatch(/^app;dur=/);
    expect(consumeMock).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limited", async () => {
    consumeMock.mockReturnValueOnce({
      limited: true,
      remaining: 0,
      reset: Date.now() + 1_000,
    });

    const payload = createMockMetricsPayload({ page: "/metrics" });
    const request = createRequest({ body: JSON.stringify(payload) });

    const response = await handler(request);

    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: "rate_limited" });
    expect(response.headers.get("retry-after")).toBeTruthy();
    expect(getServerTimingHeader(response)).toMatch(/^app;dur=/);
  });
});
