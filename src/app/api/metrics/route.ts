import { Buffer } from 'node:buffer'

import { NextResponse, type NextRequest } from 'next/server'

import {
  METRICS_MAX_BODY_BYTES,
  createMetricsProcessor,
  normalizeHeaders,
  resolveClientIdentifier,
} from '@/lib/metrics/ingest'
import {
  clearRateLimit,
  consumeRateLimit,
  type RateLimitConfig,
  type RateLimitResult,
} from '@/lib/observability/rate-limit'

export const runtime = 'nodejs'

const rateLimiter = {
  consume(identifier: string, config: RateLimitConfig): RateLimitResult {
    return consumeRateLimit(identifier, config)
  },
  clear(identifier?: string): void {
    clearRateLimit(identifier)
  },
}

const processMetrics = createMetricsProcessor({ rateLimiter })

function now(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now()
  }

  return Date.now()
}

function withServerTiming(response: NextResponse, startedAt: number): NextResponse {
  const elapsed = Math.max(0, now() - startedAt)
  response.headers.set('Server-Timing', `app;dur=${elapsed.toFixed(2)}`)
  return response
}

function resolveRequestIp(request: NextRequest): string | null {
  const candidate = (request as { ip?: unknown }).ip
  return typeof candidate === 'string' && candidate.trim().length > 0
    ? candidate
    : null
}

function methodNotAllowed(): NextResponse {
  const startedAt = now()
  const response = NextResponse.json(
    { error: 'method_not_allowed' },
    {
      status: 405,
      headers: {
        Allow: 'POST',
        'Cache-Control': 'no-store',
      },
    },
  )

  return withServerTiming(response, startedAt)
}

export async function POST(request: NextRequest) {
  const startedAt = now()
  const headers = normalizeHeaders(request.headers)
  const client = {
    ip: resolveRequestIp(request),
  }
  const identifier = resolveClientIdentifier(headers, client)
  const contentLengthHeader = headers['content-length']
  const declaredLength = contentLengthHeader ? Number.parseInt(contentLengthHeader, 10) : undefined

  if (Number.isFinite(declaredLength) && (declaredLength as number) > METRICS_MAX_BODY_BYTES) {
    rateLimiter.clear(identifier)
    const response = NextResponse.json(
      { error: 'payload_too_large' },
      {
        status: 413,
        headers: { 'Cache-Control': 'no-store' },
      },
    )

    return withServerTiming(response, startedAt)
  }

  const bodyText = await request.text()

  if (Buffer.byteLength(bodyText, 'utf8') > METRICS_MAX_BODY_BYTES) {
    rateLimiter.clear(identifier)
    const response = NextResponse.json(
      { error: 'payload_too_large' },
      {
        status: 413,
        headers: { 'Cache-Control': 'no-store' },
      },
    )

    return withServerTiming(response, startedAt)
  }

  const result = processMetrics({
    method: request.method,
    headers,
    bodyText,
    client,
  })

  const response = NextResponse.json(result.body, {
    status: result.status,
    headers: result.headers,
  })

  return withServerTiming(response, startedAt)
}

export async function GET() {
  return methodNotAllowed()
}

export async function PUT() {
  return methodNotAllowed()
}

export async function PATCH() {
  return methodNotAllowed()
}

export async function DELETE() {
  return methodNotAllowed()
}

export async function OPTIONS() {
  return methodNotAllowed()
}

export async function HEAD() {
  const startedAt = now()
  const response = new NextResponse(null, {
    status: 405,
    headers: {
      Allow: 'POST',
      'Cache-Control': 'no-store',
    },
  })

  return withServerTiming(response, startedAt)
}

