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

const VERCEL_FEEDBACK_HTTP_ORIGINS = Object.freeze([
  "https://vercel.live",
  "https://*.vercel.live",
]);

const VERCEL_FEEDBACK_WS_ORIGINS = Object.freeze(["wss://vercel.live"]);

/**
 * @typedef {Readonly<{ allowVercelFeedback?: boolean }>} SecurityPolicyOptions
 */

/**
 * @param {string} nonce
 * @returns {string}
 */
export const createContentSecurityPolicy = (nonce, options) => {
  const allowVercelFeedback = options?.allowVercelFeedback === true;

  const nonceSource = `'nonce-${nonce}'`;
  const styleSrcBase = ["'self'", "'unsafe-inline'"];
  const styleSrc = [...styleSrcBase];
  const styleSrcElem = [...styleSrcBase];

  if (!allowVercelFeedback) {
    styleSrc.push(nonceSource);
    styleSrcElem.push(nonceSource);
  }
  const imgSrc = ["'self'", "data:"];
  const connectSrc = ["'self'"];

  if (allowVercelFeedback) {
    styleSrc.push(...VERCEL_FEEDBACK_HTTP_ORIGINS);
    styleSrcElem.push(...VERCEL_FEEDBACK_HTTP_ORIGINS);
    imgSrc.push(...VERCEL_FEEDBACK_HTTP_ORIGINS);
    connectSrc.push(...VERCEL_FEEDBACK_HTTP_ORIGINS, ...VERCEL_FEEDBACK_WS_ORIGINS);
  }

  const frameSrc = allowVercelFeedback
    ? [...VERCEL_FEEDBACK_HTTP_ORIGINS]
    : ["'none'"];

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    // 'unsafe-inline' is a temporary compatibility fallback until inline styles are refactored.
    `style-src ${styleSrc.join(" ")}`,
    `style-src-elem ${styleSrcElem.join(" ")}`,
    "style-src-attr 'unsafe-inline'",
    `img-src ${imgSrc.join(" ")}`,
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    `frame-src ${frameSrc.join(" ")}`,
  ].join("; ");
};

/**
 * @param {string} nonce
 * @returns {ReadonlyArray<SecurityHeader>}
 */
export const createSecurityHeaders = (nonce, options) =>
  Object.freeze([
    Object.freeze({
      key: "Content-Security-Policy",
      value: createContentSecurityPolicy(nonce, options),
    }),
    ...baseSecurityHeaders,
  ]);
