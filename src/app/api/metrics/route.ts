import { NextResponse, type NextRequest } from 'next/server'

import {
  METRICS_MAX_BODY_BYTES,
  normalizeHeaders,
  resolveClientIdentifier,
} from '@/lib/metrics/ingest'
import {
  PayloadTooLargeError,
  createMetricsIngestor,
  readRequestBody,
} from '@/server/metrics'

export const runtime = 'nodejs'

const { ingestMetrics, rateLimiter } = createMetricsIngestor()

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

  let bodyText = ''

  try {
    bodyText = await readRequestBody(request, METRICS_MAX_BODY_BYTES)
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
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

    throw error
  }

  const result = await ingestMetrics(
    {
      method: request.method,
      headers,
      bodyText,
      client,
    },
    { ip: client.ip ?? null, userAgent: headers['user-agent'] },
  )

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
