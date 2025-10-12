import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

import { loadClientEnv, readClientEnv } from "../../env";

describe("loadClientEnv", () => {
  it("defaults NEXT_PUBLIC_SAFE_MODE to 'true' when missing", () => {
    const env = loadClientEnv({
      NEXT_PUBLIC_BASE_PATH: "/planner",
    } as unknown as NodeJS.ProcessEnv);

    expect(env.NEXT_PUBLIC_SAFE_MODE).toBe("true");
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

  it("falls back to safe mode defaults when NEXT_PUBLIC_SAFE_MODE is missing at runtime", () => {
    const originalNextPublicSafeMode = process.env.NEXT_PUBLIC_SAFE_MODE;
    const originalSafeMode = process.env.SAFE_MODE;

    delete process.env.NEXT_PUBLIC_SAFE_MODE;
    delete process.env.SAFE_MODE;

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      const env = readClientEnv();

      expect(env.NEXT_PUBLIC_SAFE_MODE).toBe("true");
      expect(process.env.NEXT_PUBLIC_SAFE_MODE).toBe("true");
      expect(process.env.SAFE_MODE).toBe("true");
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("NEXT_PUBLIC_SAFE_MODE was missing"),
      );
    } finally {
      warn.mockRestore();
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

  it("does not crash when GitHub Pages runtime omits process", () => {
    vi.stubGlobal("process", undefined as unknown as NodeJS.Process);

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      const env = readClientEnv();

      expect(env.NEXT_PUBLIC_SAFE_MODE).toBe("true");
      expect(error).not.toHaveBeenCalled();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("NEXT_PUBLIC_SAFE_MODE was missing"),
      );
    } finally {
      warn.mockRestore();
      error.mockRestore();
      vi.unstubAllGlobals();
    }
  });

  it("surfaces validation errors when NEXT_PUBLIC_SAFE_MODE is blank", () => {
    const originalNextPublicSafeMode = process.env.NEXT_PUBLIC_SAFE_MODE;
    const originalSafeMode = process.env.SAFE_MODE;

    process.env.NEXT_PUBLIC_SAFE_MODE = "  ";
    delete process.env.SAFE_MODE;

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      expect(() => readClientEnv()).toThrowError(ZodError);
      expect(warn).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
      expect(process.env.SAFE_MODE).toBeUndefined();
    } finally {
      warn.mockRestore();
      error.mockRestore();

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
        "NEXT_PUBLIC_FEATURE_GLITCH_LANDING": undefined,
        "NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS": "true",
        "NEXT_PUBLIC_METRICS_ENDPOINT": undefined,
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
