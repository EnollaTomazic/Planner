import { Buffer } from 'node:buffer'

import {
  createMetricsProcessor,
  normalizeHeaders,
  type MetricsProcessorDependencies,
  type ProcessMetricsInput,
  type ProcessMetricsResult,
  type RateLimiter,
} from '@/lib/metrics/ingest'
import {
  clearRateLimit,
  consumeRateLimit,
  type RateLimitConfig,
  type RateLimitResult,
} from '@/lib/observability/rate-limit'

export class PayloadTooLargeError extends Error {
  constructor(message = 'Request body exceeds limit') {
    super(message)
    this.name = 'PayloadTooLargeError'
  }
}

export async function readRequestBody(request: Request, maxBytes: number): Promise<string> {
  const stream = request.body

  if (!stream) {
    return ''
  }

  const reader = stream.getReader()
  const chunks: Buffer[] = []
  let totalBytes = 0
  let cancelled = false

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      if (!value) {
        continue
      }

      const chunk = Buffer.from(value.buffer, value.byteOffset, value.byteLength)
      totalBytes += chunk.byteLength

      if (totalBytes > maxBytes) {
        await reader.cancel('payload_too_large')
        cancelled = true
        throw new PayloadTooLargeError()
      }

      chunks.push(chunk)
    }
  } catch (error) {
    if (!cancelled) {
      await reader.cancel(error instanceof Error ? error.message : undefined)
      cancelled = true
    }
    throw error
  } finally {
    if (stream.locked) {
      reader.releaseLock()
    }
  }

  if (chunks.length === 0) {
    return ''
  }

  return Buffer.concat(chunks, totalBytes).toString('utf8')
}

type MetricsIngestionContext = { ip: string | null; userAgent: string | undefined }

type MetricsIngestor = {
  ingestMetrics(
    payload: ProcessMetricsInput,
    context: MetricsIngestionContext,
  ): Promise<ProcessMetricsResult>
  rateLimiter: RateLimiter
}

const defaultRateLimiter: RateLimiter = {
  consume(identifier: string, config: RateLimitConfig): RateLimitResult {
    return consumeRateLimit(identifier, config)
  },
  clear(identifier?: string): void {
    clearRateLimit(identifier)
  },
}

export function createMetricsIngestor(
  dependencies: MetricsProcessorDependencies = {},
): MetricsIngestor {
  const rateLimiter = dependencies.rateLimiter ?? defaultRateLimiter
  const processMetrics = createMetricsProcessor({ rateLimiter })

  const ingestMetrics = async (
    payload: ProcessMetricsInput,
    context: MetricsIngestionContext,
  ): Promise<ProcessMetricsResult> => {
    const headers = normalizeHeaders(payload.headers)

    const enrichedInput: ProcessMetricsInput = {
      ...payload,
      headers: {
        ...headers,
        'user-agent': headers['user-agent'] ?? context.userAgent,
      },
      client: {
        ip: context.ip ?? payload.client?.ip ?? null,
        socketAddress: payload.client?.socketAddress ?? null,
      },
    }

    return processMetrics(enrichedInput)
  }

  return { ingestMetrics, rateLimiter }
}

const defaultMetricsIngestor = createMetricsIngestor()

export async function ingestMetrics(
  payload: ProcessMetricsInput,
  context: MetricsIngestionContext,
): Promise<ProcessMetricsResult> {
  return defaultMetricsIngestor.ingestMetrics(payload, context)
}

export function getDefaultMetricsRateLimiter(): RateLimiter {
  return defaultMetricsIngestor.rateLimiter
}
