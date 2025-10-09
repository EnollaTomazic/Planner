import { beforeEach, describe, expect, it } from "vitest";

import {
  createMetricsPayload,
  getLlmTokenUsageSummary,
  recordLlmTokenUsage,
  resetLlmTokenUsage,
  serializeMetric,
} from "@/metrics";
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

describe("llm token usage metrics", () => {
  beforeEach(() => {
    resetLlmTokenUsage();
  });

  it("normalizes agent metadata and totals", () => {
    recordLlmTokenUsage({ id: " planner ", label: " Planner " }, 120.6);
    recordLlmTokenUsage({ id: "planner", kind: "orchestrator" }, 80.2);
    recordLlmTokenUsage({ id: "critic", label: "Critic" }, Number.NaN);
    recordLlmTokenUsage({ id: "critic", label: "Critic" }, 205.4);
    recordLlmTokenUsage({ id: "critic", label: "Critic" }, Number.POSITIVE_INFINITY);

    const summary = getLlmTokenUsageSummary();

    expect(summary.totalTokens).toBe(285);
    expect(summary.agents).toHaveLength(2);
    expect(summary.agents[0]).toMatchObject({
      id: "critic",
      label: "Critic",
      tokens: 205,
    });
    expect(summary.agents[1]).toMatchObject({
      id: "planner",
      label: "Planner",
      kind: "orchestrator",
      tokens: 80,
    });

    const shareTotal = summary.agents.reduce((acc, agent) => acc + agent.share, 0);
    expect(shareTotal).toBeCloseTo(1, 5);
  });

  it("tracks aggregate totals when agents are removed", () => {
    recordLlmTokenUsage({ id: "planner" }, 48);
    recordLlmTokenUsage({ id: "critic" }, 120);

    expect(getLlmTokenUsageSummary().totalTokens).toBe(168);

    recordLlmTokenUsage({ id: "planner" }, 0);

    const summary = getLlmTokenUsageSummary();
    expect(summary.totalTokens).toBe(120);
    expect(summary.agents.map((agent) => agent.id)).toEqual(["critic"]);
  });
});
