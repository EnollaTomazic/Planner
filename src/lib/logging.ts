// src/lib/logging.ts
// Structured logger with default PII redaction helpers.

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogDetails = Record<string, unknown>;

export type LogMethod = (message: string, ...details: unknown[]) => void;

export type LoggerContext = Readonly<Record<string, unknown>>;

export type Logger = {
  debug: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
  child: (suffix: string, context?: LoggerContext) => Logger;
};

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_PATTERN = /\b(?:\+?\d[\d\s.-]{7,}\d)\b/g;
const MAX_DEPTH = 5;
const MAX_ARRAY_LENGTH = 50;
const MAX_OBJECT_KEYS = 50;

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const CONSOLE_METHOD: Record<LogLevel, (label: string, payload: LogDetails) => void> = {
  debug(label, payload) {
    console.debug(label, payload);
  },
  info(label, payload) {
    console.info(label, payload);
  },
  warn(label, payload) {
    console.warn(label, payload);
  },
  error(label, payload) {
    console.error(label, payload);
  },
};

const rawMinimumLevel =
  process.env.NEXT_PUBLIC_LOG_LEVEL ??
  process.env.LOG_LEVEL ??
  (process.env.NODE_ENV === "production" ? "warn" : "debug");

const MIN_LEVEL: LogLevel = (Object.keys(LOG_LEVEL_ORDER) as LogLevel[]).includes(
  rawMinimumLevel as LogLevel,
)
  ? (rawMinimumLevel as LogLevel)
  : process.env.NODE_ENV === "production"
    ? "warn"
    : "debug";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_ORDER[level] <= LOG_LEVEL_ORDER[MIN_LEVEL];
}

function redactString(value: string): string {
  return value.replace(EMAIL_PATTERN, "[redacted-email]").replace(
    PHONE_PATTERN,
    "[redacted-number]",
  );
}

function redactUnknown(
  value: unknown,
  seen: WeakSet<object> = new WeakSet(),
  depth = 0,
): unknown {
  if (typeof value === "string") {
    return redactString(value);
  }

  if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return value;
  }

  if (typeof value === "bigint") {
    return redactString(value.toString());
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactString(value.message),
      stack: typeof value.stack === "string" ? redactString(value.stack) : undefined,
    };
  }

  if (Array.isArray(value)) {
    if (depth >= MAX_DEPTH) {
      return "[Truncated array]";
    }
    const limited = value.slice(0, MAX_ARRAY_LENGTH).map((item) =>
      redactUnknown(item, seen, depth + 1),
    );
    if (value.length > MAX_ARRAY_LENGTH) {
      limited.push(`[+${value.length - MAX_ARRAY_LENGTH} more items]`);
    }
    return limited;
  }

  if (value instanceof Map) {
    if (seen.has(value)) {
      return "[Circular]";
    }
    seen.add(value);
    if (depth >= MAX_DEPTH) {
      return "[Truncated map]";
    }
    const entriesList = Array.from(value.entries());
    const limitedEntries = entriesList.slice(0, MAX_OBJECT_KEYS).map(([key, entryValue]) => [
      redactUnknown(key, seen, depth + 1),
      redactUnknown(entryValue, seen, depth + 1),
    ]);
    if (entriesList.length > MAX_OBJECT_KEYS) {
      limitedEntries.push(["[Truncated]", `+${entriesList.length - MAX_OBJECT_KEYS} entries`]);
    }
    return limitedEntries;
  }

  if (value instanceof Set) {
    if (seen.has(value)) {
      return "[Circular]";
    }
    seen.add(value);
    if (depth >= MAX_DEPTH) {
      return "[Truncated set]";
    }
    const valuesList = Array.from(value.values());
    const limitedValues = valuesList
      .slice(0, MAX_ARRAY_LENGTH)
      .map((entryValue) => redactUnknown(entryValue, seen, depth + 1));
    if (valuesList.length > MAX_ARRAY_LENGTH) {
      limitedValues.push(`[+${valuesList.length - MAX_ARRAY_LENGTH} more items]`);
    }
    return limitedValues;
  }

  if (typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    if (seen.has(objectValue)) {
      return "[Circular]";
    }
    seen.add(objectValue);

    if (depth >= MAX_DEPTH) {
      return "[Truncated object]";
    }

    const objectEntries = Object.entries(objectValue);
    const limitedEntries = objectEntries
      .slice(0, MAX_OBJECT_KEYS)
      .map(([key, entryValue]) => [key, redactUnknown(entryValue, seen, depth + 1)]);
    if (objectEntries.length > MAX_OBJECT_KEYS) {
      limitedEntries.push(["[Truncated]", `+${objectEntries.length - MAX_OBJECT_KEYS} keys`]);
    }

    return Object.fromEntries(limitedEntries);
  }

  return value;
}

function normalizeScope(scope: string): string {
  const trimmed = scope.trim();
  return trimmed ? trimmed : "root";
}

function buildPrefix(scope: string): string {
  const normalized = normalizeScope(scope);
  return normalized ? `planner:${normalized}` : "planner";
}

function sanitizeContext(context?: LoggerContext): LogDetails | undefined {
  if (!context) {
    return undefined;
  }
  const entries = Object.entries(context);
  if (entries.length === 0) {
    return undefined;
  }
  return redactUnknown(Object.fromEntries(entries)) as LogDetails;
}

function createLogMethod(
  scope: string,
  context: LoggerContext,
  level: LogLevel,
): LogMethod {
  const sanitizedContext = sanitizeContext(context);
  const prefixLabel = buildPrefix(scope);
  return (message: string, ...details: unknown[]) => {
    if (!shouldLog(level)) {
      return;
    }

    const sanitizedMessage = typeof message === "string" ? redactString(message) : message;
    const sanitizedDetails = details.map((detail) => redactUnknown(detail));
    const payload: LogDetails = {
      level,
      scope: prefixLabel,
      message: sanitizedMessage,
      timestamp: new Date().toISOString(),
    };

    if (sanitizedContext) {
      payload.context = sanitizedContext;
    }

    if (sanitizedDetails.length > 0) {
      payload.details = sanitizedDetails;
    }

    CONSOLE_METHOD[level](`[${prefixLabel}]`, payload);
  };
}

export function createLogger(scope: string, context: LoggerContext = {}): Logger {
  const logMethods: Record<LogLevel, LogMethod> = {
    debug: createLogMethod(scope, context, "debug"),
    info: createLogMethod(scope, context, "info"),
    warn: createLogMethod(scope, context, "warn"),
    error: createLogMethod(scope, context, "error"),
  };

  return {
    ...logMethods,
    child(suffix: string, childContext: LoggerContext = {}): Logger {
      const nextScope = suffix ? `${normalizeScope(scope)}:${normalizeScope(suffix)}` : scope;
      return createLogger(nextScope, { ...context, ...childContext });
    },
  };
}

export const persistenceLogger = createLogger("persistence");
export const observabilityLogger = createLogger("observability");

export function redactForLogging<T>(value: T): T | unknown {
  return redactUnknown(value);
}
