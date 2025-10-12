import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

type MockedClientEnv = {
  NEXT_PUBLIC_BASE_PATH?: string;
  NEXT_PUBLIC_DEPTH_THEME?: string;
  NEXT_PUBLIC_ENABLE_METRICS?: string;
  NEXT_PUBLIC_FEATURE_GLITCH_LANDING?: string;
  NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS?: string;
  NEXT_PUBLIC_ORGANIC_DEPTH?: string;
  NEXT_PUBLIC_SAFE_MODE: string;
  NEXT_PUBLIC_SENTRY_DSN?: string;
  NEXT_PUBLIC_SENTRY_ENVIRONMENT?: string;
  NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE?: string;
  NEXT_PUBLIC_UI_GLITCH_LANDING?: string;
};

const baseEnv: MockedClientEnv = {
  NEXT_PUBLIC_SAFE_MODE: "true",
};

function mockClientEnv(overrides: Partial<MockedClientEnv>): void {
  const mockedEnv: MockedClientEnv = { ...baseEnv, ...overrides } as MockedClientEnv;

  vi.doMock("@env", () => ({
    __esModule: true,
    readClientEnv: vi.fn(() => mockedEnv),
  }));
}

describe("features.safeModeEnabled", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.doUnmock("@env");
    delete process.env.SAFE_MODE;
  });

  it("returns true when the typed client env enables the flag", async () => {
    mockClientEnv({ NEXT_PUBLIC_SAFE_MODE: "true" });

    const features = await import("../../src/lib/features");

    expect(features.safeModeEnabled).toBe(true);
    expect(features.isSafeModeEnabled()).toBe(true);
  });

  it("returns false when the typed client env disables the flag", async () => {
    mockClientEnv({ NEXT_PUBLIC_SAFE_MODE: "off" });

    const features = await import("../../src/lib/features");

    expect(features.safeModeEnabled).toBe(false);
  });

  it("ignores process.env overrides in favor of the typed env", async () => {
    process.env.SAFE_MODE = "1";
    mockClientEnv({ NEXT_PUBLIC_SAFE_MODE: "0" });

    const features = await import("../../src/lib/features");

    expect(features.safeModeEnabled).toBe(false);
  });
});

describe("features.glitchLandingEnabled", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.doUnmock("@env");
  });

  it("uses the legacy flag when the new alias is not provided", async () => {
    mockClientEnv({ NEXT_PUBLIC_UI_GLITCH_LANDING: "false" });

    const features = await import("../../src/lib/features");

    expect(features.glitchLandingEnabled).toBe(false);
  });

  it("prefers the new alias when both flags are provided", async () => {
    mockClientEnv({
      NEXT_PUBLIC_FEATURE_GLITCH_LANDING: "false",
      NEXT_PUBLIC_UI_GLITCH_LANDING: "true",
    });

    const features = await import("../../src/lib/features");

    expect(features.glitchLandingEnabled).toBe(false);
  });

  it("enables the flag when only the new alias is provided", async () => {
    mockClientEnv({ NEXT_PUBLIC_FEATURE_GLITCH_LANDING: "yes" });

    const features = await import("../../src/lib/features");

    expect(features.glitchLandingEnabled).toBe(true);
  });
});
