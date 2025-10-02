import type { NextWebVitalsMetric } from "next/dist/shared/lib/utils";

import type { MetricsContext, MetricsPayload } from "./index";
import { createMetricsPayload } from "./index";

export type MockMetricOverrides = Partial<
  NextWebVitalsMetric & {
    delta?: number;
    rating?: "good" | "needs-improvement" | "poor";
    navigationType?: string;
    entries?: PerformanceEntry[];
  }
>;

export function createMockMetric(overrides: MockMetricOverrides = {}): NextWebVitalsMetric {
  const base: NextWebVitalsMetric & {
    delta?: number;
    rating?: "good" | "needs-improvement" | "poor";
    navigationType?: string;
    entries?: PerformanceEntry[];
  } = {
    id: "mock-metric-1",
    name: "LCP",
    label: "web-vital",
    value: 2450,
    startTime: 180,
    delta: 20,
    rating: "good",
    navigationType: "navigate",
    entries: [
      {
        name: "largest-contentful-paint",
        entryType: "largest-contentful-paint",
        startTime: 180,
        duration: 0,
        toJSON() {
          return {
            name: this.name,
            entryType: this.entryType,
            startTime: this.startTime,
            duration: this.duration,
          };
        },
      } as PerformanceEntry,
    ],
  };

  return {
    ...base,
    ...overrides,
  } as NextWebVitalsMetric;
}

export function createMockMetricsPayload(
  overrides: MockMetricOverrides & MetricsContext = {},
): MetricsPayload {
  const metricOverrides: MockMetricOverrides = {};
  const context: MetricsContext = {};

  for (const [key, value] of Object.entries(overrides)) {
    if (key === "page" || key === "timestamp" || key === "visibilityState") {
      (context as Record<string, unknown>)[key] = value;
    } else {
      (metricOverrides as Record<string, unknown>)[key] = value;
    }
  }

  const metric = createMockMetric(metricOverrides);
  return createMetricsPayload(metric, context);
}

export function createMockMetricsFeed(count = 4): MetricsPayload[] {
  const labels = ["LCP", "FID", "CLS", "TTFB"] as const;
  const ratings: ("good" | "needs-improvement" | "poor")[] = [
    "good",
    "needs-improvement",
    "good",
    "poor",
  ];
  const values = [
    2380,
    120,
    0.07,
    420,
  ];

  return Array.from({ length: count }, (_, index) => {
    const metricLabel = labels[index % labels.length];
    const rating = ratings[index % ratings.length];
    const value = values[index % values.length];

    return createMockMetricsPayload({
      id: `mock-${metricLabel?.toLowerCase() ?? "metric"}-${index + 1}`,
      name: metricLabel ?? "LCP",
      label: "web-vital",
      rating,
      value,
      startTime: 120 + index * 30,
      delta: rating === "good" ? undefined : index * 5,
      page: index % 2 === 0 ? "/preview/perf" : "/dashboard",
      timestamp: Date.now() - index * 1000,
    });
  });
}
