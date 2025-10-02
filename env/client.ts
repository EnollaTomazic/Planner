import { z } from "zod";

type ClientEnvSchema = z.ZodObject<{
  NEXT_PUBLIC_BASE_PATH: z.ZodOptional<z.ZodString>;
  NEXT_PUBLIC_DEPTH_THEME: z.ZodOptional<z.ZodString>;
  NEXT_PUBLIC_ENABLE_METRICS: z.ZodOptional<z.ZodString>;
  NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS: z.ZodOptional<z.ZodString>;
  NEXT_PUBLIC_ORGANIC_DEPTH: z.ZodOptional<z.ZodString>;
  NEXT_PUBLIC_SENTRY_DSN: z.ZodOptional<z.ZodString>;
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.ZodOptional<z.ZodString>;
  NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: z.ZodOptional<z.ZodString>;
  NEXT_PUBLIC_UI_GLITCH_LANDING: z.ZodOptional<z.ZodString>;
}>;

const clientEnvSchema: ClientEnvSchema = z.object({
  NEXT_PUBLIC_BASE_PATH: z.string().optional(),
  NEXT_PUBLIC_DEPTH_THEME: z.string().optional(),
  NEXT_PUBLIC_ENABLE_METRICS: z.string().optional(),
  NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS: z.string().optional(),
  NEXT_PUBLIC_ORGANIC_DEPTH: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.string().optional(),
  NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: z.string().optional(),
  NEXT_PUBLIC_UI_GLITCH_LANDING: z.string().optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export function loadClientEnv(source: NodeJS.ProcessEnv = process.env): ClientEnv {
  return clientEnvSchema.parse({
    NEXT_PUBLIC_BASE_PATH: source.NEXT_PUBLIC_BASE_PATH,
    NEXT_PUBLIC_DEPTH_THEME: source.NEXT_PUBLIC_DEPTH_THEME,
    NEXT_PUBLIC_ENABLE_METRICS: source.NEXT_PUBLIC_ENABLE_METRICS,
    NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS: source.NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS,
    NEXT_PUBLIC_ORGANIC_DEPTH: source.NEXT_PUBLIC_ORGANIC_DEPTH,
    NEXT_PUBLIC_SENTRY_DSN: source.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: source.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
    NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE:
      source.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
    NEXT_PUBLIC_UI_GLITCH_LANDING: source.NEXT_PUBLIC_UI_GLITCH_LANDING,
  });
}
