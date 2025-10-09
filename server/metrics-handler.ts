import type { IncomingMessage, ServerResponse } from 'node:http'

import {
  METRICS_MAX_BODY_BYTES,
  createMetricsProcessor,
  normalizeHeaders,
  resolveClientIdentifier,
  type MetricsProcessorDependencies,
  type ProcessMetricsInput,
} from '@/lib/metrics/ingest'
import {
  clearRateLimit,
  consumeRateLimit,
  type RateLimitConfig,
  type RateLimitResult,
} from '@/lib/observability/rate-limit'

const defaultRateLimiter = {
  consume(identifier: string, config: RateLimitConfig): RateLimitResult {
    return consumeRateLimit(identifier, config)
  },
  clear(identifier?: string): void {
    clearRateLimit(identifier)
  },
}

type MetricsRequest = IncomingMessage & { ip?: string | null }

type NormalizedResponseHeaders = Record<string, string>

type MetricsHandlerDependencies = MetricsProcessorDependencies

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

class PayloadTooLargeError extends Error {
  constructor(message = 'Request body exceeds limit') {
    super(message)
    this.name = 'PayloadTooLargeError'
  }
}

async function readRequestBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let totalBytes = 0
    let settled = false

    const cleanup = () => {
      request.off('data', handleData)
      request.off('end', handleEnd)
      request.off('error', handleError)
    }

    const settle = (action: () => void) => {
      if (settled) {
        return
      }

      settled = true
      cleanup()
      action()
    }

    const handleData = (chunk: Buffer | string) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))
      totalBytes += buffer.byteLength

      if (totalBytes > METRICS_MAX_BODY_BYTES) {
        settle(() => {
          const error = new PayloadTooLargeError()
          request.destroy()
          reject(error)
        })
        return
      }

      chunks.push(buffer)
    }

    const handleEnd = () => {
      settle(() => {
        resolve(Buffer.concat(chunks).toString('utf8'))
      })
    }

    const handleError = (error: unknown) => {
      settle(() => {
        reject(error)
      })
    }

    request.on('data', handleData)
    request.on('end', handleEnd)
    request.on('error', handleError)
  })
}

export function createMetricsHandler(
  dependencies: MetricsHandlerDependencies = {},
): MetricsHandler {
  const rateLimiter = dependencies.rateLimiter ?? defaultRateLimiter
  const processMetrics = createMetricsProcessor({ rateLimiter })

  return async function handleMetricsRequest(request, response) {
    const startedAt = now()
    const headers = normalizeHeaders(request.headers)
    const client = {
      ip: request.ip ?? null,
      socketAddress: request.socket?.remoteAddress ?? null,
    }

    let bodyText: string | undefined

    if (request.method?.toUpperCase() === 'POST') {
      try {
        bodyText = await readRequestBody(request)
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

    const result = processMetrics({
      method: request.method,
      headers,
      bodyText,
      client,
    } satisfies ProcessMetricsInput)

    sendJson(response, result.status, result.body, result.headers, startedAt)
  }
}

export const handleMetricsRequest = createMetricsHandler()

export function resetMetricsRateLimit(identifier?: string): void {
  clearRateLimit(identifier)
}

