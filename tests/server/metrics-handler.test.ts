import { PassThrough } from "node:stream";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/lib/observability/sentry", () => ({
  captureException: vi.fn().mockResolvedValue(undefined),
}));

import { captureException } from "../../src/lib/observability/sentry";
import {
  METRICS_MAX_BODY_BYTES,
  type RateLimiter,
} from "../../src/lib/metrics/ingest";

import {
  createMetricsHandler,
  resetMetricsRateLimit,
  type MetricsHandler,
} from "../../server/metrics-handler";
import { createMockMetricsPayload } from "../../src/metrics/fixtures";

type MetricsRequest = Parameters<MetricsHandler>[0];
type MetricsResponse = Parameters<MetricsHandler>[1];

type RequestOptions = {
  body?: string;
  headers?: Record<string, string>;
  ip?: string | null;
  method?: string;
  remoteAddress?: string;
};

type ResponseRecorder = {
  response: MetricsResponse;
  getBody(): string;
  getHeader(name: string): string | undefined;
  getStatusCode(): number;
};

function createRequest(options: RequestOptions = {}): MetricsRequest {
  const stream = new PassThrough();

  queueMicrotask(() => {
    if (options.body) {
      stream.write(options.body);
    }
    stream.end();
  });

  const request = stream as unknown as MetricsRequest;
  (request as MetricsRequest).method = options.method ?? "POST";
  (request as MetricsRequest).headers =
    options.headers ?? {
      "content-type": "application/json",
      "x-request-id": "test-request-id",
      "x-user-id": "user-123",
    };
  (request as MetricsRequest).ip = options.ip ?? null;
  (request as MetricsRequest).socket = {
    remoteAddress: options.remoteAddress ?? "203.0.113.5",
  } as MetricsRequest["socket"];

  return request;
}

function createResponse(): ResponseRecorder {
  const headers = new Map<string, string>();
  let statusCode = 200;
  let body = "";

  const response = {
    setHeader(name: string, value: number | string | readonly string[]) {
      if (Array.isArray(value)) {
        headers.set(name.toLowerCase(), value.join(", "));
        return;
      }
      headers.set(name.toLowerCase(), String(value));
    },
    getHeader(name: string) {
      return headers.get(name.toLowerCase());
    },
    end(chunk?: unknown) {
      if (chunk !== undefined) {
        body +=
          typeof chunk === "string"
            ? chunk
            : Buffer.isBuffer(chunk)
              ? chunk.toString("utf8")
              : String(chunk);
      }
      return this;
    },
  } as MetricsResponse;

  Object.defineProperty(response, "statusCode", {
    configurable: true,
    enumerable: true,
    get: () => statusCode,
    set: (value: number) => {
      statusCode = value;
    },
  });

  return {
    response,
    getBody: () => body,
    getHeader: (name: string) => headers.get(name.toLowerCase()),
    getStatusCode: () => statusCode,
  } satisfies ResponseRecorder;
}

function createValidPayload() {
  return createMockMetricsPayload({ page: "/metrics" });
}

describe("server metrics handler", () => {
  let handler: MetricsHandler;
  const captureSpy = vi.mocked(captureException);

  beforeEach(() => {
    resetMetricsRateLimit();
    handler = createMetricsHandler();
    captureSpy.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    resetMetricsRateLimit();
  });

  it("accepts valid submissions", async () => {
    const payload = createValidPayload();
    const request = createRequest({ body: JSON.stringify(payload) });
    const recorder = createResponse();

    await handler(request, recorder.response);

    expect(recorder.getStatusCode()).toBe(200);
    expect(JSON.parse(recorder.getBody())).toEqual({ status: "accepted" });
    expect(recorder.getHeader("server-timing")).toMatch(/^app;dur=/);
    expect(recorder.getHeader("cache-control")).toBe("no-store");
    expect(captureSpy).not.toHaveBeenCalled();
  });

  it("rejects oversized bodies and clears rate limit token", async () => {
    const rateLimiter: RateLimiter = {
      consume: vi.fn().mockReturnValue({
        limited: false,
        remaining: 23,
        reset: Date.now() + 1_000,
      }),
      clear: vi.fn(),
    };
    handler = createMetricsHandler({ rateLimiter });
    const oversizedBody = JSON.stringify({ data: "x".repeat(METRICS_MAX_BODY_BYTES + 1) });
    const request = createRequest({ body: oversizedBody });
    const recorder = createResponse();

    await handler(request, recorder.response);

    expect(recorder.getStatusCode()).toBe(413);
    expect(JSON.parse(recorder.getBody())).toEqual({ error: "payload_too_large" });
    expect(recorder.getHeader("server-timing")).toMatch(/^app;dur=/);
    expect(rateLimiter.clear).toHaveBeenCalledWith(expect.any(String));
    expect(rateLimiter.consume).not.toHaveBeenCalled();
  });

  it("rejects invalid json payloads", async () => {
    const request = createRequest({ body: "{invalid" });
    const recorder = createResponse();

    await handler(request, recorder.response);

    expect(recorder.getStatusCode()).toBe(400);
    expect(JSON.parse(recorder.getBody())).toEqual({ error: "invalid_json" });
    expect(recorder.getHeader("server-timing")).toMatch(/^app;dur=/);
    expect(captureSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: "metrics_invalid_json" }),
      expect.objectContaining({
        tags: expect.objectContaining({ requestId: "test-request-id" }),
        extra: expect.objectContaining({ userId: "user-123" }),
      }),
    );
  });

  it("rejects unsupported methods", async () => {
    const request = createRequest({ method: "GET" });
    const recorder = createResponse();

    await handler(request, recorder.response);

    expect(recorder.getStatusCode()).toBe(405);
    expect(JSON.parse(recorder.getBody())).toEqual({ error: "method_not_allowed" });
    expect(recorder.getHeader("server-timing")).toMatch(/^app;dur=/);
    expect(recorder.getHeader("allow")).toBe("POST");
  });

  it("returns rate limited responses", async () => {
    const rateLimiter: RateLimiter = {
      consume: vi.fn().mockReturnValue({
        limited: true,
        remaining: 0,
        reset: Date.now() + 1_000,
      }),
      clear: vi.fn(),
    };
    handler = createMetricsHandler({ rateLimiter });
    const request = createRequest({ body: JSON.stringify(createValidPayload()) });
    const recorder = createResponse();

    await handler(request, recorder.response);

    expect(recorder.getStatusCode()).toBe(429);
    expect(JSON.parse(recorder.getBody())).toEqual({ error: "rate_limited" });
    expect(recorder.getHeader("server-timing")).toMatch(/^app;dur=/);
    expect(recorder.getHeader("retry-after")).toBeDefined();
    expect(rateLimiter.consume).toHaveBeenCalledOnce();
  });

  it("reports validation failures to observability", async () => {
    const request = createRequest({
      body: JSON.stringify({ metric: {}, page: "", timestamp: -1 }),
    });
    const recorder = createResponse();

    await handler(request, recorder.response);

    expect(recorder.getStatusCode()).toBe(400);
    expect(JSON.parse(recorder.getBody())).toEqual({ error: "invalid_payload" });
    expect(recorder.getHeader("server-timing")).toMatch(/^app;dur=/);
    expect(captureSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: "metrics_invalid_payload" }),
      expect.objectContaining({
        tags: expect.objectContaining({ requestId: "test-request-id" }),
        extra: expect.objectContaining({ userId: "user-123" }),
      }),
    );
  });
});

