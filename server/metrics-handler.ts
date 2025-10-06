import type { IncomingMessage, ServerResponse } from "node:http";

import { z } from "zod";

import { observabilityLogger, redactForLogging } from "@/lib/logging";
import {
  clearRateLimit,
  consumeRateLimit,
  type RateLimitResult,
} from "@/lib/observability/rate-limit";

const metricsLog = observabilityLogger.child("metrics");

const entrySchema = z.object({
  name: z.string().min(1),
  entryType: z.string().min(1),
  startTime: z.number().nonnegative(),
  duration: z.number().nonnegative(),
});

const metricSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  label: z.enum(["web-vital", "custom"]),
  value: z.number(),
  delta: z.number().optional(),
  rating: z.enum(["good", "needs-improvement", "poor"]).optional(),
  startTime: z.number().nonnegative(),
  navigationType: z.string().optional(),
  entries: z.array(entrySchema).optional(),
});

const payloadSchema = z.object({
  metric: metricSchema,
  page: z.string().min(1),
  timestamp: z.number().nonnegative(),
  visibilityState: z.enum(["visible", "hidden", "prerender", "unloaded"]).optional(),
});

const RATE_LIMIT_CONFIG = {
  max: 24,
  windowMs: 60_000,
} as const;

type MetricsRequest = IncomingMessage & { ip?: string | null };

type NormalizedHeaders = Record<string, string | undefined>;

function normalizeHeaders(request: IncomingMessage): NormalizedHeaders {
  const result: NormalizedHeaders = {};
  for (const [key, value] of Object.entries(request.headers)) {
    const normalizedKey = key.toLowerCase();
    if (typeof value === "string") {
      result[normalizedKey] = value;
    } else if (Array.isArray(value)) {
      result[normalizedKey] = value.find((entry) => typeof entry === "string");
    }
  }
  return result;
}

function getHeader(headers: NormalizedHeaders, name: string): string | undefined {
  return headers[name.toLowerCase()]?.trim() || undefined;
}

function getClientIdentifier(request: MetricsRequest, headers: NormalizedHeaders): string {
  const forwarded = getHeader(headers, "x-forwarded-for");
  if (forwarded) {
    const [first] = forwarded.split(",");
    if (first) {
      return first.trim();
    }
  }

  const realIp = getHeader(headers, "x-real-ip");
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = getHeader(headers, "cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  if (typeof request.ip === "string" && request.ip.trim()) {
    return request.ip.trim();
  }

  const socketAddress = request.socket?.remoteAddress;
  if (typeof socketAddress === "string" && socketAddress.trim()) {
    return socketAddress.trim();
  }

  return "anonymous";
}

function buildTooManyRequestsResponse(rate: RateLimitResult) {
  const retryAfterSeconds = Math.max(Math.ceil((rate.reset - Date.now()) / 1000), 1);

  return {
    status: 429,
    headers: {
      "Retry-After": String(retryAfterSeconds),
      "Cache-Control": "no-store",
    },
  } as const;
}

function now(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }

  return Date.now();
}

function setServerTiming(
  response: ServerResponse,
  startedAt: number,
): void {
  const elapsed = Math.max(0, now() - startedAt);
  response.setHeader("Server-Timing", `app;dur=${elapsed.toFixed(2)}`);
}

function sendJson(
  response: ServerResponse,
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
  startedAt?: number,
): void {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json");
  for (const [key, value] of Object.entries(headers)) {
    response.setHeader(key, value);
  }
  if (typeof startedAt === "number") {
    setServerTiming(response, startedAt);
  }
  response.end(JSON.stringify(body));
}

const MAX_REQUEST_BODY_BYTES = 50 * 1024; // ~50 KB

class PayloadTooLargeError extends Error {
  constructor(message = "Request body exceeds limit") {
    super(message);
    this.name = "PayloadTooLargeError";
  }
}

async function readRequestBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    let settled = false;

    const cleanup = () => {
      request.off("data", handleData);
      request.off("end", handleEnd);
      request.off("error", handleError);
    };

    const settle = (action: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      action();
    };

    const handleData = (chunk: Buffer | string) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
      totalBytes += buffer.byteLength;
      if (totalBytes > MAX_REQUEST_BODY_BYTES) {
        settle(() => {
          const error = new PayloadTooLargeError();
          request.destroy();
          reject(error);
        });
        return;
      }
      chunks.push(buffer);
    };

    const handleEnd = () => {
      settle(() => {
        resolve(Buffer.concat(chunks).toString("utf8"));
      });
    };

    const handleError = (error: unknown) => {
      settle(() => {
        reject(error);
      });
    };

    request.on("data", handleData);
    request.on("end", handleEnd);
    request.on("error", handleError);
  });
}

export type MetricsHandler = (request: MetricsRequest, response: ServerResponse) => Promise<void>;

export function createMetricsHandler(): MetricsHandler {
  return async function handleMetricsRequest(request, response) {
    const startedAt = now();
    const headers = normalizeHeaders(request);

    if (request.method?.toUpperCase() !== "POST") {
      sendJson(
        response,
        405,
        { error: "method_not_allowed" },
        { "Allow": "POST", "Cache-Control": "no-store" },
        startedAt,
      );
      return;
    }

    const identifier = getClientIdentifier(request, headers);
    const rate = consumeRateLimit(identifier, RATE_LIMIT_CONFIG);

    if (rate.limited) {
      metricsLog.warn("Web vitals metrics rate limited", {
        resetAt: new Date(rate.reset).toISOString(),
      });
      const tooMany = buildTooManyRequestsResponse(rate);
      sendJson(response, tooMany.status, { error: "rate_limited" }, tooMany.headers, startedAt);
      return;
    }

    let payload: unknown;
    try {
      const body = await readRequestBody(request);
      payload = body ? JSON.parse(body) : undefined;
    } catch (error) {
      if (error instanceof PayloadTooLargeError) {
        metricsLog.warn("Metrics payload exceeded size limit", {
          limit: MAX_REQUEST_BODY_BYTES,
        });
        clearRateLimit(identifier);
        sendJson(
          response,
          413,
          { error: "payload_too_large" },
          { "Cache-Control": "no-store" },
          startedAt,
        );
        return;
      }
      metricsLog.warn("Failed to parse metrics payload", redactForLogging(error));
      sendJson(
        response,
        400,
        { error: "invalid_json" },
        { "Cache-Control": "no-store" },
        startedAt,
      );
      return;
    }

    const parsed = payloadSchema.safeParse(payload);
    if (!parsed.success) {
      metricsLog.warn("Metrics payload failed validation", {
        issues: parsed.error.issues,
      });
      sendJson(
        response,
        422,
        { error: "invalid_payload" },
        { "Cache-Control": "no-store" },
        startedAt,
      );
      return;
    }

    const { metric, page, timestamp, visibilityState } = parsed.data;

    metricsLog.info("Web vitals metric accepted", {
      page,
      timestamp,
      visibilityState,
      metric,
      userAgent: headers["user-agent"],
    });

    sendJson(
      response,
      202,
      { status: "accepted" },
      { "Cache-Control": "no-store" },
      startedAt,
    );
  };
}

export const handleMetricsRequest = createMetricsHandler();

export function resetMetricsRateLimit(identifier?: string): void {
  clearRateLimit(identifier);
}

