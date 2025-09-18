import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { securityHeaders } from "./security-headers.mjs";

export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  for (const { key, value } of securityHeaders) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: "/:path*",
};
