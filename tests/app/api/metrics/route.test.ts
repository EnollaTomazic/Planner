import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/metrics/route";
import { clearRateLimit } from "@/lib/observability/rate-limit";

type RequestOptions = {
  headers?: Record<string, string>;
  ip?: string;
  omitForwardedHeader?: boolean;
};

function createRequest(body: unknown, options: RequestOptions = {}) {
  const { headers = {}, omitForwardedHeader } = options;
  return new Request("http://localhost/api/metrics", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(omitForwardedHeader ? {} : { "x-forwarded-for": "203.0.113.7" }),
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function createRequestWithIp(body: unknown, options: RequestOptions & { ip: string }) {
  const request = createRequest(body, { ...options, omitForwardedHeader: true });
  Reflect.set(request, "ip", options.ip);
  return request;
}

const metric = {
  id: "abc123",
  name: "LCP",
  label: "web-vital" as const,
  value: 2500,
  startTime: 100,
  entries: [
    {
      name: "largest-contentful-paint",
      entryType: "largest-contentful-paint",
      startTime: 100,
      duration: 0,
    },
  ],
};

describe("POST /api/metrics", () => {
  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearRateLimit();
  });

  it("accepts a valid metrics payload", async () => {
    const request = createRequest({
      metric,
      page: "/planner",
      timestamp: Date.now(),
      visibilityState: "visible" as const,
    });

    const response = await POST(request as any);
    expect(response.status).toBe(202);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects malformed JSON", async () => {
    const badRequest = new Request("http://localhost/api/metrics", {
      method: "POST",
      body: "{",
      headers: { "content-type": "application/json" },
    });

    const response = await POST(badRequest as any);
    expect(response.status).toBe(400);
  });

  it("rejects payloads that fail validation", async () => {
    const request = createRequest({});
    const response = await POST(request as any);
    expect(response.status).toBe(422);
  });

  it("rate limits repeated requests", async () => {
    const payload = {
      metric,
      page: "/planner",
      timestamp: Date.now(),
    };

    let lastResponse: Response | undefined;
    for (let index = 0; index < 25; index += 1) {
      lastResponse = await POST(createRequest(payload) as any);
    }

    expect(lastResponse?.status).toBe(429);
    expect(lastResponse?.headers.get("retry-after")).toBeDefined();
  });

  it("falls back to request.ip when forwarded headers are missing", async () => {
    const payload = {
      metric,
      page: "/planner",
      timestamp: Date.now(),
    };

    for (let index = 0; index < 25; index += 1) {
      await POST(createRequestWithIp(payload, { ip: "198.51.100.24" }) as any);
    }

    const response = await POST(
      createRequestWithIp(payload, { ip: "198.51.100.42" }) as any,
    );

    expect(response.status).toBe(202);
  });
});

