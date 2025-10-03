import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import loadClientEnvDefault, { loadClientEnv } from "../../env/client";

describe("loadClientEnv", () => {
  it("defaults NEXT_PUBLIC_SAFE_MODE to \"false\" when missing", () => {
    const env = loadClientEnv({
      NEXT_PUBLIC_BASE_PATH: "/planner",
    } as unknown as NodeJS.ProcessEnv);

    expect(env.NEXT_PUBLIC_SAFE_MODE).toBe("false");
  });

  it("throws when NEXT_PUBLIC_SAFE_MODE is provided but empty", () => {
    const attempt = () =>
      loadClientEnv({
        NEXT_PUBLIC_SAFE_MODE: "  ",
      } as unknown as NodeJS.ProcessEnv);

    expect(attempt).toThrowError(ZodError);
    expect(attempt).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "code": "too_small",
          "minimum": 1,
          "type": "string",
          "inclusive": true,
          "exact": false,
          "message": "NEXT_PUBLIC_SAFE_MODE cannot be an empty string.",
          "path": [
            "NEXT_PUBLIC_SAFE_MODE"
          ]
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

  it("defaults NEXT_PUBLIC_SAFE_MODE when missing at runtime", () => {
    const originalNextPublicSafeMode = process.env.NEXT_PUBLIC_SAFE_MODE;
    const originalSafeMode = process.env.SAFE_MODE;

    delete process.env.NEXT_PUBLIC_SAFE_MODE;
    delete process.env.SAFE_MODE;

    try {
      const env = loadClientEnvDefault();

      expect(env.NEXT_PUBLIC_SAFE_MODE).toBe("false");
    } finally {
      if (typeof originalNextPublicSafeMode === "string") {
        process.env.NEXT_PUBLIC_SAFE_MODE = originalNextPublicSafeMode;
      } else {
        delete process.env.NEXT_PUBLIC_SAFE_MODE;
      }

      if (typeof originalSafeMode === "string") {
        process.env.SAFE_MODE = originalSafeMode;
      } else {
        delete process.env.SAFE_MODE;
      }
    }
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
