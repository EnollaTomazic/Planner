import { z } from "zod";

import { isSafeModeEnabled } from "@/lib/features";
import type { LlmAgentMetadata } from "@/lib/metrics/llmTokens";
import { recordLlmTokenUsage } from "@/lib/metrics/llmTokens";
import { sanitizeText } from "@/lib/utils";

const CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u2028\u2029]/g;
const COLLAPSE_SPACES_PATTERN = /[ \t\f\v]+/g;
const FALLBACK_MAX_INPUT_LENGTH = 16_000;
const FALLBACK_TOKENS_PER_CHARACTER = 4;

const DEFAULT_MAX_INPUT_LENGTH = resolveNumericEnv(
  "AI_MAX_INPUT_LENGTH",
  FALLBACK_MAX_INPUT_LENGTH,
  {
    min: 1,
    integer: true,
  },
);

const DEFAULT_TOKENS_PER_CHARACTER = resolveNumericEnv(
  ["AI_TOKENS_PER_CHAR", "AI_TOKENS_PER_CHARACTER"],
  FALLBACK_TOKENS_PER_CHARACTER,
  {
    min: Number.EPSILON,
  },
);
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

function resolveNumericEnv(
  names: string | readonly string[],
  fallback: number,
  options: NumericEnvOptions = {},
): number {
  if (typeof process === "undefined") {
    return fallback;
  }

  const candidates = Array.isArray(names) ? names : [names];

  for (const name of candidates) {
    const raw = process.env[name];

    if (typeof raw !== "string") {
      continue;
    }

    const normalized = raw.trim();

    if (normalized.length === 0) {
      continue;
    }

    const parsed = Number(normalized);

    if (!Number.isFinite(parsed)) {
      continue;
    }

    const value = options.integer ? Math.trunc(parsed) : parsed;

    if (Number.isNaN(value)) {
      continue;
    }

    if (options.min !== undefined && value < options.min) {
      continue;
    }

    return value;
  }

  return fallback;
}

function getDefaultMaxInputLength(): number {
  return DEFAULT_MAX_INPUT_LENGTH;
}

function getDefaultTokensPerCharacter(): number {
  return DEFAULT_TOKENS_PER_CHARACTER;
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
  readonly agent?: LlmAgentMetadata;
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

  const result: TokenBudgetResult<T> = {
    messages: kept,
    removedCount: removed,
    totalTokens: used,
    availableTokens,
  };

  if (options.agent) {
    recordLlmTokenUsage(options.agent, result.totalTokens);
  }

  return result;
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

export interface SchemaValidationIssue {
  readonly path: ReadonlyArray<string | number>;
  readonly message: string;
  readonly code?: string;
}

export interface SchemaValidationFailure {
  readonly label: string;
  readonly issues: readonly SchemaValidationIssue[];
  readonly cause?: unknown;
}

export interface SchemaValidationOptions {
  readonly label?: string;
}

export interface SchemaValidationSuccess<T> {
  readonly success: true;
  readonly data: T;
}

export interface SchemaValidationErrorResult {
  readonly success: false;
  readonly error: SchemaValidationFailure;
}

export type SchemaValidationResult<T> =
  | SchemaValidationSuccess<T>
  | SchemaValidationErrorResult;

export function guardResponse<T>(
  value: unknown,
  schema: z.ZodType<T>,
  options: SchemaValidationOptions = {},
): SchemaValidationResult<T> {
  const { label = "AI response" } = options;
  try {
    const parsed = schema.parse(value);
    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map<SchemaValidationIssue>((issue: z.ZodIssue) => ({
        path: [...issue.path],
        message: issue.message,
        code: issue.code,
      }));

      return {
        success: false,
        error: {
          label,
          issues,
          cause: error,
        },
      };
    }

    const message =
      error instanceof Error ? error.message : "Unexpected validation error";

    return {
      success: false,
      error: {
        label,
        issues: [
          {
            path: [],
            message,
          },
        ],
        cause: error,
      },
    };
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
const MIN_TEMPERATURE = 0;
const MAX_TEMPERATURE = 2;
const MIN_TOP_P = Number.EPSILON;
const MAX_TOP_P = 1;

function normalizeTemperature(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_TEMPERATURE;
  }

  const clamped = Math.min(Math.max(value, MIN_TEMPERATURE), MAX_TEMPERATURE);
  return Number.isNaN(clamped) ? DEFAULT_TEMPERATURE : clamped;
}

function normalizeTopP(value: number | undefined): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  const clamped = Math.min(Math.max(value, MIN_TOP_P), MAX_TOP_P);
  return Number.isNaN(clamped) ? undefined : clamped;
}

function normalizeMaxToolCalls(value: number | undefined): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  const rounded = Math.max(0, Math.trunc(value));
  return Number.isNaN(rounded) ? undefined : rounded;
}

function normalizeToolChoice(value: ToolChoiceConfig | undefined): ToolChoiceConfig {
  const normalizedMode =
    value?.mode === "auto" || value?.mode === "none" || value?.mode === "required"
      ? value.mode
      : "auto";
  const normalizedMax = normalizeMaxToolCalls(value?.maxToolCalls);

  return {
    mode: normalizedMode,
    ...(normalizedMax !== undefined ? { maxToolCalls: normalizedMax } : {}),
  } satisfies ToolChoiceConfig;
}

export function applyModelSafety(config: ModelSafetyConfig = {}): ModelSafetyResult {
  const safeMode = isSafeModeEnabled();
  const temperature = normalizeTemperature(config.temperature);
  const topP = normalizeTopP(config.topP);
  const toolChoiceConfig = normalizeToolChoice(config.toolChoice);

  const safeTemperature = safeMode
    ? Math.min(temperature, SAFE_MODE_TEMPERATURE_CEILING)
    : temperature;

  const safeToolMax = safeMode
    ? Math.min(
        toolChoiceConfig.maxToolCalls ?? SAFE_MODE_MAX_TOOL_CALLS,
        SAFE_MODE_MAX_TOOL_CALLS,
      )
    : toolChoiceConfig.maxToolCalls;

  const toolChoice: ToolChoiceConfig = safeMode
    ? {
        mode: toolChoiceConfig.mode === "none" ? "none" : "auto",
        ...(safeToolMax !== undefined ? { maxToolCalls: safeToolMax } : {}),
      }
    : {
        mode: toolChoiceConfig.mode,
        ...(safeToolMax !== undefined ? { maxToolCalls: safeToolMax } : {}),
      };

  return {
    temperature: safeTemperature,
    ...(topP !== undefined ? { topP } : {}),
    toolChoice,
    safeMode,
  } satisfies ModelSafetyResult;
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
