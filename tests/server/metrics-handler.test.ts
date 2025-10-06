import { PassThrough } from "node:stream";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMetricsHandler,
  resetMetricsRateLimit,
  type MetricsHandler,
} from "../../server/metrics-handler";
import * as rateLimitModule from "../../src/lib/observability/rate-limit";
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
    options.headers ?? { "content-type": "application/json" };
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

  beforeEach(() => {
    resetMetricsRateLimit();
    handler = createMetricsHandler();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetMetricsRateLimit();
  });

  it("accepts valid submissions", async () => {
    const payload = createValidPayload();
    const request = createRequest({ body: JSON.stringify(payload) });
    const recorder = createResponse();

    await handler(request, recorder.response);

    expect(recorder.getStatusCode()).toBe(202);
    expect(JSON.parse(recorder.getBody())).toEqual({ status: "accepted" });
    expect(recorder.getHeader("server-timing")).toMatch(/^app;dur=/);
    expect(recorder.getHeader("cache-control")).toBe("no-store");
  });

  it("rejects oversized bodies and clears rate limit token", async () => {
    const clearSpy = vi.spyOn(rateLimitModule, "clearRateLimit");
    const oversizedBody = JSON.stringify({ data: "x".repeat(60 * 1024) });
    const request = createRequest({ body: oversizedBody });
    const recorder = createResponse();

    await handler(request, recorder.response);

    expect(recorder.getStatusCode()).toBe(413);
    expect(JSON.parse(recorder.getBody())).toEqual({ error: "payload_too_large" });
    expect(recorder.getHeader("server-timing")).toMatch(/^app;dur=/);
    expect(clearSpy).toHaveBeenCalledOnce();
  });

  it("rejects invalid json payloads", async () => {
    const request = createRequest({ body: "{invalid" });
    const recorder = createResponse();

    await handler(request, recorder.response);

    expect(recorder.getStatusCode()).toBe(400);
    expect(JSON.parse(recorder.getBody())).toEqual({ error: "invalid_json" });
    expect(recorder.getHeader("server-timing")).toMatch(/^app;dur=/);
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
    const spy = vi
      .spyOn(rateLimitModule, "consumeRateLimit")
      .mockReturnValueOnce({ limited: true, remaining: 0, reset: Date.now() + 1_000 });
    const request = createRequest({ body: JSON.stringify(createValidPayload()) });
    const recorder = createResponse();

    await handler(request, recorder.response);

    expect(recorder.getStatusCode()).toBe(429);
    expect(JSON.parse(recorder.getBody())).toEqual({ error: "rate_limited" });
    expect(recorder.getHeader("server-timing")).toMatch(/^app;dur=/);
    expect(recorder.getHeader("retry-after")).toBeDefined();
    expect(spy).toHaveBeenCalledOnce();
  });
});

