import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const metric = {
  id: "abc123",
  name: "LCP",
  label: "web-vital" as const,
  value: 2500,
  startTime: 100,
  entries: [
    {
      name: "largest-contentful-paint",
      entryType: "largest-contentful-paint",
      startTime: 100,
      duration: 0,
      toJSON() {
        return {
          name: this.name,
          entryType: this.entryType,
          startTime: this.startTime,
          duration: this.duration,
        };
      },
    } as PerformanceEntry,
  ],
};

describe("reportWebVitals", () => {
  const originalEnv = process.env.NEXT_PUBLIC_ENABLE_METRICS;
  const originalBasePath = process.env.NEXT_PUBLIC_BASE_PATH;
  const originalFetch = global.fetch;
  const originalSendBeacon = navigator.sendBeacon;

  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_BASE_PATH = "";
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_ENABLE_METRICS = originalEnv;
    process.env.NEXT_PUBLIC_BASE_PATH = originalBasePath;
    global.fetch = originalFetch;
    if (typeof originalSendBeacon === "function") {
      Object.defineProperty(navigator, "sendBeacon", {
        configurable: true,
        value: originalSendBeacon,
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- restoring baseline for tests
      delete (navigator as Partial<typeof navigator>).sendBeacon;
    }
    vi.restoreAllMocks();
  });

  it("skips reporting when metrics are disabled", async () => {
    process.env.NEXT_PUBLIC_ENABLE_METRICS = "false";
    const sendBeacon = vi.fn();
    Object.defineProperty(navigator, "sendBeacon", {
      configurable: true,
      value: sendBeacon,
    });

    const { reportWebVitals } = await import("@/reportWebVitals");
    reportWebVitals(metric as any);

    expect(sendBeacon).not.toHaveBeenCalled();
  });

  it("sends metrics via sendBeacon when available", async () => {
    process.env.NEXT_PUBLIC_ENABLE_METRICS = "true";
    const sendBeacon = vi.fn(() => true);
    Object.defineProperty(navigator, "sendBeacon", {
      configurable: true,
      value: sendBeacon,
    });

    const { reportWebVitals } = await import("@/reportWebVitals");
    reportWebVitals(metric as any);

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const call = sendBeacon.mock.calls.at(0);
    expect(call).toBeDefined();
    if (!call) {
      throw new Error("Expected sendBeacon to be called");
    }
    const [urlRaw, bodyRaw] = call as unknown[];
    expect(typeof urlRaw).toBe("string");
    const url = urlRaw as string;
    expect(url).toBe("/api/metrics");
    expect(typeof bodyRaw).toBe("string");
    const parsed = JSON.parse(bodyRaw as string);
    expect(parsed.metric.id).toBe(metric.id);
  });

  it("falls back to fetch and respects the base path", async () => {
    process.env.NEXT_PUBLIC_ENABLE_METRICS = "true";
    process.env.NEXT_PUBLIC_BASE_PATH = "/planner";
    Object.defineProperty(navigator, "sendBeacon", {
      configurable: true,
      value: undefined,
    });
    const fetchMock = vi.fn(() => Promise.resolve(new Response(null)));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { reportWebVitals } = await import("@/reportWebVitals");
    reportWebVitals(metric as any);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls.at(0);
    expect(call).toBeDefined();
    if (!call) {
      throw new Error("Expected fetch to be called");
    }
    const [urlRaw] = call as unknown[];
    expect(typeof urlRaw).toBe("string");
    expect(urlRaw).toBe("/planner/api/metrics");
  });
});

