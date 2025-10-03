# Observability & Web Vitals Pipeline

Planner ships a lightweight web vitals pipeline so we can correlate UI regressions with performance data without introducing heavy third-party SDKs.

## Browser hook

- `src/reportWebVitals.ts` exports Next.js' [`reportWebVitals`](https://nextjs.org/docs/app/building-your-application/optimizing/web-vitals) hook.
- The hook serializes each metric (including attribution entries) and posts it to the URL resolved from `NEXT_PUBLIC_METRICS_ENDPOINT` with `navigator.sendBeacon` when available, falling back to a `fetch` keepalive call.
- Metrics emit automatically in production when `NEXT_PUBLIC_METRICS_ENDPOINT` is configured. Override with `NEXT_PUBLIC_ENABLE_METRICS=true|false|auto` (`auto` defers to the environment default).
- Relative endpoints respect the configured base path via `withBasePath`, so GitHub Pages and preview exports continue to work.

## API ingestion

- Static exports no longer bundle a Next.js Route Handler. Instead, `server/metrics-handler.ts` exposes a reusable Node.js-compatible request handler that mirrors the former API logic and logs through the structured `observabilityLogger` (`planner:observability:metrics`).
- The handler applies an in-memory sliding window rate limiter (`consumeRateLimit`) that allows 24 payloads per minute per client IP before returning `429 Too Many Requests` with a `Retry-After` header.
- Responses are non-cacheable (`Cache-Control: no-store`) and use HTTP 202 to indicate that ingestion succeeded.
- Invalid JSON returns 400, schema validation issues return 422, both with warn-level log entries to flag suspicious traffic.

## Extending the sink

- The structured logger logs to `console.*` today and redacts PII automatically. Forward the same payload to external telemetry by swapping the logger implementation or wiring the `metricsLog.info` branch into your preferred observability SDK.
- For distributed deployments swap `src/lib/observability/rate-limit.ts` for a shared cache (Redis, Upstash) to keep the rate limiter consistent across regions.
- Keep payload additions documented here and mirror them in `tests/reportWebVitals.test.ts` so breaking changes surface in CI.

