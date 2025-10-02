import { z } from "zod";

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
  .min(1, "SAFE_MODE cannot be an empty string.");

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

export function loadServerEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  const shouldInjectDefaults = source === process.env;

  const normalizedSource = shouldInjectDefaults
    ? {
        ...source,
        SAFE_MODE: source.SAFE_MODE ?? source.NEXT_PUBLIC_SAFE_MODE ?? "false",
      }
    : source;

  return serverEnvSchema.parse({
    GITHUB_PAGES: normalizedSource.GITHUB_PAGES,
    NEXT_PHASE: normalizedSource.NEXT_PHASE,
    NODE_ENV: normalizedSource.NODE_ENV,
    SAFE_MODE: normalizedSource.SAFE_MODE,
    SENTRY_DSN: normalizedSource.SENTRY_DSN,
    SENTRY_ENVIRONMENT: normalizedSource.SENTRY_ENVIRONMENT,
    SENTRY_TRACES_SAMPLE_RATE: normalizedSource.SENTRY_TRACES_SAMPLE_RATE,
    SKIP_PREVIEW_STATIC: normalizedSource.SKIP_PREVIEW_STATIC,
  });
}
