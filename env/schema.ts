import { z } from "zod";

export const SAFE_MODE_FALLBACK = "true";

const optionalNonEmptyString = z
  .string()
  .trim()
  .min(1, "Value cannot be an empty string.")
  .optional();

function createSafeModeSchema({
  key,
  message,
}: {
  readonly key: string;
  readonly message: string;
}) {
  return z
    .string({
      required_error: `${key} must be provided to coordinate ${message} safe mode.`,
    })
    .trim()
    .min(1, `${key} cannot be an empty string.`)
    .default(SAFE_MODE_FALLBACK);
}

export const clientEnvSchema = z
  .object({
    NEXT_PUBLIC_BASE_PATH: z.string().optional(),
    NEXT_PUBLIC_DEPTH_THEME: z.string().optional(),
    NEXT_PUBLIC_ENABLE_METRICS: z.string().optional(),
    NEXT_PUBLIC_METRICS_ENDPOINT: z.string().optional(),
    NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS: z.string().optional(),
    NEXT_PUBLIC_ORGANIC_DEPTH: z.string().optional(),
    NEXT_PUBLIC_SAFE_MODE: createSafeModeSchema({
      key: "NEXT_PUBLIC_SAFE_MODE",
      message: "client",
    }),
    NEXT_PUBLIC_SENTRY_DSN: optionalNonEmptyString,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: optionalNonEmptyString,
    NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: optionalNonEmptyString,
    NEXT_PUBLIC_FEATURE_GLITCH_LANDING: z.string().optional(),
    NEXT_PUBLIC_UI_GLITCH_LANDING: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    const hasSentryConfig =
      value.NEXT_PUBLIC_SENTRY_ENVIRONMENT !== undefined ||
      value.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE !== undefined;

    if (!value.NEXT_PUBLIC_SENTRY_DSN && hasSentryConfig) {
      ctx.addIssue({
        path: ["NEXT_PUBLIC_SENTRY_DSN"],
        code: z.ZodIssueCode.custom,
        message: "NEXT_PUBLIC_SENTRY_DSN is required when configuring browser Sentry options.",
      });
    }
  });

export const serverEnvSchema = z
  .object({
    GITHUB_PAGES: z.string().optional(),
    NEXT_PHASE: z.string().optional(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    SAFE_MODE: createSafeModeSchema({
      key: "SAFE_MODE",
      message: "server",
    }),
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

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
