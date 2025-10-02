import type { NextWebVitalsMetric } from "next/dist/shared/lib/utils";

import { withBasePath } from "@/lib/utils";

export type SerializableEntry = {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
};

export type SerializableMetric = {
  id: string;
  name: string;
  label: "web-vital" | "custom";
  value: number;
  delta?: number;
  rating?: "good" | "needs-improvement" | "poor";
  startTime: number;
  navigationType?: string;
  entries?: SerializableEntry[];
};

export type MetricsPayload = {
  metric: SerializableMetric;
  page: string;
  timestamp: number;
  visibilityState?: DocumentVisibilityState | "prerender";
};

const rawEnableFlag = process.env.NEXT_PUBLIC_ENABLE_METRICS?.trim().toLowerCase();
const DEFAULT_METRICS_ENABLED = process.env.NODE_ENV === "production";

function resolveMetricsEnabled(): boolean {
  if (!rawEnableFlag || rawEnableFlag === "auto") {
    return DEFAULT_METRICS_ENABLED;
  }

  if (["true", "1", "yes", "on"].includes(rawEnableFlag)) {
    return true;
  }

  if (["false", "0", "no", "off"].includes(rawEnableFlag)) {
    return false;
  }

  return DEFAULT_METRICS_ENABLED;
}

export const metricsEnabled = resolveMetricsEnabled();

export const metricsEndpoint = withBasePath("/api/metrics");

type CandidateMetric = NextWebVitalsMetric & {
  delta?: number;
  rating?: "good" | "needs-improvement" | "poor";
  navigationType?: string;
  entries?: PerformanceEntry[];
};

export function normalizeEntries(entries: PerformanceEntry[] | undefined):
  | SerializableEntry[]
  | undefined {
  if (!entries || entries.length === 0) {
    return undefined;
  }

  return entries.map((entry) => {
    if (typeof entry.toJSON === "function") {
      const json = entry.toJSON() as Partial<SerializableEntry>;
      return {
        name: json.name ?? entry.name,
        entryType: json.entryType ?? entry.entryType,
        startTime: json.startTime ?? entry.startTime,
        duration: json.duration ?? entry.duration,
      } satisfies SerializableEntry;
    }

    return {
      name: entry.name,
      entryType: entry.entryType,
      startTime: entry.startTime,
      duration: entry.duration,
    } satisfies SerializableEntry;
  });
}

export function serializeMetric(metric: NextWebVitalsMetric): SerializableMetric {
  const candidate = metric as CandidateMetric;

  return {
    id: candidate.id,
    name: candidate.name,
    label: candidate.label,
    value: candidate.value,
    delta: candidate.delta,
    rating: candidate.rating,
    startTime: candidate.startTime,
    navigationType: candidate.navigationType,
    entries: normalizeEntries(candidate.entries),
  } satisfies SerializableMetric;
}

export type MetricsContext = {
  page?: string;
  timestamp?: number;
  visibilityState?: DocumentVisibilityState | "prerender";
};

export function createMetricsPayload(
  metric: NextWebVitalsMetric,
  context: MetricsContext = {},
): MetricsPayload {
  const page =
    context.page ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const timestamp = context.timestamp ?? Date.now();
  const visibilityState =
    context.visibilityState ??
    (typeof document !== "undefined" ? document.visibilityState : undefined);

  return {
    metric: serializeMetric(metric),
    page,
    timestamp,
    visibilityState,
  } satisfies MetricsPayload;
}

export function postMetrics(payload: MetricsPayload): void {
  const body = JSON.stringify(payload);
  const headers = { "Content-Type": "application/json" } as const;

  if (typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon(metricsEndpoint, body);
    return;
  }

  void fetch(metricsEndpoint, {
    method: "POST",
    headers,
    body,
    keepalive: true,
    credentials: "same-origin",
  }).catch(() => {
    // Swallow errors silently—web vitals reporting shouldn't block navigation.
  });
}

export function reportWebVitals(metric: NextWebVitalsMetric): void {
  if (typeof window === "undefined" || !metricsEnabled) {
    return;
  }

  const payload = createMetricsPayload(metric, {
    visibilityState: typeof document !== "undefined" ? document.visibilityState : undefined,
  });

  postMetrics(payload);
}

export type { NextWebVitalsMetric };
