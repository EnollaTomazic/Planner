import { z } from "zod";

export type ValidationMode = "strict" | "loose";

const ENABLED_BOOLEAN_VALUES = new Set([
  "1",
  "true",
  "yes",
  "on",
]);

const DISABLED_BOOLEAN_VALUES = new Set([
  "0",
  "false",
  "no",
  "off",
]);

export interface BooleanFlagOptions {
  readonly defaultValue?: boolean;
  readonly description: string;
}

function coerceBoolean(
  value: unknown,
  ctx: z.RefinementCtx,
  options: BooleanFlagOptions,
  mode: ValidationMode,
): boolean {
  const { defaultValue } = options;

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (Number.isNaN(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${options.description} must be a boolean-like value, received NaN`,
      });
      return z.NEVER;
    }
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized.length === 0) {
      if (typeof defaultValue === "boolean") {
        return defaultValue;
      }
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${options.description} must not be empty`,
      });
      return z.NEVER;
    }

    if (ENABLED_BOOLEAN_VALUES.has(normalized)) {
      return true;
    }

    if (DISABLED_BOOLEAN_VALUES.has(normalized)) {
      return false;
    }
  }

  if (typeof defaultValue === "boolean" && mode === "loose") {
    if (typeof console !== "undefined") {
      console.warn(
        `[env] ${options.description} received an invalid boolean-like value. Falling back to default (${String(
          defaultValue,
        )}).`,
      );
    }
    return defaultValue;
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: `${options.description} must be set to "true" or "false"`,
  });

  return z.NEVER;
}

export function createBooleanFlagSchema(
  mode: ValidationMode,
  options: BooleanFlagOptions,
) {
  const base = z
    .union([z.boolean(), z.string(), z.number()])
    .transform((value, ctx) => coerceBoolean(value, ctx, options, mode));

  if (typeof options.defaultValue === "boolean") {
    return z
      .union([base, z.undefined()])
      .transform<boolean>((value) => (value ?? options.defaultValue)!);
  }

  return base;
}

export type PathSegments = readonly string[];

export function collectPathSegments(raw: string): PathSegments {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "/") {
    return [];
  }

  return trimmed
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
}

export interface PathSetting {
  readonly normalized: string;
  readonly slug: string;
  readonly provided: boolean;
  readonly raw: string | undefined;
}

export function normalizeBasePath(value: string): { normalized: string; slug: string } {
  const segments = collectPathSegments(value);
  if (segments.length === 0) {
    return { normalized: "", slug: "" };
  }

  return {
    normalized: `/${segments.join("/")}`,
    slug: segments.join("/"),
  };
}

export function normalizeSlug(value: string | undefined): string | undefined {
  if (typeof value === "undefined") {
    return undefined;
  }

  const segments = collectPathSegments(value);
  return segments.length > 0 ? segments.join("/") : undefined;
}

export function createPathSettingSchema(mode: ValidationMode, description: string) {
  return z
    .union([z.string(), z.undefined()])
    .transform<PathSetting>((value, ctx) => {
      if (typeof value === "undefined") {
        return {
          normalized: "",
          slug: "",
          provided: false,
          raw: undefined,
        };
      }

      if (value.trim().length === 0) {
        return {
          normalized: "",
          slug: "",
          provided: true,
          raw: value,
        };
      }

      const { normalized, slug } = normalizeBasePath(value);

      if (!normalized) {
        if (mode === "strict") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${description} must contain at least one non-empty path segment when provided`,
          });
          return z.NEVER;
        }
        if (typeof console !== "undefined") {
          console.warn(
            `[env] ${description} resolved to an empty path. Falling back to the root path ("/").`,
          );
        }
      }

      return {
        normalized,
        slug,
        provided: true,
        raw: value,
      };
    });
}

export const NODE_ENV_VALUES = [
  "development",
  "production",
  "test",
] as const;

export function createNodeEnvSchema() {
  return z.enum(NODE_ENV_VALUES);
}

export function resolveValidationMode(env: NodeJS.ProcessEnv): ValidationMode {
  const nodeEnv = env.NODE_ENV ?? "";
  const isProduction = nodeEnv === "production";
  const isCI = env.CI === "true";

  if (!isProduction || isCI) {
    return "strict";
  }

  return "loose";
}

const repositoryPattern = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

export function createRepositorySlugSchema(mode: ValidationMode, description: string) {
  return z
    .union([z.string(), z.undefined()])
    .transform((value, ctx) => {
      if (typeof value === "undefined") {
        return undefined;
      }

      const trimmed = value.trim();
      if (trimmed.length === 0) {
        if (mode === "strict") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${description} must not be empty`,
          });
          return z.NEVER;
        }
        return undefined;
      }

      if (!repositoryPattern.test(trimmed)) {
        if (mode === "loose") {
          if (typeof console !== "undefined") {
            console.warn(
              `[env] ${description} is not a valid repository slug. Ignoring the value.`,
            );
          }
          return undefined;
        }
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${description} must follow the "owner/repository" format`,
        });
        return z.NEVER;
      }

      return trimmed;
    });
}

export function createClientSchema(mode: ValidationMode) {
  return z.object({
    NODE_ENV: createNodeEnvSchema(),
    NEXT_PUBLIC_BASE_PATH: createPathSettingSchema(
      mode,
      "NEXT_PUBLIC_BASE_PATH",
    ),
    NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS: createBooleanFlagSchema(mode, {
      defaultValue: true,
      description: "NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS",
    }),
    NEXT_PUBLIC_DEPTH_THEME: createBooleanFlagSchema(mode, {
      defaultValue: false,
      description: "NEXT_PUBLIC_DEPTH_THEME",
    }),
    NEXT_PUBLIC_ORGANIC_DEPTH: createBooleanFlagSchema(mode, {
      defaultValue: false,
      description: "NEXT_PUBLIC_ORGANIC_DEPTH",
    }),
    NEXT_PUBLIC_UI_GLITCH_LANDING: createBooleanFlagSchema(mode, {
      defaultValue: true,
      description: "NEXT_PUBLIC_UI_GLITCH_LANDING",
    }),
  });
}

export function createServerSchema(mode: ValidationMode) {
  return createClientSchema(mode).extend({
    BASE_PATH: createPathSettingSchema(mode, "BASE_PATH"),
    NODE_ENV: createNodeEnvSchema(),
    NEXT_PHASE: z.string().optional(),
    CI: createBooleanFlagSchema(mode, {
      defaultValue: false,
      description: "CI",
    }),
    ANALYZE: createBooleanFlagSchema(mode, {
      defaultValue: false,
      description: "ANALYZE",
    }),
    EXPORT_STATIC: createBooleanFlagSchema(mode, {
      defaultValue: false,
      description: "EXPORT_STATIC",
    }),
    GITHUB_PAGES: createBooleanFlagSchema(mode, {
      defaultValue: false,
      description: "GITHUB_PAGES",
    }),
    GITHUB_REPOSITORY: createRepositorySlugSchema(
      mode,
      "GITHUB_REPOSITORY",
    ),
    SKIP_PREVIEW_STATIC: createBooleanFlagSchema(mode, {
      defaultValue: false,
      description: "SKIP_PREVIEW_STATIC",
    }),
  });
}

export type ClientSchema = ReturnType<typeof createClientSchema>;
export type ServerSchema = ReturnType<typeof createServerSchema>;

export type ClientEnv = z.infer<ClientSchema>;
export type ServerEnv = z.infer<ServerSchema>;

export function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".");
      const prefix = path ? `${path}: ` : "";
      return `${prefix}${issue.message}`;
    })
    .join("\n");
}

const JSON_ESCAPE_REGEX = /["\\\u0000-\u001F]/g;

const JSON_ESCAPE_REPLACEMENTS: Record<string, string> = {
  '"': '\\"',
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "\t": "\\t",
};

function escapeJsonString(value: string): string {
  return value.replace(JSON_ESCAPE_REGEX, (char) => {
    const mapped = JSON_ESCAPE_REPLACEMENTS[char];
    if (mapped) {
      return mapped;
    }
    const code = char.charCodeAt(0).toString(16).padStart(4, "0");
    return `\\u${code}`;
  });
}

function fallbackJsonStringify(value: unknown): string {
  if (value === null) {
    return "null";
  }

  const valueType = typeof value;

  if (valueType === "string") {
    return `"${escapeJsonString(value as string)}"`;
  }

  if (valueType === "number") {
    if (!Number.isFinite(value as number)) {
      return "null";
    }
    return String(value);
  }

  if (valueType === "boolean") {
    return value ? "true" : "false";
  }

  if (valueType === "bigint") {
    return `${value as bigint}`;
  }

  if (Array.isArray(value)) {
    return `[${value
      .map((entry) =>
        typeof entry === "undefined" || typeof entry === "function" || typeof entry === "symbol"
          ? "null"
          : fallbackJsonStringify(entry),
      )
      .join(",")}]`;
  }

  if (valueType === "object" && value) {
    const entries: string[] = [];
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (
        typeof entry === "undefined" ||
        typeof entry === "function" ||
        typeof entry === "symbol"
      ) {
        continue;
      }
      entries.push(`${fallbackJsonStringify(key)}:${fallbackJsonStringify(entry)}`);
    }
    return `{${entries.join(",")}}`;
  }

  return "null";
}

export function withFallbackJsonStringify<T>(fn: () => T): T {
  const originalStringify = JSON.stringify as typeof JSON.stringify & {
    mock?: unknown;
    getMockImplementation?: () => unknown;
  };
  let restored = false;

  const isMocked =
    typeof originalStringify.mock !== "undefined" ||
    typeof originalStringify.getMockImplementation === "function";

  if (isMocked) {
    restored = true;
    JSON.stringify = fallbackJsonStringify as unknown as typeof JSON.stringify;
  } else {
    try {
      JSON.stringify({});
    } catch {
      restored = true;
      JSON.stringify = fallbackJsonStringify as unknown as typeof JSON.stringify;
    }
  }

  try {
    return fn();
  } finally {
    if (restored) {
      JSON.stringify = originalStringify;
    }
  }
}
