import { z } from "zod";

import { isSafeModeEnabled } from "@/lib/features";
import { sanitizeText } from "@/lib/utils";

const CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u2028\u2029]/g;
const COLLAPSE_SPACES_PATTERN = /[ \t\f\v]+/g;
const DEFAULT_MAX_INPUT_LENGTH = 16_000;
const DEFAULT_TOKENS_PER_CHARACTER = 4;
const SAFE_MODE_TOKEN_CEILING = 8_000;
const SAFE_MODE_RESPONSE_RESERVE = 512;
const SAFE_MODE_TEMPERATURE_CEILING = 0.4;
const SAFE_MODE_MAX_TOOL_CALLS = 1;

export interface SanitizedInputOptions {
  readonly maxLength?: number;
  readonly allowMarkup?: boolean;
}

export function sanitizePromptInput(
  raw: string,
  options: SanitizedInputOptions = {},
): string {
  const { maxLength = DEFAULT_MAX_INPUT_LENGTH, allowMarkup = false } = options;
  const normalized = raw
    .replace(/\r\n?/g, "\n")
    .replace(CONTROL_CHAR_PATTERN, "")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.replace(COLLAPSE_SPACES_PATTERN, " ").trimEnd())
    .join("\n")
    .trim();

  const truncated = normalized.length > maxLength
    ? normalized.slice(0, maxLength)
    : normalized;

  return allowMarkup ? truncated : sanitizeText(truncated);
}

export interface TokenBudgetContent {
  readonly content: string;
  readonly pinned?: boolean;
}

export interface TokenBudgetOptions {
  readonly maxTokens: number;
  readonly reservedForResponse?: number;
  readonly estimateTokens?: (content: string) => number;
}

export interface TokenBudgetResult<T extends TokenBudgetContent> {
  readonly messages: readonly T[];
  readonly removedCount: number;
  readonly totalTokens: number;
  readonly availableTokens: number;
}

function defaultTokenEstimator(content: string): number {
  return Math.ceil(content.length / DEFAULT_TOKENS_PER_CHARACTER);
}

export function enforceTokenBudget<T extends TokenBudgetContent>(
  messages: readonly T[],
  options: TokenBudgetOptions,
): TokenBudgetResult<T> {
  const estimator = options.estimateTokens ?? defaultTokenEstimator;
  const reserved = options.reservedForResponse ?? 0;
  const safeMode = isSafeModeEnabled();
  const safeReserved = safeMode
    ? Math.max(reserved, SAFE_MODE_RESPONSE_RESERVE)
    : reserved;
  const safeMaxTokens = safeMode
    ? Math.min(options.maxTokens, SAFE_MODE_TOKEN_CEILING)
    : options.maxTokens;
  const availableTokens = Math.max(safeMaxTokens - safeReserved, 0);

  const kept: T[] = [];
  let used = 0;
  let removed = 0;

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]!;
    const tokens = estimator(message.content);
    if (message.pinned) {
      kept.push(message);
      used += tokens;
      continue;
    }
    if (used + tokens > availableTokens) {
      removed += 1;
      continue;
    }
    kept.push(message);
    used += tokens;
  }

  kept.reverse();

  return {
    messages: kept,
    removedCount: removed,
    totalTokens: used,
    availableTokens,
  };
}

export interface SchemaValidationOptions {
  readonly label?: string;
}

export function validateSchema<T>(
  value: unknown,
  schema: z.ZodType<T>,
  options: SchemaValidationOptions = {},
): T {
  const { label = "AI response" } = options;
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issueSummary = error.issues
        .map((issue: z.ZodIssue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
        .join("; ");
      throw new Error(`${label} failed validation: ${issueSummary}`);
    }
    throw error instanceof Error
      ? new Error(`${label} validation failed: ${error.message}`)
      : new Error(`${label} validation failed`);
  }
}

export interface RetryOptions {
  readonly maxAttempts?: number;
  readonly initialDelayMs?: number;
  readonly maxDelayMs?: number;
  readonly jitterRatio?: number;
  readonly signal?: AbortSignal;
  readonly onRetry?: (context: {
    readonly attempt: number;
    readonly delayMs: number;
    readonly error: unknown;
  }) => void;
}

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_INITIAL_DELAY_MS = 250;
const DEFAULT_MAX_DELAY_MS = 4_000;
const DEFAULT_JITTER_RATIO = 0.25;

function sleep(delayMs: number, signal?: AbortSignal): Promise<void> {
  if (delayMs <= 0) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      resolve();
    }, delayMs);

    const cleanup = () => {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", handleAbort);
    };

    const handleAbort = () => {
      cleanup();
      reject(signal?.reason instanceof Error ? signal.reason : new Error("Aborted"));
    };

    if (signal) {
      if (signal.aborted) {
        cleanup();
        reject(signal.reason instanceof Error ? signal.reason : new Error("Aborted"));
        return;
      }
      signal.addEventListener("abort", handleAbort);
    }
  });
}

export async function retryWithJitter<T>(
  operation: (context: { readonly attempt: number; readonly signal: AbortSignal }) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    initialDelayMs = DEFAULT_INITIAL_DELAY_MS,
    maxDelayMs = DEFAULT_MAX_DELAY_MS,
    jitterRatio = DEFAULT_JITTER_RATIO,
    signal,
    onRetry,
  } = options;

  let attempt = 0;
  let delayMs = initialDelayMs;
  const retryController = new AbortController();
  if (signal) {
    linkAbortSignals(retryController, signal);
  }
  const linkedSignal = retryController.signal;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      return await operation({ attempt, signal: linkedSignal });
    } catch (error) {
      if (linkedSignal.aborted) {
        throw linkedSignal.reason ?? error;
      }
      if (attempt >= maxAttempts) {
        throw error;
      }
      const jitter = 1 + (Math.random() * 2 - 1) * jitterRatio;
      const nextDelay = Math.min(maxDelayMs, delayMs * jitter);
      onRetry?.({ attempt, delayMs: nextDelay, error });
      await sleep(nextDelay, linkedSignal);
      delayMs = Math.min(maxDelayMs, nextDelay * 2);
    }
  }

  throw new Error("retryWithJitter exhausted all attempts without resolving");
}

export type ToolChoiceMode = "auto" | "none" | "required";

export interface ToolChoiceConfig {
  readonly mode: ToolChoiceMode;
  readonly maxToolCalls?: number;
}

export interface ModelSafetyConfig {
  readonly temperature?: number;
  readonly topP?: number;
  readonly toolChoice?: ToolChoiceConfig;
}

export interface ModelSafetyResult extends ModelSafetyConfig {
  readonly temperature: number;
  readonly toolChoice: ToolChoiceConfig;
  readonly safeMode: boolean;
}

const DEFAULT_TEMPERATURE = 0.7;

export function applyModelSafety(config: ModelSafetyConfig = {}): ModelSafetyResult {
  const safeMode = isSafeModeEnabled();
  const incomingTemperature = config.temperature ?? DEFAULT_TEMPERATURE;
  const incomingToolChoice: ToolChoiceConfig = config.toolChoice ?? { mode: "auto" };

  const temperature = safeMode
    ? Math.min(incomingTemperature, SAFE_MODE_TEMPERATURE_CEILING)
    : incomingTemperature;

  const toolChoice: ToolChoiceConfig = safeMode
    ? {
        mode: incomingToolChoice.mode === "none" ? "none" : "auto",
        maxToolCalls: Math.min(
          incomingToolChoice.maxToolCalls ?? SAFE_MODE_MAX_TOOL_CALLS,
          SAFE_MODE_MAX_TOOL_CALLS,
        ),
      }
    : incomingToolChoice;

  return {
    ...config,
    temperature,
    toolChoice,
    safeMode,
  };
}

export interface StreamingAbortController {
  readonly signal: AbortSignal;
  abort(reason?: unknown): void;
  onAbort(listener: (reason: unknown) => void): () => void;
  throwIfAborted(): void;
}

export function createStreamingAbortController(
  parentSignal?: AbortSignal,
): StreamingAbortController {
  const controller = new AbortController();
  const listeners = new Set<(reason: unknown) => void>();

  const notify = () => {
    const reason = controller.signal.reason;
    for (const listener of Array.from(listeners)) {
      listener(reason);
    }
    listeners.clear();
  };

  controller.signal.addEventListener("abort", notify, { once: true });

  if (parentSignal) {
    if (parentSignal.aborted) {
      controller.abort(parentSignal.reason);
    } else {
      const handleParentAbort = () => {
        controller.abort(parentSignal.reason);
      };
      parentSignal.addEventListener("abort", handleParentAbort, { once: true });
      controller.signal.addEventListener(
        "abort",
        () => parentSignal.removeEventListener("abort", handleParentAbort),
        { once: true },
      );
    }
  }

  return {
    signal: controller.signal,
    abort(reason?: unknown) {
      if (!controller.signal.aborted) {
        controller.abort(reason ?? new Error("Stream aborted"));
      }
    },
    onAbort(listener: (reason: unknown) => void) {
      listeners.add(listener);
      if (controller.signal.aborted) {
        listener(controller.signal.reason);
        listeners.delete(listener);
        return () => undefined;
      }
      return () => {
        listeners.delete(listener);
      };
    },
    throwIfAborted() {
      if (controller.signal.aborted) {
        throw controller.signal.reason ?? new Error("Stream aborted");
      }
    },
  };
}

export function linkAbortSignals(target: AbortController, ...sources: AbortSignal[]) {
  for (const signal of sources) {
    if (signal.aborted) {
      target.abort(signal.reason);
      return;
    }
    const handleAbort = () => {
      target.abort(signal.reason);
    };
    signal.addEventListener("abort", handleAbort, { once: true });
    target.signal.addEventListener(
      "abort",
      () => signal.removeEventListener("abort", handleAbort),
      { once: true },
    );
  }
}
