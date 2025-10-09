# Observability & Web Vitals Pipeline

Planner ships a lightweight web vitals pipeline so we can correlate UI regressions with performance data without introducing heavy third-party SDKs.

## Browser hook

- `src/reportWebVitals.ts` exports Next.js' [`reportWebVitals`](https://nextjs.org/docs/app/building-your-application/optimizing/web-vitals) hook.
- The hook serializes each metric (including attribution entries) and posts it to the URL resolved from `NEXT_PUBLIC_METRICS_ENDPOINT` with `navigator.sendBeacon` when available, falling back to a `fetch` keepalive call.
- Metrics emit automatically in production when `NEXT_PUBLIC_METRICS_ENDPOINT` is configured. Override with `NEXT_PUBLIC_ENABLE_METRICS=true|false|auto` (`auto` defers to the environment default).
- Relative endpoints respect the configured base path via `withBasePath`, so GitHub Pages and preview exports continue to work.

## API ingestion

- `/api/metrics` is implemented with a Next.js Route Handler in [`src/app/api/metrics/route.ts`](../src/app/api/metrics/route.ts). The handler shares its core validation and logging logic with the standalone Node entry point via `createMetricsProcessor` so both environments stay aligned.
- A reusable Node-compatible handler remains available at [`server/metrics-handler.ts`](../server/metrics-handler.ts) for self-hosted collectors or edge runtimes that require the lower-level API.
- The processor applies an in-memory sliding window rate limiter (`consumeRateLimit`) that allows 24 payloads per minute per client identifier before returning `429 Too Many Requests` with a `Retry-After` header. Oversized bodies (over 50 KB) are rejected with `413 Payload Too Large` before parsing.
- Responses are non-cacheable (`Cache-Control: no-store`) and return HTTP 200 for accepted payloads. Invalid JSON or schema violations produce HTTP 400 with warn-level log entries so suspicious traffic can be triaged quickly.

## Extending the sink

- The structured logger logs to `console.*` today and redacts PII automatically. Forward the same payload to external telemetry by swapping the logger implementation or wiring the `metricsLog.info` branch into your preferred observability SDK.
- For distributed deployments swap `src/lib/observability/rate-limit.ts` for a shared cache (Redis, Upstash) to keep the rate limiter consistent across regions.
- Keep payload additions documented here and mirror them in `tests/reportWebVitals.test.ts` so breaking changes surface in CI.

