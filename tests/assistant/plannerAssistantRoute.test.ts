import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

function setSafeMode(server: string, client: string) {
  process.env.SAFE_MODE = server;
  process.env.NEXT_PUBLIC_SAFE_MODE = client;
}

function createJsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/planner/assistant", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function loadRoute() {
  return import("@/app/api/planner/assistant/route");
}

afterEach(() => {
  Object.assign(process.env, ORIGINAL_ENV);
  vi.resetModules();
});

describe("/api/planner/assistant", () => {
  it("returns a planner plan when the request is valid", async () => {
    setSafeMode("false", "false");
    vi.resetModules();
    const { POST } = await loadRoute();

    const request = createJsonRequest({
      prompt: "Plan demo on Tuesday at 3pm",
    });

    const response = await POST(request as unknown as NextRequest);
    expect(response.status).toBe(200);

    const payload = (await response.json()) as {
      ok: boolean;
      plan: { suggestions: unknown[] };
      safeMode: { active: boolean };
    };

    expect(payload.ok).toBe(true);
    expect(Array.isArray(payload.plan.suggestions)).toBe(true);
    expect(payload.plan.suggestions.length).toBeGreaterThan(0);
    expect(payload.safeMode.active).toBe(false);
  });

  it("rejects requests when safe mode flags are misaligned", async () => {
    setSafeMode("true", "false");
    vi.resetModules();
    const { POST } = await loadRoute();

    const response = await POST(createJsonRequest({ prompt: "Plan" }) as unknown as NextRequest);
    expect(response.status).toBe(409);

    const payload = (await response.json()) as { ok: boolean; error: string };
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("safe_mode_mismatch");
  });

  it("returns an error when the sanitized prompt is empty", async () => {
    setSafeMode("false", "false");
    vi.resetModules();
    const { POST } = await loadRoute();

    const response = await POST(createJsonRequest({ prompt: "    " }) as unknown as NextRequest);
    expect(response.status).toBe(422);

    const payload = (await response.json()) as { ok: boolean; error: string };
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("empty_prompt");
  });

  it("rejects invalid JSON payloads", async () => {
    setSafeMode("false", "false");
    vi.resetModules();
    const { POST } = await loadRoute();

    const request = new Request("http://localhost/api/planner/assistant", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: "not-json",
    });

    const response = await POST(request as unknown as NextRequest);
    expect(response.status).toBe(400);

    const payload = (await response.json()) as { ok: boolean; error: string };
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("invalid_request");
  });
});
