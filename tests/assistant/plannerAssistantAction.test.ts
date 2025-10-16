import { afterEach, describe, expect, it, vi } from "vitest";

import {
  planWithAssistantAction,
  type PlannerAssistantActionInput,
} from "@/lib/assistant/plannerAssistantAction";

const ORIGINAL_ENV = { ...process.env };

function setSafeMode(server: string, client: string) {
  process.env.SAFE_MODE = server;
  process.env.NEXT_PUBLIC_SAFE_MODE = client;
}

afterEach(() => {
  Object.assign(process.env, ORIGINAL_ENV);
  vi.resetModules();
});

describe("planWithAssistantAction", () => {
  it("returns a planner plan when the request is valid", async () => {
    setSafeMode("false", "false");
    vi.resetModules();

    const result = await planWithAssistantAction({
      prompt: "Plan demo on Tuesday at 3pm",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected successful planner assistant response");
    }

    expect(Array.isArray(result.plan.suggestions)).toBe(true);
    expect(result.plan.suggestions.length).toBeGreaterThan(0);
    expect(result.safeMode.active).toBe(false);
  });

  it("returns validation issues for invalid requests", async () => {
    setSafeMode("false", "false");
    vi.resetModules();

    const result = await planWithAssistantAction({} as PlannerAssistantActionInput);

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Expected planner assistant validation error");
    }

    expect(result.error).toBe("invalid_request");
    expect(result.issues).toBeDefined();
  });

  it("rejects requests when safe mode flags are misaligned", async () => {
    setSafeMode("true", "false");
    vi.resetModules();

    const result = await planWithAssistantAction({ prompt: "Plan" });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Expected planner assistant safe mode error");
    }

    expect(result.error).toBe("safe_mode_mismatch");
  });

  it("returns an error when the sanitized prompt is empty", async () => {
    setSafeMode("false", "false");
    vi.resetModules();

    const result = await planWithAssistantAction({ prompt: "    " });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Expected planner assistant empty prompt error");
    }

    expect(result.error).toBe("empty_prompt");
  });
});
