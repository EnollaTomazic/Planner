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
  return serverEnvSchema.parse({
    GITHUB_PAGES: source.GITHUB_PAGES,
    NEXT_PHASE: source.NEXT_PHASE,
    NODE_ENV: source.NODE_ENV,
    SAFE_MODE: source.SAFE_MODE,
    SENTRY_DSN: source.SENTRY_DSN,
    SENTRY_ENVIRONMENT: source.SENTRY_ENVIRONMENT,
    SENTRY_TRACES_SAMPLE_RATE: source.SENTRY_TRACES_SAMPLE_RATE,
    SKIP_PREVIEW_STATIC: source.SKIP_PREVIEW_STATIC,
  });
}

export default loadServerEnv;
