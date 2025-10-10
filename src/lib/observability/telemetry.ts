// src/lib/observability/telemetry.ts
// Helpers for emitting lightweight client-side telemetry events.

export type PlannerIslandErrorDetail = {
  islandId: string
  islandLabel: string
  errorName?: string
  errorMessage?: string
  errorDigest?: string
}

function buildPlannerIslandEventDetail(detail: PlannerIslandErrorDetail) {
  const { islandId, islandLabel, errorName, errorMessage, errorDigest } = detail

  const base = {
    islandId,
    islandLabel,
    errorName: errorName ?? 'Error',
  }

  return {
    ...base,
    ...(errorMessage ? { errorMessage } : {}),
    ...(errorDigest ? { errorDigest } : {}),
  } as const
}

export function reportPlannerIslandError(detail: PlannerIslandErrorDetail) {
  if (typeof window === 'undefined') {
    return
  }

  const eventDetail = buildPlannerIslandEventDetail(detail)

  window.dispatchEvent(
    new CustomEvent('planner:island-error', {
      detail: eventDetail,
    }),
  )

  const plausible = (window as typeof window & {
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void
  }).plausible

  if (typeof plausible === 'function') {
    plausible('planner_island_error', { props: eventDetail })
  }

  const analytics = (window as typeof window & {
    analytics?: { track?: (event: string, properties?: Record<string, unknown>) => void }
  }).analytics

  analytics?.track?.('planner_island_error', eventDetail)

  const dataLayer = (window as typeof window & {
    dataLayer?: unknown[]
  }).dataLayer

  if (Array.isArray(dataLayer)) {
    dataLayer.push({
      event: 'planner_island_error',
      planner_island_id: eventDetail.islandId,
      planner_island_label: eventDetail.islandLabel,
      planner_island_error_name: eventDetail.errorName,
    })
  }
}
