import { z, type ZodIssue } from "zod";

import { safeModeEnabled } from "@/lib/features";
import { sanitizeText } from "@/lib/utils";

const DEFAULT_MAX_INPUT_LENGTH = 4000;
const DEFAULT_MIN_RESPONSE_TOKENS = 32;
export const SAFE_MODE_TEMPERATURE_CAP = 0.35;

export interface SanitizationOptions {
  readonly maxLength?: number;
  readonly allowNewlines?: boolean;
}

export function sanitizeAiInput(
  raw: string,
  { maxLength = DEFAULT_MAX_INPUT_LENGTH, allowNewlines = true }: SanitizationOptions = {},
): string {
  const normalizedLength = Number.isFinite(maxLength) ? Math.max(0, Math.trunc(maxLength)) : DEFAULT_MAX_INPUT_LENGTH;
  const sanitized = sanitizeText(raw ?? "")
    .replace(/\u200B/g, "")
    .replace(/&#39;/g, "'");

  const collapsed = allowNewlines
    ? sanitized
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join("\n")
    : sanitized.replace(/\s+/g, " ");

  const trimmed = collapsed.trim();
  return trimmed.length > normalizedLength ? trimmed.slice(0, normalizedLength) : trimmed;
}

export interface TokenBudgetInput {
  readonly modelMaxTokens: number;
  readonly promptTokens: number;
  readonly reservedForResponse?: number;
  readonly minimumResponseTokens?: number;
}

export interface TokenBudgetResult {
  readonly promptTokens: number;
  readonly responseTokens: number;
  readonly totalTokens: number;
  readonly availableForResponse: number;
  readonly remainingResponseTokens: number;
  readonly overflowTokens: number;
  readonly shouldTruncate: boolean;
}

export function calculateTokenBudget({
  modelMaxTokens,
  promptTokens,
  reservedForResponse,
  minimumResponseTokens,
}: TokenBudgetInput): TokenBudgetResult {
  const maxTokens = Math.max(0, Math.trunc(modelMaxTokens));
  const sanitizedPromptTokens = Math.max(0, Math.trunc(promptTokens));
  const trimmedPromptTokens = Math.min(sanitizedPromptTokens, maxTokens);
  const promptOverflow = Math.max(0, sanitizedPromptTokens - trimmedPromptTokens);

  const availableForResponse = Math.max(0, maxTokens - trimmedPromptTokens);
  const desiredMinimum = Math.min(
    availableForResponse,
    Math.max(0, Math.trunc(minimumResponseTokens ?? DEFAULT_MIN_RESPONSE_TOKENS)),
  );
  const requestedReservation = Math.max(
    desiredMinimum,
    Math.trunc(reservedForResponse ?? availableForResponse),
  );
  const desiredReservation = Math.min(
    availableForResponse,
    requestedReservation,
  );
  const responseTokens = desiredReservation;
  const totalTokens = trimmedPromptTokens + responseTokens;
  const totalRequestedTokens = sanitizedPromptTokens + requestedReservation;
  const remainingResponseTokens = Math.max(0, availableForResponse - responseTokens);
  const reservationOverflow = Math.max(0, totalRequestedTokens - maxTokens);
  const shouldTruncate = promptOverflow > 0 || reservationOverflow > 0;

  return {
    promptTokens: trimmedPromptTokens,
    responseTokens,
    totalTokens: Math.min(totalTokens, maxTokens),
    availableForResponse,
    remainingResponseTokens,
    overflowTokens: shouldTruncate ? Math.max(promptOverflow, reservationOverflow) : 0,
    shouldTruncate,
  };
}

export interface SchemaValidationOptions {
  readonly label?: string;
  readonly maxMessageLength?: number;
}

export function validateWithSchema<T>(
  schema: z.ZodType<T>,
  payload: unknown,
  { label, maxMessageLength = 500 }: SchemaValidationOptions = {},
): T {
  const result = schema.safeParse(payload);
  if (result.success) {
    return result.data;
  }

  const summary = result.error.issues
    .map((issue: ZodIssue) => {
      const path = issue.path.join(".") || "value";
      return `${path}: ${issue.message}`;
    })
    .join("; ");

  const sanitizedSummary = sanitizeAiInput(summary, { maxLength: maxMessageLength, allowNewlines: false });
  const prefix = label ? `[AI:${label}]` : "[AI]";
  const error = new Error(`${prefix} Schema validation failed: ${sanitizedSummary}`);
  error.name = "AISchemaValidationError";
  throw error;
}

function createAbortError(reason?: unknown): Error {
  const error = new Error("The operation was aborted.");
  error.name = "AbortError";
  if (reason !== undefined) {
    (error as Error & { cause?: unknown }).cause = reason;
  }
  return error;
}

function linkAbortSignal(source: AbortSignal | undefined, target: AbortController): () => void {
  if (!source) {
    return () => {};
  }
  if (source.aborted) {
    target.abort(source.reason);
    return () => {};
  }
  const listener = () => {
    target.abort(source.reason);
  };
  source.addEventListener("abort", listener, { once: true });
  return () => {
    source.removeEventListener("abort", listener);
  };
}

async function waitWithSignal(delayMs: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) {
    throw createAbortError(signal.reason);
  }
  if (delayMs <= 0) {
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      signal.removeEventListener("abort", abortListener);
      resolve();
    }, delayMs);
    const abortListener = () => {
      clearTimeout(timeout);
      signal.removeEventListener("abort", abortListener);
      reject(createAbortError(signal.reason));
    };
    signal.addEventListener("abort", abortListener);
  });
}

export interface RetryMetadata {
  readonly attempt: number;
  readonly delayMs: number;
}

export interface RetryOptions {
  readonly retries?: number;
  readonly baseDelayMs?: number;
  readonly maxDelayMs?: number;
  readonly jitterRatio?: number;
  readonly signal?: AbortSignal;
  readonly onRetry?: (error: unknown, metadata: RetryMetadata) => void;
}

const DEFAULT_RETRIES = 2;
const DEFAULT_BASE_DELAY_MS = 200;
const DEFAULT_MAX_DELAY_MS = 2000;
const DEFAULT_JITTER_RATIO = 0.25;

export async function retryWithJitter<T>(
  operation: (attempt: number, signal: AbortSignal) => Promise<T>,
  {
    retries = DEFAULT_RETRIES,
    baseDelayMs = DEFAULT_BASE_DELAY_MS,
    maxDelayMs = DEFAULT_MAX_DELAY_MS,
    jitterRatio = DEFAULT_JITTER_RATIO,
    signal,
    onRetry,
  }: RetryOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const unlink = linkAbortSignal(signal, controller);
  const combinedSignal = controller.signal;

  try {
    let attempt = 0;
    while (true) {
      if (combinedSignal.aborted) {
        throw createAbortError(combinedSignal.reason);
      }
      try {
        return await operation(attempt, combinedSignal);
      } catch (error) {
        if (attempt >= retries) {
          throw error;
        }
        const exponentialDelay = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
        const jitter = Math.max(0, exponentialDelay * jitterRatio);
        const minDelay = Math.max(0, exponentialDelay - jitter);
        const maxDelay = exponentialDelay + jitter;
        const delayMs = minDelay + Math.random() * (maxDelay - minDelay);
        onRetry?.(error, { attempt: attempt + 1, delayMs });
        await waitWithSignal(delayMs, combinedSignal);
        attempt += 1;
      }
    }
  } finally {
    unlink();
  }
}

export type ToolNameResolver<TTool> = (tool: TTool) => string | undefined;

export interface SafeModeTuningOptions<TTool> {
  readonly temperature: number;
  readonly tools?: readonly TTool[];
  readonly safeMode?: boolean;
  readonly temperatureCap?: number;
  readonly safeToolNames?: readonly string[];
  readonly toolNameAccessor?: ToolNameResolver<TTool>;
}

export interface SafeModeTuningResult<TTool> {
  readonly temperature: number;
  readonly tools: readonly TTool[];
  readonly removedTools: readonly TTool[];
  readonly safeMode: boolean;
}

const DEFAULT_TOOL_NAME_RESOLVER: ToolNameResolver<{ readonly name?: string }> = (tool) => tool?.name;

export function applySafeModeGuard<TTool>(
  {
    temperature,
    tools = [],
    safeMode,
    temperatureCap = SAFE_MODE_TEMPERATURE_CAP,
    safeToolNames = [],
    toolNameAccessor,
  }: SafeModeTuningOptions<TTool>,
): SafeModeTuningResult<TTool> {
  const enabled = safeMode ?? safeModeEnabled;
  if (!enabled) {
    return { temperature, tools, removedTools: [], safeMode: false };
  }

  const accessor = (toolNameAccessor as ToolNameResolver<TTool> | undefined) ??
    (DEFAULT_TOOL_NAME_RESOLVER as ToolNameResolver<TTool>);
  const allowedNames = new Set((safeToolNames ?? []).map((name) => name.trim()).filter(Boolean));

  const filteredTools = tools.filter((tool) => {
    if (allowedNames.size === 0) {
      return false;
    }
    const name = accessor(tool);
    return Boolean(name && allowedNames.has(name));
  });

  const removedTools = tools.filter((tool) => !filteredTools.includes(tool));
  const cappedTemperature = Math.min(temperature, temperatureCap);

  return {
    temperature: cappedTemperature,
    tools: filteredTools,
    removedTools,
    safeMode: true,
  };
}

export interface CompletionPreparationOptions<TTool> {
  readonly prompt: string;
  readonly promptTokens: number;
  readonly modelMaxTokens: number;
  readonly temperature: number;
  readonly tools?: readonly TTool[];
  readonly safeMode?: boolean;
  readonly safeToolNames?: readonly string[];
  readonly toolNameAccessor?: ToolNameResolver<TTool>;
  readonly temperatureCap?: number;
  readonly reservedForResponse?: number;
  readonly minimumResponseTokens?: number;
  readonly maxInputLength?: number;
  readonly allowNewlines?: boolean;
}

export interface CompletionPreparationResult<TTool> extends SafeModeTuningResult<TTool> {
  readonly sanitizedPrompt: string;
  readonly tokenBudget: TokenBudgetResult;
}

export function prepareCompletionRequest<TTool>(
  options: CompletionPreparationOptions<TTool>,
): CompletionPreparationResult<TTool> {
  const sanitizedPrompt = sanitizeAiInput(options.prompt, {
    maxLength: options.maxInputLength,
    allowNewlines: options.allowNewlines,
  });

  const tokenBudget = calculateTokenBudget({
    modelMaxTokens: options.modelMaxTokens,
    promptTokens: options.promptTokens,
    reservedForResponse: options.reservedForResponse,
    minimumResponseTokens: options.minimumResponseTokens,
  });

  const tuning = applySafeModeGuard({
    temperature: options.temperature,
    tools: options.tools,
    safeMode: options.safeMode,
    safeToolNames: options.safeToolNames,
    toolNameAccessor: options.toolNameAccessor,
    temperatureCap: options.temperatureCap,
  });

  return {
    sanitizedPrompt,
    tokenBudget,
    ...tuning,
  };
}

export interface StreamingAborter {
  readonly signal: AbortSignal;
  abort(reason?: unknown): void;
  linkStream(reader: Pick<ReadableStreamDefaultReader<unknown>, "cancel">): () => void;
  onAbort(listener: (reason: unknown) => void): () => void;
}

export interface StreamingAbortOptions {
  readonly signal?: AbortSignal;
}

export function createStreamingAborter({ signal }: StreamingAbortOptions = {}): StreamingAborter {
  const controller = new AbortController();
  const unlink = linkAbortSignal(signal, controller);

  const cancelers = new Set<(reason: unknown) => void>();
  const listeners = new Set<(reason: unknown) => void>();

  const notify = (reason: unknown) => {
    for (const cancel of cancelers) {
      try {
        cancel(reason);
      } catch {
        // ignore cancellation failures
      }
    }
    cancelers.clear();

    for (const listener of listeners) {
      try {
        listener(reason);
      } catch {
        // ignore listener failures
      }
    }
  };

  controller.signal.addEventListener(
    "abort",
    () => {
      notify(controller.signal.reason);
      unlink();
    },
    { once: true },
  );

  return {
    get signal() {
      return controller.signal;
    },
    abort(reason?: unknown) {
      if (!controller.signal.aborted) {
        controller.abort(reason);
      }
    },
    linkStream(reader) {
      const canceler = (reason: unknown) => {
        void reader.cancel(reason);
      };
      cancelers.add(canceler);
      if (controller.signal.aborted) {
        canceler(controller.signal.reason);
      }
      return () => {
        cancelers.delete(canceler);
      };
    },
    onAbort(listener) {
      listeners.add(listener);
      if (controller.signal.aborted) {
        listener(controller.signal.reason);
      }
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
