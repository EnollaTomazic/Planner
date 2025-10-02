import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";

import {
  SAFE_MODE_TEMPERATURE_CAP,
  applySafeModeGuard,
  calculateTokenBudget,
  createStreamingAborter,
  prepareCompletionRequest,
  retryWithJitter,
  sanitizeAiInput,
  validateWithSchema,
} from "@/ai/safety";

const waitForMicrotasks = () => new Promise<void>((resolve) => queueMicrotask(() => resolve()));

describe("sanitizeAiInput", () => {
  it("escapes script tags, trims whitespace, and collapses empty lines", () => {
    const raw = "  <script>alert('xss')</script>\n\nNext line   ";
    const sanitized = sanitizeAiInput(raw);
    expect(sanitized).toBe("&lt;script&gt;alert('xss')&lt;/script&gt;\nNext line");
  });

  it("respects max length", () => {
    const sanitized = sanitizeAiInput("abcde", { maxLength: 3, allowNewlines: false });
    expect(sanitized).toBe("abc");
  });
});

describe("calculateTokenBudget", () => {
  it("reserves tokens for response and reports overflow", () => {
    const budget = calculateTokenBudget({
      modelMaxTokens: 100,
      promptTokens: 95,
      reservedForResponse: 20,
      minimumResponseTokens: 10,
    });

    expect(budget.promptTokens).toBe(95);
    expect(budget.responseTokens).toBe(5);
    expect(budget.remainingResponseTokens).toBe(0);
    expect(budget.shouldTruncate).toBe(true);
    expect(budget.overflowTokens).toBeGreaterThan(0);
  });
});

describe("validateWithSchema", () => {
  it("returns parsed payload when schema succeeds", () => {
    const schema = z.object({ title: z.string() });
    const parsed = validateWithSchema(schema, { title: "ok" });
    expect(parsed).toEqual({ title: "ok" });
  });

  it("throws a sanitized error when schema fails", () => {
    const schema = z.object({ count: z.number().int() });

    expect(() => validateWithSchema(schema, { count: "nope" }, { label: "test" })).toThrowError(
      /\[AI:test\] Schema validation failed/,
    );
  });
});

describe("retryWithJitter", () => {
  let mathRandomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mathRandomSpy = vi.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
    vi.useRealTimers();
  });

  it("retries the provided operation with exponential backoff", async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error("fail"))
      .mockRejectedValueOnce(new Error("fail again"))
      .mockResolvedValue("success");

    const promise = retryWithJitter(operation, {
      retries: 3,
      baseDelayMs: 100,
      maxDelayMs: 100,
      jitterRatio: 0,
    });

    await waitForMicrotasks();
    await vi.advanceTimersByTimeAsync(100);
    await waitForMicrotasks();
    await vi.advanceTimersByTimeAsync(100);
    await waitForMicrotasks();

    await expect(promise).resolves.toBe("success");
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("aborts when the signal is pre-aborted", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      retryWithJitter(() => Promise.resolve("nope"), { signal: controller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});

describe("createStreamingAborter", () => {
  it("cancels linked streams and notifies listeners on abort", () => {
    const aborter = createStreamingAborter();
    const cancel = vi.fn();
    const listener = vi.fn();

    aborter.linkStream({ cancel });
    aborter.onAbort(listener);

    aborter.abort("stop");

    expect(cancel).toHaveBeenCalledWith("stop");
    expect(listener).toHaveBeenCalledWith("stop");
  });

  it("mirrors an external signal", () => {
    const controller = new AbortController();
    const cancel = vi.fn();
    const aborter = createStreamingAborter({ signal: controller.signal });

    aborter.linkStream({ cancel });
    controller.abort("external");

    expect(cancel).toHaveBeenCalledWith("external");
  });
});

describe("applySafeModeGuard", () => {
  it("returns the original configuration when safe mode is disabled", () => {
    const result = applySafeModeGuard({
      temperature: 0.8,
      tools: [{ name: "search" }],
      safeMode: false,
    });

    expect(result.safeMode).toBe(false);
    expect(result.temperature).toBe(0.8);
    expect(result.tools).toHaveLength(1);
  });

  it("caps temperature and filters tools when safe mode is enabled", () => {
    const result = applySafeModeGuard({
      temperature: 0.9,
      tools: [{ name: "search" }, { name: "write" }],
      safeMode: true,
      safeToolNames: ["search"],
    });

    expect(result.safeMode).toBe(true);
    expect(result.temperature).toBeLessThanOrEqual(SAFE_MODE_TEMPERATURE_CAP);
    expect(result.tools).toEqual([{ name: "search" }]);
    expect(result.removedTools).toEqual([{ name: "write" }]);
  });

  it("prepares a completion request with sanitized prompt and token budget", () => {
    const result = prepareCompletionRequest({
      prompt: "  Hello <b>world</b>  ",
      promptTokens: 50,
      modelMaxTokens: 200,
      temperature: 0.9,
      tools: [{ name: "search" }, { name: "write" }],
      safeMode: true,
      safeToolNames: ["search"],
      reservedForResponse: 60,
      minimumResponseTokens: 16,
      maxInputLength: 40,
      allowNewlines: false,
    });

    expect(result.safeMode).toBe(true);
    expect(result.sanitizedPrompt).toBe("Hello &lt;b&gt;world&lt;/b&gt;");
    expect(result.tokenBudget.responseTokens).toBeGreaterThan(0);
    expect(result.tools).toEqual([{ name: "search" }]);
  });
});
