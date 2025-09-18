import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSharedRateLimiter } from "@/lib/server/rate-limiter";
import {
  createRequestId,
  deriveRateLimitSubjects,
} from "@/lib/server/request-identity";

const RATE_LIMIT_PROBLEM_TYPE = "https://planner.noxis.dev/problems/rate-limit";

export const config = {
  matcher: "/api/:path*",
};

export async function middleware(
  request: NextRequest,
): Promise<Response> {
  const limiter = getSharedRateLimiter();
  const timestamp = Date.now();

  const [subjects, requestId] = await Promise.all([
    deriveRateLimitSubjects(request),
    createRequestId({
      method: request.method,
      pathname: request.nextUrl.pathname,
      timestamp,
    }),
  ]);

  const decision = limiter.check({ subjects, now: timestamp });

  if (decision.ok) {
    return NextResponse.next();
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil(decision.retryAfterMs / 1000),
  );
  const windowSeconds = Math.ceil(decision.limit.windowMs / 1000);

  return NextResponse.json(
    {
      type: RATE_LIMIT_PROBLEM_TYPE,
      title: "Too Many Requests",
      status: 429,
      detail: `Exceeded ${decision.limit.limit} requests per ${windowSeconds}s for ${decision.bucket} bucket.`,
      instance: request.nextUrl.pathname,
      requestId,
    },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfterSeconds.toString(),
        "RateLimit-Policy": `${decision.bucket};w=${windowSeconds};c=${decision.limit.limit}`,
        "RateLimit-Remaining": "0",
      },
    },
  );
}
