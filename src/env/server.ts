import {
  createServerSchema,
  formatIssues,
  normalizeSlug,
  resolveValidationMode,
  withFallbackJsonStringify,
} from "./schema";

const validationMode = resolveValidationMode(process.env);
const schema = createServerSchema(validationMode);
const parsed = withFallbackJsonStringify(() => schema.safeParse(process.env));

if (!parsed.success) {
  const message = `Invalid server environment variables:\n${formatIssues(parsed.error)}`;

  if (validationMode === "strict") {
    throw new Error(message);
  }

  console.error(message);
  throw new Error("Invalid environment configuration. See logs for details.");
}

const rawEnv = parsed.data;

export const env = {
  ANALYZE: rawEnv.ANALYZE,
  BASE_PATH: rawEnv.BASE_PATH,
  CI: rawEnv.CI,
  EXPORT_STATIC: rawEnv.EXPORT_STATIC,
  GITHUB_PAGES: rawEnv.GITHUB_PAGES,
  GITHUB_REPOSITORY: rawEnv.GITHUB_REPOSITORY,
  NEXT_PHASE: rawEnv.NEXT_PHASE,
  NEXT_PUBLIC_BASE_PATH: rawEnv.NEXT_PUBLIC_BASE_PATH,
  NEXT_PUBLIC_DEPTH_THEME: rawEnv.NEXT_PUBLIC_DEPTH_THEME,
  NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS:
    rawEnv.NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS,
  NEXT_PUBLIC_ORGANIC_DEPTH: rawEnv.NEXT_PUBLIC_ORGANIC_DEPTH,
  NEXT_PUBLIC_UI_GLITCH_LANDING: rawEnv.NEXT_PUBLIC_UI_GLITCH_LANDING,
  NODE_ENV: rawEnv.NODE_ENV,
  SKIP_PREVIEW_STATIC: rawEnv.SKIP_PREVIEW_STATIC,
  validationMode,
  basePath: rawEnv.NEXT_PUBLIC_BASE_PATH.normalized,
  basePathOverride: rawEnv.BASE_PATH.normalized,
  basePathSlug: rawEnv.NEXT_PUBLIC_BASE_PATH.slug,
  repositorySlug: normalizeSlug(rawEnv.GITHUB_REPOSITORY?.split("/").pop()),
} as const;

export type ServerRuntimeEnv = typeof env;
