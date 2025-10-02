import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/features", () => ({
  safeModeEnabled: false,
  isSafeModeEnabled: () => false,
}));

import {
  applyModelSafety,
  createStreamingAbortController,
  enforceTokenBudget,
  retryWithJitter,
  sanitizePromptInput,
  validateSchema,
  linkAbortSignals,
} from "@/ai/safety";

import { z } from "zod";

const getFeaturesModule = async () => {
  return import("@/lib/features");
};

describe("sanitizePromptInput", () => {
  it("removes control characters and escapes markup", () => {
    const raw = "Hello\u0007<script>alert('x')</script>\n\n\nWorld\tTest";
    const sanitized = sanitizePromptInput(raw);
    expect(sanitized).toBe("Hello&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;\n\nWorld Test");
  });

  it("honors maxLength", () => {
    const sanitized = sanitizePromptInput("a".repeat(100), { maxLength: 10 });
    expect(sanitized).toHaveLength(10);
  });

  it("can retain markup when allowMarkup is true", () => {
    const raw = "<p>Hello</p>";
    expect(sanitizePromptInput(raw, { allowMarkup: true })).toBe(raw);
  });
});

describe("enforceTokenBudget", () => {
  it("drops earliest unpinned messages when budget is exceeded", () => {
    const result = enforceTokenBudget(
      [
        { content: "system", pinned: true },
        { content: "older" },
        { content: "newer" },
      ],
      { maxTokens: 7, reservedForResponse: 0, estimateTokens: () => 4 },
    );

    expect(result.messages).toEqual([
      { content: "system", pinned: true },
      { content: "newer" },
    ]);
    expect(result.removedCount).toBe(1);
    expect(result.totalTokens).toBe(8);
    expect(result.availableTokens).toBe(7);
  });

  it("reserves response tokens when safe mode is enabled", async () => {
    const features = await getFeaturesModule();
    const safeModeSpy = vi.spyOn(features, "isSafeModeEnabled");
    safeModeSpy.mockReturnValue(true);

    const result = enforceTokenBudget(
      [
        { content: "prompt" },
      ],
      { maxTokens: 600, reservedForResponse: 0, estimateTokens: () => 100 },
    );

    expect(result.availableTokens).toBe(88);
    expect(result.totalTokens).toBe(0);

    safeModeSpy.mockRestore();
  });
});

describe("validateSchema", () => {
  it("parses valid payloads", () => {
    const schema = z.object({ id: z.string() });
    expect(validateSchema({ id: "abc" }, schema)).toEqual({ id: "abc" });
  });

  it("throws with readable message for invalid payloads", () => {
    const schema = z.object({ id: z.string() });
    expect(() => validateSchema({}, schema, { label: "Test" })).toThrow(
      /Test failed validation: id: Required/,
    );
  });
});

describe("retryWithJitter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retries until the operation succeeds", async () => {
    const attempts: number[] = [];
    const promise = retryWithJitter(
      async ({ attempt }) => {
        attempts.push(attempt);
        if (attempt < 2) {
          throw new Error("nope");
        }
        return "ok" as const;
      },
      { initialDelayMs: 100, jitterRatio: 0 },
    );

    await vi.advanceTimersByTimeAsync(100);
    expect(await promise).toBe("ok");
    expect(attempts).toEqual([1, 2]);
  });

  it("stops when aborted", async () => {
    const controller = new AbortController();
    const promise = retryWithJitter(
      async () => {
        controller.abort(new Error("cancel"));
        throw new Error("should not retry");
      },
      { signal: controller.signal },
    );

    await expect(promise).rejects.toThrow(/cancel/);
  });
});

describe("streaming abort helpers", () => {
  it("invokes listeners when aborted", () => {
    const controller = createStreamingAbortController();
    const listener = vi.fn();
    controller.onAbort(listener);
    controller.abort();
    expect(listener).toHaveBeenCalled();
    expect(() => controller.throwIfAborted()).toThrow(/Stream aborted/);
  });

  it("links parent signals", () => {
    const parent = new AbortController();
    const target = new AbortController();
    linkAbortSignals(target, parent.signal);
    parent.abort("parent");
    expect(target.signal.aborted).toBe(true);
    expect(target.signal.reason).toBe("parent");
  });

  it("returns cleanup to unlink sources", () => {
    const parent = new AbortController();
    const target = new AbortController();
    const unlink = linkAbortSignals(target, parent.signal);
    unlink();
    parent.abort("ignored");
    expect(target.signal.aborted).toBe(false);
  });
});

describe("applyModelSafety", () => {
  it("returns config unchanged when safe mode is disabled", () => {
    const result = applyModelSafety({
      temperature: 0.8,
      toolChoice: { mode: "required", maxToolCalls: 3 },
    });
    expect(result.safeMode).toBe(false);
    expect(result.temperature).toBe(0.8);
    expect(result.toolChoice).toEqual({ mode: "required", maxToolCalls: 3 });
  });

  it("clamps temperature and tool usage in safe mode", async () => {
    const features = await getFeaturesModule();
    const safeModeSpy = vi.spyOn(features, "isSafeModeEnabled");
    safeModeSpy.mockReturnValue(true);

    const result = applyModelSafety({
      temperature: 0.9,
      toolChoice: { mode: "required", maxToolCalls: 4 },
    });

    expect(result.safeMode).toBe(true);
    expect(result.temperature).toBeLessThanOrEqual(0.4);
    expect(result.toolChoice).toEqual({ mode: "auto", maxToolCalls: 1 });

    safeModeSpy.mockRestore();
  });
});
