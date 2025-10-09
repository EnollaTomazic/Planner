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
  SchemaValidationError,
} from "@/ai/safety";

import { z } from "zod";

import { getLlmTokenUsageSummary, resetLlmTokenUsage } from "@/metrics";

const getFeaturesModule = async () => {
  return import("@/lib/features");
};

afterEach(() => {
  delete process.env.AI_MAX_INPUT_LENGTH;
  delete process.env.AI_TOKENS_PER_CHAR;
  delete process.env.AI_TOKENS_PER_CHARACTER;
  delete process.env.SAFE_MODE;
  resetLlmTokenUsage();
});

const sanitizeOptionsSchema = z.object({
  maxLength: z.number().int().positive().optional(),
  allowMarkup: z.boolean().optional(),
});

const sanitizeCaseSchema = z.object({
  description: z.string(),
  raw: z.string(),
  options: sanitizeOptionsSchema.optional(),
  expected: z.string(),
  expectedGraphemeLength: z.number().int().positive().optional(),
});

describe("sanitizePrompt", () => {
  const longPromptInput = "a".repeat(20_100);
  const sanitizeCases = sanitizeCaseSchema.array().parse([
    {
      description: "removes control characters and escapes markup",
      raw: "Hello\u0007<script>alert(\"x\")</script>\n\n\nWorld\tTest",
      expected: "Hello&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;\n\nWorld Test",
    },
    {
      description: "caps long prompts using the default maximum length",
      raw: longPromptInput,
      expected: "a".repeat(16_000),
      expectedGraphemeLength: 16_000,
    },
    {
      description: "truncates emoji-rich prompts without splitting characters",
      raw: "😀😀😀😀😀",
      options: { maxLength: 3 },
      expected: "😀😀😀",
      expectedGraphemeLength: 3,
    },
    {
      description: "handles extremely long unicode prompts without corrupting characters",
      raw: `${"😀".repeat(8_100)}end`,
      options: { maxLength: 8_100 },
      expected: `${"😀".repeat(8_100)}`,
      expectedGraphemeLength: 8_100,
    },
    {
      description: "escapes HTML while preserving Markdown characters",
      raw: "Hello <b>world</b> **markdown**",
      expected: "Hello &lt;b&gt;world&lt;/b&gt; **markdown**",
    },
    {
      description: "removes unicode line separators and collapses inline whitespace",
      raw: "Line\u2028with\u2029separators   and\t tabs",
      expected: "Linewithseparators and tabs",
    },
    {
      description: "allows markup passthrough when configured",
      raw: "<p>Hello</p>",
      options: { allowMarkup: true },
      expected: "<p>Hello</p>",
    },
    {
      description: "escapes HTML when markup is disallowed but preserves Markdown",
      raw: "<em>Safe</em> **markdown**",
      expected: "&lt;em&gt;Safe&lt;/em&gt; **markdown**",
    },
  ]);

  for (const testCase of sanitizeCases) {
    it(testCase.description, () => {
      const sanitized = sanitizePrompt(testCase.raw, testCase.options);
      expect(sanitized).toBe(testCase.expected);
      if (testCase.expectedGraphemeLength !== undefined) {
        expect(Array.from(sanitized)).toHaveLength(testCase.expectedGraphemeLength);
      }
    });
  }

  it("retains backwards compatible alias", () => {
    const raw = "Safe";
    expect(sanitizePromptInput(raw)).toBe("Safe");
  });
});

const tokenBudgetContentSchema = z.object({
  content: z.string(),
  pinned: z.boolean().optional(),
});

describe("capTokens", () => {
  it("drops earliest unpinned messages when budget is exceeded", () => {
    const messages = tokenBudgetContentSchema.array().parse([
      { content: "system", pinned: true },
      { content: "older" },
      { content: "newer" },
    ]);

    const result = capTokens(messages, {
      maxTokens: 7,
      reservedForResponse: 0,
      estimateTokens: () => 4,
    });

    expect(result.messages).toEqual([
      { content: "system", pinned: true },
      { content: "newer" },
    ]);
    expect(result.removedCount).toBe(1);
    expect(result.totalTokens).toBe(8);
    expect(result.availableTokens).toBe(7);
  });

  it("reserves response tokens when safe mode is enabled", async () => {
    process.env.SAFE_MODE = "true";
    const features = await getFeaturesModule();
    const safeModeSpy = vi.spyOn(features, "isSafeModeEnabled");
    safeModeSpy.mockReturnValue(true);

    const result = enforceTokenBudget(
      tokenBudgetContentSchema.array().parse([{ content: "prompt" }]),
      { maxTokens: 600, reservedForResponse: 0, estimateTokens: () => 100 },
    );

    expect(result.availableTokens).toBe(88);
    expect(result.totalTokens).toBe(0);

    safeModeSpy.mockRestore();
  });

  it("does not lower the ceiling when server safe mode is disabled", async () => {
    const features = await getFeaturesModule();
    const safeModeSpy = vi.spyOn(features, "isSafeModeEnabled");
    safeModeSpy.mockReturnValue(true);

    const result = enforceTokenBudget(
      tokenBudgetContentSchema.array().parse([{ content: "prompt" }]),
      { maxTokens: 9_000, reservedForResponse: 0, estimateTokens: () => 1_000 },
    );

    expect(result.availableTokens).toBe(9_000);
    expect(result.totalTokens).toBe(1_000);
    expect(result.messages).toEqual([{ content: "prompt" }]);

    safeModeSpy.mockRestore();
  });

  it("always retains pinned messages even when they exceed the available budget", () => {
    const messages = tokenBudgetContentSchema.array().parse([
      { content: "critical context", pinned: true },
      { content: "transient detail" },
    ]);

    const result = enforceTokenBudget(messages, {
      maxTokens: 5,
      reservedForResponse: 0,
      estimateTokens: (content) => content.length,
    });

    expect(result.messages).toEqual([{ content: "critical context", pinned: true }]);
    expect(result.removedCount).toBe(1);
    expect(result.totalTokens).toBe("critical context".length);
    expect(result.availableTokens).toBe(5);
  });

  it("estimates tokens using grapheme clusters for emoji-rich pinned content", () => {
    const messages = tokenBudgetContentSchema.array().parse([
      { content: "unpinned narrative that will be removed" },
      { content: "😀😀😀😀", pinned: true },
    ]);

    const result = enforceTokenBudget(messages, {
      maxTokens: 1,
      reservedForResponse: 0,
    });

    expect(result.messages).toEqual([{ content: "😀😀😀😀", pinned: true }]);
    expect(result.removedCount).toBe(1);
    expect(result.totalTokens).toBe(1);
    expect(result.availableTokens).toBe(1);
  });

  it("retains pinned strings when using the single-message helper", () => {
    const pinnedEmoji = "😀".repeat(10);

    const result = capTokens(pinnedEmoji, {
      maxTokens: 1,
      reservedForResponse: 0,
      estimateTokens: () => 5,
      pinned: true,
    });

    expect(result.content).toBe(pinnedEmoji);
    expect(result.removed).toBe(false);
    expect(result.totalTokens).toBe(5);
    expect(result.availableTokens).toBe(1);
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

  it("honors environment overrides for default estimators", async () => {
    process.env.AI_MAX_INPUT_LENGTH = "32";
    process.env.AI_TOKENS_PER_CHAR = "2";

    vi.resetModules();
    const safety = await import("@/ai/safety");

    const payload = z.object({ prompt: z.string() }).parse({ prompt: "a".repeat(50) });
    const sanitized = safety.sanitizePrompt(payload.prompt);
    expect(Array.from(sanitized)).toHaveLength(32);

    const result = safety.enforceTokenBudget(
      tokenBudgetContentSchema.array().parse([{ content: "abcdefghij" }]),
      { maxTokens: 10, reservedForResponse: 0 },
    );

    expect(result.totalTokens).toBe(5);
    expect(result.availableTokens).toBe(10);
  });

  it("retains enforceTokenBudget alias", () => {
    const result = enforceTokenBudget([{ content: "keep" }], {
      maxTokens: 10,
      reservedForResponse: 0,
      estimateTokens: () => 1,
    });

    expect(result.messages).toEqual([{ content: "keep" }]);
  });

  it("reports token usage to the metrics tracker when agent metadata is provided", () => {
    resetLlmTokenUsage();

    const result = enforceTokenBudget(
      tokenBudgetContentSchema.array().parse([
        { content: "alpha", pinned: true },
        { content: "beta" },
      ]),
      {
        maxTokens: 16,
        reservedForResponse: 0,
        estimateTokens: (content) => content.length,
        agent: { id: "planner", label: "Planner" },
      },
    );

    expect(result.totalTokens).toBe(9);

    const summary = getLlmTokenUsageSummary();
    expect(summary.totalTokens).toBe(9);
    expect(summary.agents).toEqual([
      expect.objectContaining({ id: "planner", label: "Planner", tokens: 9 }),
    ]);
  });
});

describe("guardResponse", () => {
  it("parses valid payloads", () => {
    const schema = z.object({ id: z.string() });
    expect(guardResponse({ id: "abc" }, schema)).toEqual({ id: "abc" });
  });

  it("throws a SchemaValidationError with structured issues for invalid payloads", () => {
    const schema = z.object({ id: z.string() });

    expect(() => guardResponse({}, schema, { label: "Test" })).toThrow(
      SchemaValidationError,
    );

    try {
      guardResponse({}, schema, { label: "Test" });
      throw new Error("Expected guardResponse to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(SchemaValidationError);

      if (error instanceof SchemaValidationError) {
        expect(error.label).toBe("Test");
        expect(error.message).toBe("Test failed validation");
        expect(error.issues).toEqual([
          expect.objectContaining({
            path: ["id"],
            message: "Required",
            code: "invalid_type",
          }),
        ]);
      }
    }
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
