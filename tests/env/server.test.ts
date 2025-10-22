import { afterEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

type EnvModule = typeof import("@env");

let envModule: EnvModule | undefined;

async function importEnvModule(): Promise<EnvModule> {
  envModule = await import("@env");
  return envModule;
}

afterEach(() => {
  envModule?.resetServerEnvCache();
  vi.resetModules();
  envModule = undefined;
});

describe("loadServerEnv", () => {
  it("hydrates SAFE_MODE from the build-time default when missing", async () => {
    const originalNextPublicSafeMode = process.env.NEXT_PUBLIC_SAFE_MODE;

    process.env.NEXT_PUBLIC_SAFE_MODE = "true";

    const { loadServerEnv } = await importEnvModule();

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      const env = loadServerEnv({
        GITHUB_PAGES: "true",
        NEXT_PHASE: "phase",
        NODE_ENV: "production",
      } as unknown as NodeJS.ProcessEnv);

      expect(env.SAFE_MODE).toBe("true");
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();

      if (typeof originalNextPublicSafeMode === "string") {
        process.env.NEXT_PUBLIC_SAFE_MODE = originalNextPublicSafeMode;
      } else {
        delete process.env.NEXT_PUBLIC_SAFE_MODE;
      }
    }
  });

  it("throws when SENTRY_ENVIRONMENT is provided without a DSN", async () => {
    const { loadServerEnv } = await importEnvModule();

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

  it("throws when SENTRY_TRACES_SAMPLE_RATE is provided without a DSN", async () => {
    const { loadServerEnv } = await importEnvModule();

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

  it("hydrates SAFE_MODE in process.env when missing at runtime", async () => {
    const originalSafeMode = process.env.SAFE_MODE;
    const originalNextPublicSafeMode = process.env.NEXT_PUBLIC_SAFE_MODE;

    process.env.NEXT_PUBLIC_SAFE_MODE = "true";

    const { readServerEnv } = await importEnvModule();

    delete process.env.SAFE_MODE;
    delete process.env.NEXT_PUBLIC_SAFE_MODE;

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      const env = readServerEnv();

      expect(env.SAFE_MODE).toBe("true");
      expect(process.env.SAFE_MODE).toBe("true");
      expect(process.env.NEXT_PUBLIC_SAFE_MODE).toBe("true");
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();

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

  it("falls back to SAFE_MODE defaults when compile-time and runtime values are missing", async () => {
    const originalSafeMode = process.env.SAFE_MODE;
    const originalNextPublicSafeMode = process.env.NEXT_PUBLIC_SAFE_MODE;

    delete process.env.SAFE_MODE;
    delete process.env.NEXT_PUBLIC_SAFE_MODE;

    const { readServerEnv } = await importEnvModule();

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      const env = readServerEnv();

      expect(env.SAFE_MODE).toBe("true");
      expect(process.env.SAFE_MODE).toBe("true");
      expect(process.env.NEXT_PUBLIC_SAFE_MODE).toBe("true");
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("NEXT_PUBLIC_SAFE_MODE was missing"),
      );
    } finally {
      warn.mockRestore();

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

  it("matches the happy-path snapshot", async () => {
    const { loadServerEnv } = await importEnvModule();

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
