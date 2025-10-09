import { clearRateLimit, consumeRateLimit } from "@/lib/observability/rate-limit";

import { createMetricsHandler, type RateLimiter } from "./handler";

const rateLimiter: RateLimiter = {
  consume: consumeRateLimit,
  clear: clearRateLimit,
};

const handler = createMetricsHandler({ rateLimiter });

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  return handler(request);
}

export async function GET(request: Request): Promise<Response> {
  return handler(request);
}

export async function HEAD(request: Request): Promise<Response> {
  return handler(request);
}

export async function OPTIONS(request: Request): Promise<Response> {
  return handler(request);
}

export async function PUT(request: Request): Promise<Response> {
  return handler(request);
}

export async function PATCH(request: Request): Promise<Response> {
  return handler(request);
}

export async function DELETE(request: Request): Promise<Response> {
  return handler(request);
}
