import { z } from "zod";

import { observabilityLogger, redactForLogging } from "@/lib/logging";
import {
  type RateLimitConfig,
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

const RATE_LIMIT_CONFIG: RateLimitConfig = {
  max: 24,
  windowMs: 60_000,
};

const MAX_REQUEST_BODY_BYTES = 50 * 1024; // ~50 KB

export type RateLimiter = {
  consume(identifier: string, config: RateLimitConfig): RateLimitResult;
  clear?(identifier?: string): void;
};

export type MetricsHandler = (request: Request) => Promise<Response>;

export type MetricsHandlerOptions = {
  rateLimiter?: RateLimiter;
  now?: () => number;
};

class PayloadTooLargeError extends Error {
  constructor(message = "Request body exceeds limit") {
    super(message);
    this.name = "PayloadTooLargeError";
  }
}

function defaultNow(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }

  return Date.now();
}

function normalizeHeaderValue(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function getClientIdentifier(request: Request): string {
  const forwarded = normalizeHeaderValue(request.headers.get("x-forwarded-for"));
  if (forwarded) {
    const [first] = forwarded.split(",");
    if (first) {
      return first.trim();
    }
  }

  const realIp = normalizeHeaderValue(request.headers.get("x-real-ip"));
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = normalizeHeaderValue(request.headers.get("cf-connecting-ip"));
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const requestWithIp = request as Request & { ip?: string | null };
  const directIp = requestWithIp.ip;
  if (typeof directIp === "string" && directIp.trim()) {
    return directIp.trim();
  }

  return "anonymous";
}

function buildTooManyRequestsResponse(rate: RateLimitResult) {
  const retryAfterSeconds = Math.max(Math.ceil((rate.reset - Date.now()) / 1000), 1);

  return {
    status: 429,
    headers: {
      "Retry-After": String(retryAfterSeconds),
    },
  } as const;
}

async function readRequestBody(request: Request): Promise<string> {
  const declaredLength = normalizeHeaderValue(request.headers.get("content-length"));
  if (declaredLength) {
    const parsed = Number.parseInt(declaredLength, 10);
    if (!Number.isNaN(parsed) && parsed > MAX_REQUEST_BODY_BYTES) {
      throw new PayloadTooLargeError();
    }
  }

  const body = request.body;

  if (!body) {
    return "";
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let result = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      if (value) {
        totalBytes += value.byteLength;
        if (totalBytes > MAX_REQUEST_BODY_BYTES) {
          await reader.cancel();
          throw new PayloadTooLargeError();
        }
        result += decoder.decode(value, { stream: true });
      }
    }

    result += decoder.decode();
    return result;
  } catch (error) {
    await reader.cancel(error as Error);
    throw error;
  }
}

function createJsonResponse(
  status: number,
  body: unknown,
  startedAt: number,
  now: () => number,
  extraHeaders: Record<string, string> = {},
): Response {
  const headers = new Headers(extraHeaders);
  headers.set("Content-Type", "application/json");
  if (!headers.has("Cache-Control")) {
    headers.set("Cache-Control", "no-store");
  }
  const elapsed = Math.max(0, now() - startedAt);
  headers.set("Server-Timing", `app;dur=${elapsed.toFixed(2)}`);

  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}

export function createMetricsHandler(options: MetricsHandlerOptions = {}): MetricsHandler {
  const { rateLimiter, now = defaultNow } = options;

  return async function handleMetrics(request: Request): Promise<Response> {
    const startedAt = now();

    if (request.method?.toUpperCase() !== "POST") {
      return createJsonResponse(
        405,
        { error: "method_not_allowed" },
        startedAt,
        now,
        { Allow: "POST" },
      );
    }

    const limiter = rateLimiter;
    const identifier = getClientIdentifier(request);

    if (limiter) {
      const rate = limiter.consume(identifier, RATE_LIMIT_CONFIG);

      if (rate.limited) {
        metricsLog.warn("Web vitals metrics rate limited", {
          resetAt: new Date(rate.reset).toISOString(),
        });
        const tooMany = buildTooManyRequestsResponse(rate);
        return createJsonResponse(
          tooMany.status,
          { error: "rate_limited" },
          startedAt,
          now,
          tooMany.headers,
        );
      }
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
        limiter?.clear?.(identifier);
        return createJsonResponse(413, { error: "payload_too_large" }, startedAt, now);
      }

      metricsLog.warn("Failed to parse metrics payload", redactForLogging(error));
      return createJsonResponse(400, { error: "invalid_json" }, startedAt, now);
    }

    const parsed = payloadSchema.safeParse(payload);
    if (!parsed.success) {
      metricsLog.warn("Metrics payload failed validation", {
        issues: parsed.error.issues,
      });
      return createJsonResponse(400, { error: "invalid_payload" }, startedAt, now);
    }

    const { metric, page, timestamp, visibilityState } = parsed.data;

    metricsLog.info("Web vitals metric accepted", {
      page,
      timestamp,
      visibilityState,
      metric,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return createJsonResponse(200, { status: "accepted" }, startedAt, now);
  };
}
