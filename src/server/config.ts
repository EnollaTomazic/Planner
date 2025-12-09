import { z } from 'zod'

const booleanFromEnv = (envVar: string, fallback: boolean) =>
  z.preprocess((value) => {
    if (value === undefined) return fallback

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase()

      if (normalized === 'true') return true
      if (normalized === 'false') return false
    }

    return value
  }, z.boolean())

const numberFromEnv = (
  envVar: string,
  fallback: number,
  options?: {
    int?: boolean
    min?: number
    max?: number
  },
) =>
  z.preprocess((value) => {
    if (value === undefined) return fallback

    if (typeof value === 'string' && value.trim().length === 0) {
      return fallback
    }

    const parsed = typeof value === 'number' ? value : Number(value)

    return Number.isFinite(parsed) ? parsed : value
  }, z.number())
    .transform((value) => (options?.int ? Math.trunc(value) : value))
    .refine((value) => (options?.min === undefined ? true : value >= options.min), {
      message: `${envVar} must be at least ${options?.min ?? 0}.`,
    })
    .refine((value) => (options?.max === undefined ? true : value <= options.max), {
      message: `${envVar} must be at most ${options?.max ?? Number.POSITIVE_INFINITY}.`,
    })

const optionalString = (envVar: string) =>
  z
    .string()
    .trim()
    .min(1, `${envVar} cannot be an empty string.`)
    .optional()

const envSchema = z.object({
  // Repository slug used for GitHub Pages exports and asset URLs.
  BASE_PATH: z.string().trim().default(''),
  // Browser-visible base path mirroring BASE_PATH for navigation and asset fetching.
  NEXT_PUBLIC_BASE_PATH: z.string().trim().default(''),
  // Client metrics toggle: auto enables in production when an endpoint is configured.
  NEXT_PUBLIC_ENABLE_METRICS: z
    .enum(['auto', 'true', 'false'])
    .default('auto'),
  // Endpoint used by the browser to submit web vitals.
  NEXT_PUBLIC_METRICS_ENDPOINT: z.string().trim().optional(),
  // Mirrors GitHub Pages mode client-side so static exports disable server-only paths.
  NEXT_PUBLIC_GITHUB_PAGES: booleanFromEnv('NEXT_PUBLIC_GITHUB_PAGES', false),
  // Preferred glitch landing flag; supersedes the legacy UI variant.
  NEXT_PUBLIC_FEATURE_GLITCH_LANDING: booleanFromEnv(
    'NEXT_PUBLIC_FEATURE_GLITCH_LANDING',
    true,
  ),
  // Legacy glitch landing flag kept for backward compatibility.
  NEXT_PUBLIC_UI_GLITCH_LANDING: booleanFromEnv('NEXT_PUBLIC_UI_GLITCH_LANDING', true),
  // Feature toggle for SVG numeric filters in planner UI components.
  NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS: booleanFromEnv(
    'NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS',
    true,
  ),
  // Enables the depth-themed palette on the client.
  NEXT_PUBLIC_DEPTH_THEME: booleanFromEnv('NEXT_PUBLIC_DEPTH_THEME', false),
  // Experimental organic depth visuals layered on top of the depth theme.
  NEXT_PUBLIC_ORGANIC_DEPTH: booleanFromEnv('NEXT_PUBLIC_ORGANIC_DEPTH', false),
  // Server-side safe mode for AI tooling.
  SAFE_MODE: booleanFromEnv('SAFE_MODE', true),
  // Client-side mirror of SAFE_MODE for browser logic.
  NEXT_PUBLIC_SAFE_MODE: booleanFromEnv('NEXT_PUBLIC_SAFE_MODE', true),
  // Grapheme cap applied when sanitizing prompts.
  AI_MAX_INPUT_LENGTH: numberFromEnv('AI_MAX_INPUT_LENGTH', 16000, { int: true, min: 1 }),
  // Heuristic tokens-per-character ratio used for budgeting.
  AI_TOKENS_PER_CHAR: numberFromEnv('AI_TOKENS_PER_CHAR', 3, { min: 0.1 }),
  // Maximum combined prompt + response tokens while safe mode is enabled.
  SAFE_MODE_TOKEN_CEILING: numberFromEnv('SAFE_MODE_TOKEN_CEILING', 8000, {
    int: true,
    min: 1,
  }),
  // Reserved tokens kept for responses in safe mode.
  SAFE_MODE_RESPONSE_RESERVE: numberFromEnv('SAFE_MODE_RESPONSE_RESERVE', 512, {
    int: true,
    min: 0,
  }),
  // Highest temperature allowed during safe mode runs.
  SAFE_MODE_TEMPERATURE_CEILING: numberFromEnv(
    'SAFE_MODE_TEMPERATURE_CEILING',
    0.4,
    { min: 0 },
  ),
  // Maximum tool calls permitted per safe-mode exchange.
  SAFE_MODE_MAX_TOOL_CALLS: numberFromEnv('SAFE_MODE_MAX_TOOL_CALLS', 1, {
    int: true,
    min: 0,
  }),
  // GitHub Pages flag for Next.js builds.
  GITHUB_PAGES: booleanFromEnv('GITHUB_PAGES', false),
  // Skip rendering preview routes when exporting static HTML.
  SKIP_PREVIEW_STATIC: booleanFromEnv('SKIP_PREVIEW_STATIC', false),
  // Server-side Sentry DSN.
  SENTRY_DSN: optionalString('SENTRY_DSN'),
  // Environment label for server Sentry events.
  SENTRY_ENVIRONMENT: optionalString('SENTRY_ENVIRONMENT'),
  // Overrides server tracing sample rate for Sentry.
  SENTRY_TRACES_SAMPLE_RATE: z
    .preprocess((value) => {
      if (value === undefined || (typeof value === 'string' && value.trim().length === 0)) {
        return undefined
      }

      const parsed = typeof value === 'number' ? value : Number(value)

      return Number.isFinite(parsed) ? parsed : value
    }, z.number())
    .refine((value) => value >= 0, {
      message: 'SENTRY_TRACES_SAMPLE_RATE must be zero or positive.',
    })
    .optional(),
  // Browser Sentry DSN.
  NEXT_PUBLIC_SENTRY_DSN: optionalString('NEXT_PUBLIC_SENTRY_DSN'),
  // Environment label for browser Sentry events.
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: optionalString('NEXT_PUBLIC_SENTRY_ENVIRONMENT'),
  // Overrides browser tracing sample rate for Sentry.
  NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: z
    .preprocess((value) => {
      if (value === undefined || (typeof value === 'string' && value.trim().length === 0)) {
        return undefined
      }

      const parsed = typeof value === 'number' ? value : Number(value)

      return Number.isFinite(parsed) ? parsed : value
    }, z.number())
    .refine((value) => value >= 0, {
      message: 'NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE must be zero or positive.',
    })
    .optional(),
  // Personal access token for CI-driven deploys.
  GITHUB_TOKEN: z.string().optional(),
  // owner/repo slug for deploy steps when no git remote exists.
  GITHUB_REPOSITORY: z.string().optional(),
  // Target branch for GitHub Pages deployments.
  GH_PAGES_BRANCH: z.string().trim().default('gh-pages'),
  // Optional alias understood by the deploy script.
  GITHUB_PAGES_BRANCH: z.string().trim().optional(),
  // Optional API base URL for future integrations.
  NEXT_PUBLIC_API_BASE_URL: z.string().trim().optional(),
  // Internal Next.js phase override used for debugging.
  NEXT_PHASE: z.string().trim().optional(),
  // Runtime environment indicator managed by Next.js.
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  const formatted = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
    .join('\n')

  throw new Error(`Invalid environment configuration:\n${formatted}`)
}

export const config = Object.freeze(parsedEnv.data)

export type Config = typeof config
