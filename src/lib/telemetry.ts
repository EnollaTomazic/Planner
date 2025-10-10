// src/lib/telemetry.ts
// Lightweight helpers for emitting browser telemetry events.

export type PlannerIslandErrorDetail = {
  island: string
  digest?: string | null
  message?: string | null
}

export function reportPlannerIslandError(detail: PlannerIslandErrorDetail) {
  if (typeof window === 'undefined') return

  const eventDetail = {
    island: detail.island,
    digest: detail.digest ?? null,
    message: detail.message ?? null,
  } as const

  window.dispatchEvent(
    new CustomEvent('planner:island-error', {
      detail: eventDetail,
    }),
  )

  const plausible = (window as typeof window & {
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void
  }).plausible

  plausible?.('planner_island_error', { props: eventDetail })

  const analytics = (window as typeof window & {
    analytics?: { track?: (event: string, properties?: Record<string, unknown>) => void }
  }).analytics

  analytics?.track?.('planner_island_error', eventDetail)

  const dataLayer = (window as typeof window & { dataLayer?: unknown[] }).dataLayer

  if (Array.isArray(dataLayer)) {
    dataLayer.push({
      event: 'planner_island_error',
      planner_island: eventDetail.island,
      planner_island_digest: eventDetail.digest,
    })
  }
}

