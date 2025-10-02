import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import loadServerEnvDefault, { loadServerEnv } from "../../env/server";

describe("loadServerEnv", () => {
  it("throws when SAFE_MODE is missing", () => {
    const attempt = () =>
      loadServerEnv({
        GITHUB_PAGES: "true",
        NEXT_PHASE: "phase",
        NODE_ENV: "production",
      } as unknown as NodeJS.ProcessEnv);

    expect(attempt).toThrowError(ZodError);
    expect(attempt).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_type",
          "expected": "string",
          "received": "undefined",
          "path": [
            "SAFE_MODE"
          ],
          "message": "SAFE_MODE must be provided to coordinate server safe mode."
        }
      ]]
    `);
  });

  it("throws when SENTRY_ENVIRONMENT is provided without a DSN", () => {
    const attempt = () =>
      loadServerEnv({
        NODE_ENV: "production",
        SAFE_MODE: "false",
        SENTRY_ENVIRONMENT: "production",
      } as unknown as NodeJS.ProcessEnv);

    expect(attempt).toThrowError(ZodError);
    expect(attempt).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "path": [
            "SENTRY_DSN"
          ],
          "code": "custom",
          "message": "SENTRY_DSN is required when configuring server Sentry options."
        }
      ]]
    `);
  });

  it("throws when SENTRY_TRACES_SAMPLE_RATE is provided without a DSN", () => {
    const attempt = () =>
      loadServerEnv({
        NODE_ENV: "production",
        SAFE_MODE: "false",
        SENTRY_TRACES_SAMPLE_RATE: "0.5",
      } as unknown as NodeJS.ProcessEnv);

    expect(attempt).toThrowError(ZodError);
    expect(attempt).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "path": [
            "SENTRY_DSN"
          ],
          "code": "custom",
          "message": "SENTRY_DSN is required when configuring server Sentry options."
        }
      ]]
    `);
  });

  it("throws when SAFE_MODE is missing at runtime", () => {
    const originalSafeMode = process.env.SAFE_MODE;
    const originalNextPublicSafeMode = process.env.NEXT_PUBLIC_SAFE_MODE;

    delete process.env.SAFE_MODE;
    delete process.env.NEXT_PUBLIC_SAFE_MODE;

    try {
      const attempt = () => loadServerEnvDefault();

      expect(attempt).toThrowError(ZodError);
      expect(attempt).toThrowErrorMatchingInlineSnapshot(`
        [ZodError: [
          {
            "code": "invalid_type",
            "expected": "string",
            "received": "undefined",
            "path": [
              "SAFE_MODE"
            ],
            "message": "SAFE_MODE must be provided to coordinate server safe mode."
          }
        ]]
      `);
    } finally {
      if (typeof originalSafeMode === "string") {
        process.env.SAFE_MODE = originalSafeMode;
      } else {
        delete process.env.SAFE_MODE;
      }

      if (typeof originalNextPublicSafeMode === "string") {
        process.env.NEXT_PUBLIC_SAFE_MODE = originalNextPublicSafeMode;
      } else {
        delete process.env.NEXT_PUBLIC_SAFE_MODE;
      }
    }
  });

  it("matches the happy-path snapshot", () => {
    const env = loadServerEnv({
      GITHUB_PAGES: "false",
      NEXT_PHASE: "phase-production",
      NODE_ENV: "production",
      SAFE_MODE: "true",
      SENTRY_DSN: "https://key@example.ingest.sentry.io/42",
      SENTRY_ENVIRONMENT: "preview",
      SENTRY_TRACES_SAMPLE_RATE: "0.25",
      SKIP_PREVIEW_STATIC: "true",
    } as unknown as NodeJS.ProcessEnv);

    expect(env).toMatchInlineSnapshot(`
      {
        "GITHUB_PAGES": "false",
        "NEXT_PHASE": "phase-production",
        "NODE_ENV": "production",
        "SAFE_MODE": "true",
        "SENTRY_DSN": "https://key@example.ingest.sentry.io/42",
        "SENTRY_ENVIRONMENT": "preview",
        "SENTRY_TRACES_SAMPLE_RATE": "0.25",
        "SKIP_PREVIEW_STATIC": "true",
      }
    `);
  });
});
