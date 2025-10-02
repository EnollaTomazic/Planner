import { describe, expect, it } from "vitest";

import { createMetricsPayload, serializeMetric } from "@/metrics";
import { createMockMetric, createMockMetricsPayload } from "@/metrics/fixtures";

describe("metrics helpers", () => {
  it("serializes metrics with preview fixtures", () => {
    const metric = createMockMetric({
      id: "fixture-1",
      rating: "needs-improvement",
      delta: 32,
    });

    const serialized = serializeMetric(metric);

    expect(serialized.id).toBe("fixture-1");
    expect(serialized.rating).toBe("needs-improvement");
    expect(serialized.entries?.[0]?.name).toBe("largest-contentful-paint");
  });

  it("creates payloads with custom context", () => {
    const metric = createMockMetric({ id: "fixture-2" });
    const payload = createMetricsPayload(metric, {
      page: "/metrics",
      timestamp: 123,
      visibilityState: "hidden",
    });

    expect(payload.page).toBe("/metrics");
    expect(payload.timestamp).toBe(123);
    expect(payload.visibilityState).toBe("hidden");
    expect(payload.metric.id).toBe("fixture-2");
  });

  it("provides deterministic payloads via mock helper", () => {
    const payload = createMockMetricsPayload({
      page: "/preview/perf",
      timestamp: 456,
    });

    expect(payload.page).toBe("/preview/perf");
    expect(payload.metric.name.length).toBeGreaterThan(0);
    expect(typeof payload.metric.value).toBe("number");
  });
});
