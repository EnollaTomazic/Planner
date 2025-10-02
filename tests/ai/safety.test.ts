import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/features", () => ({
  safeModeEnabled: false,
  isSafeModeEnabled: () => false,
}));

import {
  applyModelSafety,
  createStreamingAbortController,
  capTokens,
  retryWithJitter,
  sanitizePrompt,
  guardResponse,
  linkAbortSignals,
  sanitizePromptInput,
  enforceTokenBudget,
  validateSchema,
  withStopSequences,
} from "@/ai/safety";

import { z } from "zod";

const getFeaturesModule = async () => {
  return import("@/lib/features");
};

describe("sanitizePrompt", () => {
  it("removes control characters and escapes markup", () => {
    const raw = "Hello\u0007<script>alert('x')</script>\n\n\nWorld\tTest";
    const sanitized = sanitizePrompt(raw);
    expect(sanitized).toBe("Hello&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;\n\nWorld Test");
  });

  it("honors maxLength", () => {
    const sanitized = sanitizePrompt("a".repeat(100), { maxLength: 10 });
    expect(sanitized).toHaveLength(10);
  });

  it("can retain markup when allowMarkup is true", () => {
    const raw = "<p>Hello</p>";
    expect(sanitizePrompt(raw, { allowMarkup: true })).toBe(raw);
  });

  it("retains backwards compatible alias", () => {
    const raw = "Safe";
    expect(sanitizePromptInput(raw)).toBe("Safe");
  });
});

describe("capTokens", () => {
  it("drops earliest unpinned messages when budget is exceeded", () => {
    const result = capTokens(
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

  it("applies string capping semantics", () => {
    const result = capTokens("hello world", {
      maxTokens: 1,
      reservedForResponse: 0,
      estimateTokens: () => 2,
    });

    expect(result.content).toBeNull();
    expect(result.removed).toBe(true);
    expect(result.totalTokens).toBe(0);
  });

  it("retains enforceTokenBudget alias", () => {
    const result = enforceTokenBudget([{ content: "keep" }], {
      maxTokens: 10,
      reservedForResponse: 0,
      estimateTokens: () => 1,
    });

    expect(result.messages).toEqual([{ content: "keep" }]);
  });
});

describe("guardResponse", () => {
  it("parses valid payloads", () => {
    const schema = z.object({ id: z.string() });
    expect(guardResponse({ id: "abc" }, schema)).toEqual({ id: "abc" });
  });

  it("throws with readable message for invalid payloads", () => {
    const schema = z.object({ id: z.string() });
    expect(() => guardResponse({}, schema, { label: "Test" })).toThrow(
      /Test failed validation: id: Required/,
    );
  });

  it("retains validateSchema alias", () => {
    const schema = z.object({ id: z.literal("ok") });
    expect(validateSchema({ id: "ok" }, schema)).toEqual({ id: "ok" });
  });
});

describe("withStopSequences", () => {
  it("deduplicates and filters empty sequences", () => {
    const result = withStopSequences({ stopSequences: ["END", "", "END", "DONE"] });
    expect(result.stopSequences).toEqual(["END", "DONE"]);
  });

  it("honors safe mode overrides", async () => {
    const features = await getFeaturesModule();
    const safeModeSpy = vi.spyOn(features, "isSafeModeEnabled");
    safeModeSpy.mockReturnValue(true);

    const result = withStopSequences(
      { stopSequences: ["END"] },
      { safeModeStopSequences: ["SAFE"] },
    );

    expect(result.stopSequences).toEqual(["SAFE"]);

    safeModeSpy.mockRestore();
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
