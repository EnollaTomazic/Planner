import { z } from "zod";

const optionalNonEmptyString = z
  .string()
  .trim()
  .min(1, "Value cannot be an empty string.")
  .optional();

const safeModeSchema = z
  .string({
    required_error: "NEXT_PUBLIC_SAFE_MODE must be provided to coordinate client safe mode.",
  })
  .trim()
  .min(1, "NEXT_PUBLIC_SAFE_MODE cannot be an empty string.");

const clientEnvSchema = z
  .object({
    NEXT_PUBLIC_BASE_PATH: z.string().optional(),
    NEXT_PUBLIC_DEPTH_THEME: z.string().optional(),
    NEXT_PUBLIC_ENABLE_METRICS: z.string().optional(),
    NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS: z.string().optional(),
    NEXT_PUBLIC_ORGANIC_DEPTH: z.string().optional(),
    NEXT_PUBLIC_SAFE_MODE: safeModeSchema,
    NEXT_PUBLIC_SENTRY_DSN: optionalNonEmptyString,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: optionalNonEmptyString,
    NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: optionalNonEmptyString,
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

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export function loadClientEnv(source: NodeJS.ProcessEnv = process.env): ClientEnv {
  const shouldInjectDefaults = source === process.env;

  const normalizedSource = shouldInjectDefaults
    ? {
        ...source,
        NEXT_PUBLIC_SAFE_MODE: source.NEXT_PUBLIC_SAFE_MODE ?? source.SAFE_MODE ?? "false",
      }
    : source;

  return clientEnvSchema.parse({
    NEXT_PUBLIC_BASE_PATH: normalizedSource.NEXT_PUBLIC_BASE_PATH,
    NEXT_PUBLIC_DEPTH_THEME: normalizedSource.NEXT_PUBLIC_DEPTH_THEME,
    NEXT_PUBLIC_ENABLE_METRICS: normalizedSource.NEXT_PUBLIC_ENABLE_METRICS,
    NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS: normalizedSource.NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS,
    NEXT_PUBLIC_ORGANIC_DEPTH: normalizedSource.NEXT_PUBLIC_ORGANIC_DEPTH,
    NEXT_PUBLIC_SAFE_MODE: normalizedSource.NEXT_PUBLIC_SAFE_MODE,
    NEXT_PUBLIC_SENTRY_DSN: normalizedSource.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: normalizedSource.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
    NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE:
      normalizedSource.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
    NEXT_PUBLIC_UI_GLITCH_LANDING: normalizedSource.NEXT_PUBLIC_UI_GLITCH_LANDING,
  });
}
