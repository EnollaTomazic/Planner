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

type SegmenterConstructor =
  | (new (locale?: string, options?: Intl.SegmenterOptions) => Intl.Segmenter)
  | undefined;

let cachedSegmenter: Intl.Segmenter | null | undefined;

function getUnicodeSegments(input: string): string[] {
  if (input.length === 0) {
    return [];
  }

  if (cachedSegmenter === undefined) {
    const intlApi =
      typeof Intl !== "undefined"
        ? (Intl as typeof Intl & { Segmenter?: typeof Intl.Segmenter })
        : undefined;
    const segmenterCtor: SegmenterConstructor = intlApi?.Segmenter;
    cachedSegmenter =
      typeof segmenterCtor === "function"
        ? new segmenterCtor(undefined, { granularity: "grapheme" })
        : null;
  }

  const segmenter = cachedSegmenter;

  if (segmenter) {
    return Array.from(segmenter.segment(input), (segment) => segment.segment);
  }

  return Array.from(input);
}

function unicodeLength(input: string): number {
  return getUnicodeSegments(input).length;
}

function unicodeTruncate(input: string, maxLength: number): string {
  if (maxLength <= 0) {
    return "";
  }

  const segments = getUnicodeSegments(input);

  if (segments.length <= maxLength) {
    return input;
  }

  return segments.slice(0, maxLength).join("");
}

const ENABLED_FLAG_VALUES = new Set(["1", "true", "on", "yes"]);

interface NumericEnvOptions {
  readonly min?: number;
  readonly integer?: boolean;
}

function resolveNumericEnv(name: string, fallback: number, options: NumericEnvOptions = {}): number {
  if (typeof process === "undefined") {
    return fallback;
  }

  const raw = process.env[name];

  if (typeof raw !== "string") {
    return fallback;
  }

  const normalized = raw.trim();

  if (normalized.length === 0) {
    return fallback;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  const value = options.integer ? Math.trunc(parsed) : parsed;

  if (Number.isNaN(value)) {
    return fallback;
  }

  if (options.min !== undefined && value < options.min) {
    return fallback;
  }

  return value;
}

function getDefaultMaxInputLength(): number {
  return resolveNumericEnv("AI_MAX_INPUT_LENGTH", DEFAULT_MAX_INPUT_LENGTH, {
    min: 1,
    integer: true,
  });
}

function getDefaultTokensPerCharacter(): number {
  return resolveNumericEnv("AI_TOKENS_PER_CHARACTER", DEFAULT_TOKENS_PER_CHARACTER, {
    min: Number.EPSILON,
  });
}

function isServerSafeModeExplicitlyEnabled(): boolean {
  if (typeof process === "undefined") {
    return false;
  }

  const raw = process.env.SAFE_MODE;

  if (typeof raw !== "string") {
    return false;
  }

  const normalized = raw.trim().toLowerCase();

  if (normalized.length === 0) {
    return false;
  }

  return ENABLED_FLAG_VALUES.has(normalized);
}

export interface SanitizedInputOptions {
  readonly maxLength?: number;
  readonly allowMarkup?: boolean;
}

export function sanitizePrompt(
  raw: string,
  options: SanitizedInputOptions = {},
): string {
  const { maxLength = getDefaultMaxInputLength(), allowMarkup = false } = options;
  const resolvedMaxLength = Number.isFinite(maxLength)
    ? Math.max(Math.trunc(maxLength), 0)
    : getDefaultMaxInputLength();
  const normalized = raw
    .replace(/\r\n?/g, "\n")
    .replace(CONTROL_CHAR_PATTERN, "")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.replace(COLLAPSE_SPACES_PATTERN, " ").trimEnd())
    .join("\n")
    .trim();

  const truncated =
    resolvedMaxLength === 0 ? "" : unicodeTruncate(normalized, resolvedMaxLength);

  return allowMarkup ? truncated : sanitizeText(truncated);
}

export const sanitizePromptInput = sanitizePrompt;

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
  const tokensPerCharacter = getDefaultTokensPerCharacter();
  const characterCount = unicodeLength(content);
  if (characterCount === 0) {
    return 0;
  }
  return Math.ceil(characterCount / tokensPerCharacter);
}

function enforceTokenBudgetInternal<T extends TokenBudgetContent>(
  messages: readonly T[],
  options: TokenBudgetOptions,
): TokenBudgetResult<T> {
  const estimator = options.estimateTokens ?? defaultTokenEstimator;
  const reserved = options.reservedForResponse ?? 0;
  const safeMode = isSafeModeEnabled() && isServerSafeModeExplicitlyEnabled();
  const safeReserved = safeMode
    ? Math.max(reserved, SAFE_MODE_RESPONSE_RESERVE)
    : reserved;
  const incomingMaxTokens = Math.max(options.maxTokens, 0);
  const safeMaxTokens = safeMode
    ? Math.min(incomingMaxTokens, SAFE_MODE_TOKEN_CEILING)
    : incomingMaxTokens;
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

export interface TokenCapResult {
  readonly content: string | null;
  readonly removed: boolean;
  readonly totalTokens: number;
  readonly availableTokens: number;
}

export function capTokens(
  content: string,
  options: TokenBudgetOptions & { pinned?: boolean },
): TokenCapResult;
export function capTokens<T extends TokenBudgetContent>(
  messages: readonly T[],
  options: TokenBudgetOptions,
): TokenBudgetResult<T>;
export function capTokens<T extends TokenBudgetContent>(
  input: string | readonly T[],
  options: TokenBudgetOptions & { pinned?: boolean },
): TokenBudgetResult<T> | TokenCapResult {
  if (typeof input === "string") {
    const { pinned, ...restOptions } = options as TokenBudgetOptions & { pinned?: boolean };
    const result = enforceTokenBudgetInternal(
      [
        {
          content: input,
          pinned,
        },
      ],
      restOptions,
    );
    const kept = result.messages[0];
    return {
      content: kept?.content ?? null,
      removed: kept === undefined,
      totalTokens: result.totalTokens,
      availableTokens: result.availableTokens,
    };
  }

  return enforceTokenBudgetInternal(input, options as TokenBudgetOptions);
}

export function enforceTokenBudget<T extends TokenBudgetContent>(
  messages: readonly T[],
  options: TokenBudgetOptions,
): TokenBudgetResult<T> {
  return capTokens(messages, options);
}

export interface SchemaValidationOptions {
  readonly label?: string;
}

export function guardResponse<T>(
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

export const validateSchema = guardResponse;

export interface StopSequenceOptions {
  readonly stopSequences?: readonly string[];
  readonly safeModeStopSequences?: readonly string[];
}

export function withStopSequences<T extends { stopSequences?: readonly string[] }>(
  payload: T,
  options: StopSequenceOptions = {},
): T & { stopSequences?: readonly string[] } {
  const baseSequences = options.stopSequences ?? payload.stopSequences ?? [];
  const safeModeSequences = options.safeModeStopSequences ?? baseSequences;
  const targetSequences = isSafeModeEnabled() ? safeModeSequences : baseSequences;
  const normalized = Array.from(
    new Set(
      targetSequences.filter(
        (sequence): sequence is string =>
          typeof sequence === "string" && sequence.trim().length > 0,
      ),
    ),
  );

  if (normalized.length === 0) {
    const clone = { ...payload } as T & { stopSequences?: readonly string[] };
    if (payload.stopSequences !== undefined || options.stopSequences !== undefined) {
      clone.stopSequences = [];
    } else {
      delete clone.stopSequences;
    }
    return clone;
  }

  return {
    ...payload,
    stopSequences: normalized,
  };
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
  const unlinkAbortSignals = signal
    ? linkAbortSignals(retryController, signal)
    : undefined;
  const linkedSignal = retryController.signal;

  try {
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
  } finally {
    unlinkAbortSignals?.();
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

export function linkAbortSignals(target: AbortController, ...sources: AbortSignal[]): () => void {
  const removers: Array<() => void> = [];

  for (const signal of sources) {
    if (signal.aborted) {
      target.abort(signal.reason);
      continue;
    }

    const propagateAbort = () => {
      target.abort(signal.reason);
    };

    const handleTargetAbort = () => {
      signal.removeEventListener("abort", propagateAbort);
      target.signal.removeEventListener("abort", handleTargetAbort);
    };

    signal.addEventListener("abort", propagateAbort, { once: true });
    target.signal.addEventListener("abort", handleTargetAbort, { once: true });

    removers.push(() => {
      signal.removeEventListener("abort", propagateAbort);
      target.signal.removeEventListener("abort", handleTargetAbort);
    });
  }

  return () => {
    for (const remove of removers) {
      remove();
    }
  };
}
