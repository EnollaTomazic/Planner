import type { IncomingMessage, ServerResponse } from 'node:http'
import { Readable } from 'node:stream'

import {
  METRICS_MAX_BODY_BYTES,
  normalizeHeaders,
  resolveClientIdentifier,
  type MetricsProcessorDependencies,
  type ProcessMetricsInput,
} from '@/lib/metrics/ingest'
import {
  createMetricsIngestor,
  getDefaultMetricsRateLimiter,
  PayloadTooLargeError,
  readRequestBody,
} from '@/server/metrics'

const defaultRateLimiter = getDefaultMetricsRateLimiter()

type MetricsRequest = IncomingMessage & { ip?: string | null }

type NormalizedResponseHeaders = Record<string, string>

type MetricsHandlerDependencies = MetricsProcessorDependencies

type MetricsHandlerContext = {
  headers: Record<string, string | undefined>
  client: ProcessMetricsInput['client']
}

export type MetricsHandler = (
  request: MetricsRequest,
  response: ServerResponse,
) => Promise<void>

function now(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now()
  }

  return Date.now()
}

function setServerTiming(response: ServerResponse, startedAt: number): void {
  const elapsed = Math.max(0, now() - startedAt)
  response.setHeader('Server-Timing', `app;dur=${elapsed.toFixed(2)}`)
}

function sendJson(
  response: ServerResponse,
  status: number,
  body: unknown,
  headers: NormalizedResponseHeaders = {},
  startedAt?: number,
): void {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json')

  for (const [key, value] of Object.entries(headers)) {
    response.setHeader(key, value)
  }

  if (typeof startedAt === 'number') {
    setServerTiming(response, startedAt)
  }

  response.end(JSON.stringify(body))
}

function buildContext(request: MetricsRequest): MetricsHandlerContext {
  const headers = normalizeHeaders(request.headers)
  const client = {
    ip: request.ip ?? null,
    socketAddress: request.socket?.remoteAddress ?? null,
  }

  return { headers, client }
}

function toWebRequest(request: MetricsRequest): Request {
  return new Request('http://localhost', {
    method: request.method,
    headers: request.headers as HeadersInit,
    body: Readable.toWeb(request),
    duplex: 'half',
  })
}

export function createMetricsHandler(
  dependencies: MetricsHandlerDependencies = {},
): MetricsHandler {
  const rateLimiter = dependencies.rateLimiter ?? defaultRateLimiter
  const { ingestMetrics } = createMetricsIngestor({ rateLimiter })

  return async function handleMetricsRequest(request, response) {
    const startedAt = now()
    const { headers, client } = buildContext(request)

    let bodyText: string | undefined

    if (request.method?.toUpperCase() === 'POST') {
      try {
        const webRequest = toWebRequest(request)
        bodyText = await readRequestBody(webRequest, METRICS_MAX_BODY_BYTES)
      } catch (error) {
        if (error instanceof PayloadTooLargeError) {
          const identifier = resolveClientIdentifier(headers, client)
          rateLimiter.clear(identifier)
          sendJson(
            response,
            413,
            { error: 'payload_too_large' },
            { 'Cache-Control': 'no-store' },
            startedAt,
          )
          return
        }

        throw error
      }
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

    sendJson(response, result.status, result.body, result.headers, startedAt)
  }
}

export const handleMetricsRequest = createMetricsHandler()

export function resetMetricsRateLimit(identifier?: string): void {
  defaultRateLimiter.clear(identifier)
}
