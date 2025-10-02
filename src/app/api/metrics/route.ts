// src/app/api/metrics/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
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
  visibilityState: z
    .enum(["visible", "hidden", "prerender", "unloaded"])
    .optional(),
});

const RATE_LIMIT_CONFIG = {
  max: 24,
  windowMs: 60_000,
} as const;

type NextRequestWithIp = NextRequest & { ip?: string | null };

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const [first] = forwarded.split(",");
    if (first) {
      return first.trim();
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  const requestIp = (request as NextRequestWithIp).ip;
  if (typeof requestIp === "string" && requestIp.trim()) {
    return requestIp.trim();
  }

  return "anonymous";
}

function buildTooManyRequestsResponse(rate: RateLimitResult): NextResponse {
  const retryAfterSeconds = Math.max(
    Math.ceil((rate.reset - Date.now()) / 1000),
    1,
  );

  return new NextResponse(null, {
    status: 429,
    headers: {
      "Retry-After": String(retryAfterSeconds),
      "Cache-Control": "no-store",
    },
  });
}

function getTimestamp(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }

  return Date.now();
}

function withServerTiming(
  response: NextResponse,
  startedAt: number,
): NextResponse {
  const elapsed = Math.max(0, getTimestamp() - startedAt);
  response.headers.set("Server-Timing", `app;dur=${elapsed.toFixed(2)}`);
  return response;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startedAt = getTimestamp();
  const identifier = getClientIdentifier(request);
  const rate = consumeRateLimit(identifier, RATE_LIMIT_CONFIG);

  if (rate.limited) {
    metricsLog.warn("Web vitals metrics rate limited", {
      resetAt: new Date(rate.reset).toISOString(),
    });
    return withServerTiming(buildTooManyRequestsResponse(rate), startedAt);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    metricsLog.warn("Failed to parse metrics payload", redactForLogging(error));
    return withServerTiming(
      NextResponse.json(
        { error: "invalid_json" },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      ),
      startedAt,
    );
  }

  const parsed = payloadSchema.safeParse(payload);
  if (!parsed.success) {
    metricsLog.warn("Metrics payload failed validation", {
      issues: parsed.error.issues,
    });
    return withServerTiming(
      NextResponse.json(
        { error: "invalid_payload" },
        {
          status: 422,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      ),
      startedAt,
    );
  }

  const { metric, page, timestamp, visibilityState } = parsed.data;

  metricsLog.info("Web vitals metric accepted", {
    page,
    timestamp,
    visibilityState,
    metric,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  return withServerTiming(
    NextResponse.json(
      { status: "accepted" },
      {
        status: 202,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    ),
    startedAt,
  );
}

export const dynamic = "force-dynamic";

/**
 * Reset the rate limiter cache when hot reloading in development so tests and
 * local runs don't inherit old state across module reloads.
 */
if (process.env.NODE_ENV !== "production") {
  clearRateLimit();
}

