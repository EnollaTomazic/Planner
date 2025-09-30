// src/lib/feature-flags.ts
export type FeatureFlagAnalyticsDetail = {
  flag: string;
  enabled: boolean;
  state?: string;
};

export function reportFeatureFlagAnalytics(detail: FeatureFlagAnalyticsDetail) {
  if (typeof window === "undefined") {
    return;
  }

  const state = typeof detail.state === "string"
    ? detail.state
    : detail.enabled
      ? "enabled"
      : "disabled";

  const eventDetail = {
    ...detail,
    state,
  } as const;

  window.dispatchEvent(
    new CustomEvent("planner:feature-flag", {
      detail: eventDetail,
    }),
  );

  const plausible = (window as typeof window & {
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
  }).plausible;

  if (typeof plausible === "function") {
    plausible("feature_flag", { props: eventDetail });
  }

  const analytics = (window as typeof window & {
    analytics?: { track?: (event: string, properties?: Record<string, unknown>) => void };
  }).analytics;

  analytics?.track?.("feature_flag", eventDetail);

  const dataLayer = (window as typeof window & {
    dataLayer?: unknown[];
  }).dataLayer;

  if (Array.isArray(dataLayer)) {
    dataLayer.push({
      event: "feature_flag",
      feature_flag: eventDetail.flag,
      feature_flag_enabled: eventDetail.enabled,
      feature_flag_state: eventDetail.state,
    });
  }
}
