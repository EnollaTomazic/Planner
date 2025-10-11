import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

import { resetLlmTokenUsage } from "@/lib/metrics/llmTokens";

const ORIGINAL_ENV = { ...process.env };

function setSafeMode(server: string, client: string) {
  process.env.SAFE_MODE = server;
  process.env.NEXT_PUBLIC_SAFE_MODE = client;
}

async function loadAgent() {
  return import("@/lib/assistant/plannerAgent");
}

beforeEach(() => {
  resetLlmTokenUsage();
});

afterEach(() => {
  vi.resetModules();
  Object.assign(process.env, ORIGINAL_ENV);
  resetLlmTokenUsage();
});

describe("planWithAssistant", () => {
  it("generates planner suggestions and records token usage", async () => {
    setSafeMode("false", "false");
    vi.resetModules();
    const { planWithAssistant } = await loadAgent();

    const plan = planWithAssistant({
      prompt: "Plan sprint review on Friday at 10am",
    });

    expect(plan.sanitizedPrompt).toContain("Plan sprint review");
    expect(plan.suggestions.length).toBeGreaterThan(0);
    expect(plan.summary).toContain("on 2025-10-17");
    expect(plan.safety.safeMode).toBe(false);

    expect(plan.tokenBudget.totalTokens).toBeGreaterThan(0);
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
