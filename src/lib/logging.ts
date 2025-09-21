// src/lib/logging.ts
// Lightweight scoped logger used across client utilities.

export type Logger = {
  warn: (message: string, ...details: unknown[]) => void;
};

const isProduction = process.env.NODE_ENV === "production";

function formatPrefix(scope: string): string {
  const trimmed = scope.trim();
  return trimmed ? `[planner:${trimmed}]` : "[planner]";
}

export function createLogger(scope: string): Logger {
  const prefix = formatPrefix(scope);
  if (isProduction) {
    const warn: Logger["warn"] = () => {
      /* no-op in production */
    };
    return {
      warn,
    };
  }
  return {
    warn(message: string, ...details: unknown[]) {
      if (details.length > 0) {
        console.warn(`${prefix} ${message}`, ...details);
      } else {
        console.warn(`${prefix} ${message}`);
      }
    },
  };
}

export const persistenceLogger = createLogger("persistence");
