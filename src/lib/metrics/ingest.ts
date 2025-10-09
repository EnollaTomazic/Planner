import { observabilityLogger, redactForLogging } from '@/lib/logging'
import { captureException } from '@/lib/observability/sentry'
import type { ObservabilityCaptureContext } from '@/lib/observability/sentry'
import {
  clearRateLimit,
  consumeRateLimit,
  type RateLimitConfig,
  type RateLimitResult,
} from '@/lib/observability/rate-limit'
import { z } from 'zod'

const metricsLog = observabilityLogger.child('metrics')

export const METRICS_MAX_BODY_BYTES = 50 * 1024 // 50 KB

const entrySchema = z.object({
  name: z.string().min(1),
  entryType: z.string().min(1),
  startTime: z.number().nonnegative(),
  duration: z.number().nonnegative(),
})

const metricSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  label: z.enum(['web-vital', 'custom']),
  value: z.number(),
  delta: z.number().optional(),
  rating: z.enum(['good', 'needs-improvement', 'poor']).optional(),
  startTime: z.number().nonnegative(),
  navigationType: z.string().optional(),
  entries: z.array(entrySchema).optional(),
})

const payloadSchema = z.object({
  metric: metricSchema,
  page: z.string().min(1),
  timestamp: z.number().nonnegative(),
  visibilityState: z.enum(['visible', 'hidden', 'prerender', 'unloaded']).optional(),
})

const RATE_LIMIT_CONFIG = {
  max: 24,
  windowMs: 60_000,
} as const satisfies RateLimitConfig

export type NormalizedHeaders = Record<string, string | undefined>

export type RateLimiter = {
  consume(identifier: string, config: RateLimitConfig): RateLimitResult
  clear(identifier?: string): void
}

const defaultRateLimiter: RateLimiter = {
  consume(identifier, config) {
    return consumeRateLimit(identifier, config)
  },
  clear(identifier) {
    clearRateLimit(identifier)
  },
}

export function normalizeHeaders(
  headers: Headers | Record<string, string | readonly string[] | undefined>,
): NormalizedHeaders {
  const normalized: NormalizedHeaders = {}

  if (headers instanceof Headers) {
    for (const [key, value] of headers.entries()) {
      normalized[key.toLowerCase()] = value
    }
    return normalized
  }

  for (const [key, value] of Object.entries(headers)) {
    const normalizedKey = key.toLowerCase()

    if (typeof value === 'string') {
      normalized[normalizedKey] = value
      continue
    }

    if (Array.isArray(value)) {
      const stringValue = value.find((entry) => typeof entry === 'string')
      normalized[normalizedKey] = stringValue
    }
  }

  return normalized
}

function getHeader(headers: NormalizedHeaders, name: string): string | undefined {
  return headers[name.toLowerCase()]?.trim() || undefined
}

type ClientMetadata = {
  ip?: string | null
  socketAddress?: string | null
}

export function resolveClientIdentifier(
  headers: NormalizedHeaders,
  client: ClientMetadata = {},
): string {
  const forwarded = getHeader(headers, 'x-forwarded-for')
  if (forwarded) {
    const [first] = forwarded.split(',')
    if (first) {
      return first.trim()
    }
  }

  const realIp = getHeader(headers, 'x-real-ip')
  if (realIp) {
    return realIp
  }

  const cfConnectingIp = getHeader(headers, 'cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  if (typeof client.ip === 'string' && client.ip.trim()) {
    return client.ip.trim()
  }

  if (typeof client.socketAddress === 'string' && client.socketAddress.trim()) {
    return client.socketAddress.trim()
  }

  return 'anonymous'
}

function resolveRequestIdentifier(headers: NormalizedHeaders): string {
  const candidates = [
    getHeader(headers, 'x-request-id'),
    getHeader(headers, 'cf-ray'),
    getHeader(headers, 'cf-request-id'),
    getHeader(headers, 'x-amzn-trace-id'),
  ]

  for (const candidate of candidates) {
    if (candidate) {
      return candidate
    }
  }

  const globalCrypto = globalThis.crypto as { randomUUID?: () => string } | undefined
  if (globalCrypto?.randomUUID) {
    return globalCrypto.randomUUID()
  }

  return Math.random().toString(36).slice(2)
}

function resolveUserIdentifier(headers: NormalizedHeaders): string | undefined {
  return (
    getHeader(headers, 'x-user-id') ||
    getHeader(headers, 'x-planner-user-id') ||
    getHeader(headers, 'x-anonymous-id') ||
    undefined
  )
}

type RequestContext = {
  clientId: string
  requestId: string
  userId: string
}

function buildRequestContext(
  clientId: string,
  headers: NormalizedHeaders,
): RequestContext {
  const requestId = resolveRequestIdentifier(headers)
  const userId = resolveUserIdentifier(headers) ?? 'anonymous'

  return { clientId, requestId, userId }
}

function buildCaptureContext(
  context: RequestContext,
  extra: Record<string, unknown> = {},
): ObservabilityCaptureContext {
  return {
    tags: {
      endpoint: 'metrics',
      requestId: context.requestId,
    },
    extra: {
      clientId: context.clientId,
      userId: context.userId,
      ...extra,
    },
  }
}

export type ProcessMetricsInput = {
  method?: string | null
  headers: NormalizedHeaders
  bodyText?: string
  client?: ClientMetadata
}

export type ProcessMetricsResult = {
  status: number
  body: unknown
  headers: Record<string, string>
}

export type MetricsProcessorDependencies = {
  rateLimiter?: RateLimiter
}

export function createMetricsProcessor(
  dependencies: MetricsProcessorDependencies = {},
) {
  const rateLimiter = dependencies.rateLimiter ?? defaultRateLimiter

  return function processMetricsRequest(
    input: ProcessMetricsInput,
  ): ProcessMetricsResult {
    const method = input.method?.toUpperCase() ?? 'GET'
    const headers = input.headers

    if (method !== 'POST') {
      return {
        status: 405,
        body: { error: 'method_not_allowed' },
        headers: {
          Allow: 'POST',
          'Cache-Control': 'no-store',
        },
      }
    }

    const clientId = resolveClientIdentifier(headers, input.client)
    const context = buildRequestContext(clientId, headers)
    const requestLog = metricsLog.child('request', context)

    const rate = rateLimiter.consume(clientId, RATE_LIMIT_CONFIG)

    if (rate.limited) {
      requestLog.warn('Web vitals metrics rate limited', {
        resetAt: new Date(rate.reset).toISOString(),
      })

      const retryAfterSeconds = Math.max(
        Math.ceil((rate.reset - Date.now()) / 1000),
        1,
      )

      return {
        status: 429,
        body: { error: 'rate_limited' },
        headers: {
          'Retry-After': String(retryAfterSeconds),
          'Cache-Control': 'no-store',
        },
      }
    }

    let payload: unknown

    try {
      payload = input.bodyText ? JSON.parse(input.bodyText) : undefined
    } catch (error) {
      const sanitizedError = redactForLogging(error)
      requestLog.warn('Failed to parse metrics payload', { error: sanitizedError })

      void captureException(
        new Error('metrics_invalid_json'),
        buildCaptureContext(context, { error: sanitizedError }),
      )

      return {
        status: 400,
        body: { error: 'invalid_json' },
        headers: { 'Cache-Control': 'no-store' },
      }
    }

    const parsed = payloadSchema.safeParse(payload)

    if (!parsed.success) {
      const sanitizedIssues = redactForLogging(parsed.error.issues)
      const sanitizedPayload = redactForLogging(payload)

      requestLog.warn('Metrics payload failed validation', {
        issues: sanitizedIssues,
      })

      void captureException(
        new Error('metrics_invalid_payload'),
        buildCaptureContext(context, {
          issues: sanitizedIssues,
          payload: sanitizedPayload,
        }),
      )

      return {
        status: 400,
        body: { error: 'invalid_payload' },
        headers: { 'Cache-Control': 'no-store' },
      }
    }

    const { metric, page, timestamp, visibilityState } = parsed.data

    requestLog.info('Web vitals metric accepted', {
      page,
      timestamp,
      visibilityState,
      metric,
      userAgent: headers['user-agent'],
    })

    return {
      status: 200,
      body: { status: 'accepted' },
      headers: { 'Cache-Control': 'no-store' },
    }
  }
}

export function createDefaultMetricsProcessor() {
  return createMetricsProcessor()
}

