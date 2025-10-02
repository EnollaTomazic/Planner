import {
  createClientSchema,
  formatIssues,
  resolveValidationMode,
  withFallbackJsonStringify,
} from "./schema";

const validationMode = resolveValidationMode(process.env);
const schema = createClientSchema(validationMode);
const parsed = withFallbackJsonStringify(() => schema.safeParse(process.env));

if (!parsed.success) {
  const message = `Invalid client environment variables:\n${formatIssues(parsed.error)}`;

  if (validationMode === "strict") {
    throw new Error(message);
  }

  console.error(message);
  throw new Error("Invalid environment configuration. See logs for details.");
}

const rawEnv = parsed.data;

export const env = {
  NODE_ENV: rawEnv.NODE_ENV,
  NEXT_PUBLIC_BASE_PATH: rawEnv.NEXT_PUBLIC_BASE_PATH,
  NEXT_PUBLIC_DEPTH_THEME: rawEnv.NEXT_PUBLIC_DEPTH_THEME,
  NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS:
    rawEnv.NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS,
  NEXT_PUBLIC_ORGANIC_DEPTH: rawEnv.NEXT_PUBLIC_ORGANIC_DEPTH,
  NEXT_PUBLIC_UI_GLITCH_LANDING: rawEnv.NEXT_PUBLIC_UI_GLITCH_LANDING,
  validationMode,
  basePath: rawEnv.NEXT_PUBLIC_BASE_PATH.normalized,
} as const;

export type ClientRuntimeEnv = typeof env;
