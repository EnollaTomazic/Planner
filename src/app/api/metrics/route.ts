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

export async function POST(request: NextRequest): Promise<NextResponse> {
  const identifier = getClientIdentifier(request);
  const rate = consumeRateLimit(identifier, RATE_LIMIT_CONFIG);

  if (rate.limited) {
    metricsLog.warn("Web vitals metrics rate limited", {
      resetAt: new Date(rate.reset).toISOString(),
    });
    return buildTooManyRequestsResponse(rate);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    metricsLog.warn("Failed to parse metrics payload", redactForLogging(error));
    return NextResponse.json(
      { error: "invalid_json" },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const parsed = payloadSchema.safeParse(payload);
  if (!parsed.success) {
    metricsLog.warn("Metrics payload failed validation", {
      issues: parsed.error.issues,
    });
    return NextResponse.json(
      { error: "invalid_payload" },
      {
        status: 422,
        headers: {
          "Cache-Control": "no-store",
        },
      },
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

  return NextResponse.json(
    { status: "accepted" },
    {
      status: 202,
      headers: {
        "Cache-Control": "no-store",
      },
    },
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

