import { z } from "zod";

const SAFE_MODE_FALLBACK = "true";

const optionalNonEmptyString = z
  .string()
  .trim()
  .min(1, "Value cannot be an empty string.")
  .optional();

const safeModeSchema = z
  .string({
    required_error: "SAFE_MODE must be provided to coordinate server safe mode.",
  })
  .trim()
  .min(1, "SAFE_MODE cannot be an empty string.")
  .default(SAFE_MODE_FALLBACK);

const serverEnvSchema = z
  .object({
    GITHUB_PAGES: z.string().optional(),
    NEXT_PHASE: z.string().optional(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    SAFE_MODE: safeModeSchema,
    SENTRY_DSN: optionalNonEmptyString,
    SENTRY_ENVIRONMENT: optionalNonEmptyString,
    SENTRY_TRACES_SAMPLE_RATE: optionalNonEmptyString,
    SKIP_PREVIEW_STATIC: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    const hasSentryConfig =
      value.SENTRY_ENVIRONMENT !== undefined || value.SENTRY_TRACES_SAMPLE_RATE !== undefined;

    if (!value.SENTRY_DSN && hasSentryConfig) {
      ctx.addIssue({
        path: ["SENTRY_DSN"],
        code: z.ZodIssueCode.custom,
        message: "SENTRY_DSN is required when configuring server Sentry options.",
      });
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

function withSafeModeFallback(source: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  if (source.SAFE_MODE !== undefined) {
    return source;
  }

  const safeModeKey = "SAFE_MODE";
  const publicSafeModeKey = "NEXT_PUBLIC_SAFE_MODE";

  const envWithFallback: NodeJS.ProcessEnv = {
    ...source,
    [safeModeKey]: SAFE_MODE_FALLBACK,
  };

  if (typeof process !== "undefined" && source === process.env) {
    source[safeModeKey] = SAFE_MODE_FALLBACK;

    const publicSafeModeValue = source[publicSafeModeKey];

    if (!publicSafeModeValue || publicSafeModeValue.trim().length === 0) {
      source[publicSafeModeKey] = SAFE_MODE_FALLBACK;
    }
  }

  if (typeof console !== "undefined" && typeof console.warn === "function") {
    console.warn(
      '[env] SAFE_MODE was missing; defaulting to "true" so the server runtime can continue with stricter AI guardrails.'
    );
  }

  return envWithFallback;
}

export function loadServerEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  const envSource = withSafeModeFallback(source);

  return serverEnvSchema.parse({
    GITHUB_PAGES: envSource.GITHUB_PAGES,
    NEXT_PHASE: envSource.NEXT_PHASE,
    NODE_ENV: envSource.NODE_ENV,
    SAFE_MODE: envSource.SAFE_MODE,
    SENTRY_DSN: envSource.SENTRY_DSN,
    SENTRY_ENVIRONMENT: envSource.SENTRY_ENVIRONMENT,
    SENTRY_TRACES_SAMPLE_RATE: envSource.SENTRY_TRACES_SAMPLE_RATE,
    SKIP_PREVIEW_STATIC: envSource.SKIP_PREVIEW_STATIC,
  });
}

export default loadServerEnv;
