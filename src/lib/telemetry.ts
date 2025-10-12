// src/lib/telemetry.ts
// Lightweight helpers for emitting browser telemetry events.

type Plausible = (event: string, options?: { props?: Record<string, unknown> }) => void

type Analytics = {
  track?: (event: string, properties?: Record<string, unknown>) => void
}

type TelemetryEmitDetail = Record<string, unknown> & {
  dataLayer?: Record<string, unknown>
}

export type TelemetryEventPayload = {
  eventName: string
  domEventName: string
  detail: TelemetryEmitDetail
}

export function emitTelemetryEvent({
  eventName,
  domEventName,
  detail,
}: TelemetryEventPayload): void {
  if (typeof window === 'undefined') return

  const { dataLayer: dataLayerDetail, ...eventDetail } = detail

  window.dispatchEvent(
    new CustomEvent(domEventName, {
      detail: eventDetail,
    }),
  )

  const plausible = (window as typeof window & { plausible?: Plausible }).plausible
  plausible?.(eventName, { props: eventDetail })

  const analytics = (window as typeof window & { analytics?: Analytics }).analytics
  analytics?.track?.(eventName, eventDetail)

  const dataLayer = (window as typeof window & { dataLayer?: unknown[] }).dataLayer
  if (Array.isArray(dataLayer)) {
    const payload = dataLayerDetail ?? eventDetail
    dataLayer.push({ event: eventName, ...payload })
  }
}

export type PlannerIslandErrorDetail = {
  island: string
  digest?: string | null
  message?: string | null
}

export function reportPlannerIslandError(detail: PlannerIslandErrorDetail): void {
  emitTelemetryEvent({
    eventName: 'planner_island_error',
    domEventName: 'planner:island-error',
    detail: {
      island: detail.island,
      digest: detail.digest ?? null,
      message: detail.message ?? null,
      dataLayer: {
        planner_island: detail.island,
        planner_island_digest: detail.digest ?? null,
      },
    },
  })
}

