import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import securityHeadersMap from "./security-headers.json" assert { type: "json" };

const securityHeaders = Object.entries(securityHeadersMap);

export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  for (const [key, value] of securityHeaders) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: "/:path*",
};
