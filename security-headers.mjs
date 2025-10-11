/**
 * @typedef {{ readonly key: string; readonly value: string }} SecurityHeader
 */

/** @type {Readonly<Record<string, string>>} */
export const baseSecurityHeadersMap = Object.freeze({
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Permissions-Policy": "accelerometer=(), autoplay=(), camera=(), display-capture=(self), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), usb=(), xr-spatial-tracking=()",
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
export const createContentSecurityPolicy = (options) => {
  const allowVercelFeedback = options?.allowVercelFeedback === true;

  const scriptSrc = ["'self'", "'unsafe-inline'"];
  if (process.env.NODE_ENV !== "production") {
    scriptSrc.push("'unsafe-eval'");
  }
  const styleSrcBase = ["'self'", "'unsafe-inline'"];
  const styleSrc = [...styleSrcBase];
  const styleSrcElem = [...styleSrcBase];
  const imgSrcBase = ["'self'", "data:", "https:"];

  const imgSrc = [...imgSrcBase];
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
    `script-src ${scriptSrc.join(" ")}`,
    `style-src ${styleSrc.join(" ")}`,
    `style-src-elem ${styleSrcElem.join(" ")}`,
    // Inline style attributes remain opt-in until all components use scoped styles.
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
 * @returns {ReadonlyArray<SecurityHeader>}
 */
export const createSecurityHeaders = (options) =>
  Object.freeze([
    Object.freeze({
      key: "Content-Security-Policy",
      value: createContentSecurityPolicy(options),
    }),
    ...baseSecurityHeaders,
  ]);

export const defaultSecurityPolicyOptions = Object.freeze({
  allowVercelFeedback:
    process.env.VERCEL === "1" ||
    process.env.VERCEL_ENV === "preview" ||
    process.env.VERCEL_ENV === "production",
});
