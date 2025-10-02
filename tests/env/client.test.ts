import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import { loadClientEnv } from "../../env/client";

describe("loadClientEnv", () => {
  it("throws when NEXT_PUBLIC_SAFE_MODE is missing", () => {
    const attempt = () =>
      loadClientEnv({
        NEXT_PUBLIC_BASE_PATH: "/planner",
      } as unknown as NodeJS.ProcessEnv);

    expect(attempt).toThrowError(ZodError);
    expect(attempt).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_type",
          "expected": "string",
          "received": "undefined",
          "path": [
            "NEXT_PUBLIC_SAFE_MODE"
          ],
          "message": "NEXT_PUBLIC_SAFE_MODE must be provided to coordinate client safe mode."
        }
      ]]
    `);
  });

  it("throws when NEXT_PUBLIC_SENTRY_ENVIRONMENT is provided without a DSN", () => {
    const attempt = () =>
      loadClientEnv({
        NEXT_PUBLIC_SAFE_MODE: "false",
        NEXT_PUBLIC_SENTRY_ENVIRONMENT: "preview",
      } as unknown as NodeJS.ProcessEnv);

    expect(attempt).toThrowError(ZodError);
    expect(attempt).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "path": [
            "NEXT_PUBLIC_SENTRY_DSN"
          ],
          "code": "custom",
          "message": "NEXT_PUBLIC_SENTRY_DSN is required when configuring browser Sentry options."
        }
      ]]
    `);
  });

  it("throws when NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE is provided without a DSN", () => {
    const attempt = () =>
      loadClientEnv({
        NEXT_PUBLIC_SAFE_MODE: "false",
        NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: "0.1",
      } as unknown as NodeJS.ProcessEnv);

    expect(attempt).toThrowError(ZodError);
    expect(attempt).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "path": [
            "NEXT_PUBLIC_SENTRY_DSN"
          ],
          "code": "custom",
          "message": "NEXT_PUBLIC_SENTRY_DSN is required when configuring browser Sentry options."
        }
      ]]
    `);
  });

  it("matches the happy-path snapshot", () => {
    const env = loadClientEnv({
      NEXT_PUBLIC_BASE_PATH: "/planner",
      NEXT_PUBLIC_DEPTH_THEME: "true",
      NEXT_PUBLIC_ENABLE_METRICS: "auto",
      NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS: "true",
      NEXT_PUBLIC_ORGANIC_DEPTH: "false",
      NEXT_PUBLIC_SAFE_MODE: "true",
      NEXT_PUBLIC_SENTRY_DSN: "https://key@example.ingest.sentry.io/42",
      NEXT_PUBLIC_SENTRY_ENVIRONMENT: "preview",
      NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: "0.1",
      NEXT_PUBLIC_UI_GLITCH_LANDING: "false",
    } as unknown as NodeJS.ProcessEnv);

    expect(env).toMatchInlineSnapshot(`
      {
        "NEXT_PUBLIC_BASE_PATH": "/planner",
        "NEXT_PUBLIC_DEPTH_THEME": "true",
        "NEXT_PUBLIC_ENABLE_METRICS": "auto",
        "NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS": "true",
        "NEXT_PUBLIC_ORGANIC_DEPTH": "false",
        "NEXT_PUBLIC_SAFE_MODE": "true",
        "NEXT_PUBLIC_SENTRY_DSN": "https://key@example.ingest.sentry.io/42",
        "NEXT_PUBLIC_SENTRY_ENVIRONMENT": "preview",
        "NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE": "0.1",
        "NEXT_PUBLIC_UI_GLITCH_LANDING": "false",
      }
    `);
  });
});
