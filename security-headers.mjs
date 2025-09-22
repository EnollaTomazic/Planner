/**
 * @typedef {{ readonly key: string; readonly value: string }} SecurityHeader
 */

/** @type {Readonly<Record<string, string>>} */
export const baseSecurityHeadersMap = Object.freeze({
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Permissions-Policy": "accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), usb=(), xr-spatial-tracking=()",
});

/** @type {ReadonlyArray<SecurityHeader>} */
export const baseSecurityHeaders = Object.freeze(
  Object.entries(baseSecurityHeadersMap).map(([key, value]) =>
    Object.freeze({ key, value }),
  ),
);

/**
 * @param {string} nonce
 * @returns {string}
 */
export const createContentSecurityPolicy = (nonce) =>
  [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`,
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    "frame-src 'none'",
  ].join("; ");

/**
 * @param {string} nonce
 * @returns {ReadonlyArray<SecurityHeader>}
 */
export const createSecurityHeaders = (nonce) =>
  Object.freeze([
    Object.freeze({
      key: "Content-Security-Policy",
      value: createContentSecurityPolicy(nonce),
    }),
    ...baseSecurityHeaders,
  ]);
