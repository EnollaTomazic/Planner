import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import { loadServerEnv } from "../../env/server";

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

  it("throws when Sentry toggles are provided without a DSN", () => {
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
