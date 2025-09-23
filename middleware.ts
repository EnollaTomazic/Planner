import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createContentSecurityPolicy,
  createSecurityHeaders,
} from "./security-headers.mjs";

const NONCE_BYTE_LENGTH = 16;
const REQUEST_CSP_HEADER = "content-security-policy";
const NONCE_HEADER = "x-nonce";

const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const encodeBase64 = (bytes: Uint8Array): string => {
  let output = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const remaining = bytes.length - index;
    const byteOne = bytes[index];
    const byteTwo = remaining > 1 ? bytes[index + 1] : 0;
    const byteThree = remaining > 2 ? bytes[index + 2] : 0;

    output += BASE64_CHARS[byteOne >> 2];

    if (remaining === 1) {
      output += BASE64_CHARS[(byteOne & 0b11) << 4];
      output += "==";
      break;
    }

    output += BASE64_CHARS[((byteOne & 0b11) << 4) | (byteTwo >> 4)];

    if (remaining === 2) {
      output += BASE64_CHARS[(byteTwo & 0b1111) << 2];
      output += "=";
      break;
    }

    output += BASE64_CHARS[((byteTwo & 0b1111) << 2) | (byteThree >> 6)];
    output += BASE64_CHARS[byteThree & 0b111111];
  }
  return output;
};

const createNonce = (): string => {
  const randomValues = globalThis.crypto.getRandomValues(
    new Uint8Array(NONCE_BYTE_LENGTH),
  );
  return encodeBase64(randomValues);
};

export function middleware(request: NextRequest) {
  const nonce = createNonce();
  const host = request.headers.get("host");
  const normalizedHost = host?.toLowerCase() ?? "";
  const allowVercelFeedback =
    normalizedHost.endsWith(".vercel.app") ||
    normalizedHost.endsWith(".vercel.sh") ||
    normalizedHost === "vercel.live" ||
    normalizedHost.endsWith(".vercel.live");
  const policyOptions = { allowVercelFeedback };

  const securityHeaders = createSecurityHeaders(nonce, policyOptions);
  const cspHeader = securityHeaders.find(
    (header) => header.key === "Content-Security-Policy",
  );
  const cspValue =
    cspHeader?.value ?? createContentSecurityPolicy(nonce, policyOptions);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(NONCE_HEADER, nonce);
  requestHeaders.set(REQUEST_CSP_HEADER, cspValue);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  for (const { key, value } of securityHeaders) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: "/:path*",
};
