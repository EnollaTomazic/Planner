import { Buffer } from "node:buffer";

import type { RateLimitSubjects } from "@/lib/server/rate-limiter";

const encoder = new TextEncoder();

const FALLBACK_IDENTIFIERS = {
  ip: "unknown-ip",
  user: "anonymous-user",
  apiKey: "anonymous-api-key",
} as const;

export type RequestIdInput = {
  method: string;
  pathname: string;
  timestamp: number;
};

export type RateLimitRequest = {
  headers: Headers;
  ip?: string | null;
};

export function normalizeIdentifier(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export function getClientAddress(request: RateLimitRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const [first] = forwarded.split(",");
    const candidate = first?.trim();
    if (candidate) {
      return candidate;
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    const trimmed = realIp.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    const trimmed = cfConnectingIp.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  const directIp = typeof request.ip === "string" ? request.ip.trim() : "";
  return directIp ? directIp : null;
}

export async function hashIdentifier(value: string): Promise<string> {
  const data = encoder.encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(digest).toString("base64url");
}

export async function createRequestId(input: RequestIdInput): Promise<string> {
  const payload = `${input.method.toUpperCase()}::${input.pathname}::${input.timestamp}`;
  const digest = await hashIdentifier(payload);
  return `req_${digest.slice(0, 16)}`;
}

export async function deriveRateLimitSubjects(
  request: RateLimitRequest,
): Promise<RateLimitSubjects> {
  const clientIp = normalizeIdentifier(
    getClientAddress(request),
    FALLBACK_IDENTIFIERS.ip,
  );
  const userId = normalizeIdentifier(
    request.headers.get("x-user-id"),
    FALLBACK_IDENTIFIERS.user,
  );
  const apiKey = normalizeIdentifier(
    request.headers.get("x-api-key"),
    FALLBACK_IDENTIFIERS.apiKey,
  );

  const [ip, user, apiKeyHash] = await Promise.all([
    hashIdentifier(clientIp),
    hashIdentifier(userId),
    hashIdentifier(apiKey),
  ]);

  return {
    ip,
    user,
    apiKey: apiKeyHash,
  } satisfies RateLimitSubjects;
}
