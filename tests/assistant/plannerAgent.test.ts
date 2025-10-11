import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

function setSafeMode(server: string, client: string) {
  process.env.SAFE_MODE = server;
  process.env.NEXT_PUBLIC_SAFE_MODE = client;
}

async function loadAgent() {
  return import("@/lib/assistant/plannerAgent");
}

beforeEach(async () => {
  const metrics = await import("@/lib/metrics/llmTokens");
  metrics.resetLlmTokenUsage();
});

afterEach(async () => {
  vi.resetModules();
  Object.assign(process.env, ORIGINAL_ENV);
  const metrics = await import("@/lib/metrics/llmTokens");
  metrics.resetLlmTokenUsage();
});

describe("planWithAssistant", () => {
  it("generates planner suggestions and records token usage", async () => {
    setSafeMode("false", "false");
    vi.resetModules();
    const metrics = await import("@/lib/metrics/llmTokens");
    metrics.resetLlmTokenUsage();
    const { planWithAssistant } = await loadAgent();

    const initialSummary = metrics.getLlmTokenUsageSummary();
    expect(initialSummary.totalTokens).toBe(0);

    const plan = planWithAssistant({
      prompt: "Plan sprint review on Friday at 10am",
    });

    expect(plan.sanitizedPrompt).toContain("Plan sprint review");
    expect(plan.suggestions.length).toBeGreaterThan(0);
    expect(plan.summary).toContain("on 2025-10-17");
    expect(plan.safety.safeMode).toBe(false);

    expect(plan.tokenBudget.totalTokens).toBeGreaterThan(0);

    const firstSummary = metrics.getLlmTokenUsageSummary();
    expect(firstSummary.totalTokens).toBe(plan.tokenBudget.totalTokens);
    expect(metrics.getLlmTokenUsageSummary().totalTokens).toBe(
      firstSummary.totalTokens,
    );

    const nextPlan = planWithAssistant({
      prompt: "Schedule retro on Monday at 2pm",
    });

    expect(nextPlan.tokenBudget.totalTokens).toBeGreaterThan(0);

    const secondSummary = metrics.getLlmTokenUsageSummary();
    expect(secondSummary.totalTokens).toBe(nextPlan.tokenBudget.totalTokens);
  });

  it("limits suggestions when safe mode is active", async () => {
    setSafeMode("true", "true");
    vi.resetModules();
    const { planWithAssistant } = await loadAgent();

    const plan = planWithAssistant({
      prompt: [
        "Task alpha on Monday",
        "Task beta on Tuesday",
        "Task gamma on Wednesday",
        "Task delta on Thursday",
        "Task epsilon on Friday",
      ].join("\n"),
    });

    expect(plan.safety.safeMode).toBe(true);
    expect(plan.suggestions.length).toBeLessThanOrEqual(3);
  });

  it("caps explicit suggestion limit overrides in safe mode", async () => {
    setSafeMode("true", "true");
    vi.resetModules();
    const { planWithAssistant } = await loadAgent();

    const plan = planWithAssistant({
      prompt: [
        "Task alpha on Monday",
        "Task beta on Tuesday",
        "Task gamma on Wednesday",
        "Task delta on Thursday",
        "Task epsilon on Friday",
      ].join("\n"),
      suggestionLimit: 10,
    });

    expect(plan.safety.safeMode).toBe(true);
    expect(plan.suggestions.length).toBeLessThanOrEqual(3);
  });

  it("keeps broader suggestion sets when safe mode is disabled", async () => {
    setSafeMode("false", "false");
    vi.resetModules();
    const { planWithAssistant } = await loadAgent();

    const plan = planWithAssistant({
      prompt: [
        "Draft kickoff brief for Monday",
        "Prepare design review on Tuesday",
        "Collect feedback by Wednesday",
        "Update roadmap on Thursday",
        "Share launch summary on Friday",
      ].join("\n"),
    });

    expect(plan.safety.safeMode).toBe(false);
    expect(plan.suggestions.length).toBeGreaterThanOrEqual(4);
  });

  it("throws a descriptive error when the prompt is empty", async () => {
    setSafeMode("false", "false");
    vi.resetModules();
    const { planWithAssistant, PlannerAssistantError } = await loadAgent();

    try {
      planWithAssistant({ prompt: "   " });
      throw new Error("Expected planner assistant to throw for empty prompts");
    } catch (error) {
      expect(error).toBeInstanceOf(PlannerAssistantError);
      if (error instanceof PlannerAssistantError) {
        expect(error.code).toBe("empty_prompt");
      }
    }
  });
});
