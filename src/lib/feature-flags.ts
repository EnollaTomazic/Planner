// src/lib/feature-flags.ts
import { emitTelemetryEvent } from '@/lib/telemetry'

export type FeatureFlagAnalyticsDetail = {
  flag: string
  enabled: boolean
  state?: string
}

export function reportFeatureFlagAnalytics(detail: FeatureFlagAnalyticsDetail) {
  if (typeof window === 'undefined') return

  const state = typeof detail.state === 'string' ? detail.state : detail.enabled ? 'enabled' : 'disabled'

  const eventDetail = {
    ...detail,
    state,
  } as const

  emitTelemetryEvent({
    eventName: 'feature_flag',
    domEventName: 'planner:feature-flag',
    detail: {
      ...eventDetail,
      dataLayer: {
        feature_flag: eventDetail.flag,
        feature_flag_enabled: eventDetail.enabled,
        feature_flag_state: eventDetail.state,
      },
    },
  })
}
