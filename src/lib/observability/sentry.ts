// src/lib/observability/sentry.ts
// Lightweight Sentry wrapper with environment-based gating and structured logging.

import { observabilityLogger } from "../logging";

const sentryLog = observabilityLogger.child("sentry");
const captureLog = sentryLog.child("capture");

type SentryModule = typeof import("@sentry/nextjs");

const rawDsn =
  process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() ||
  process.env.SENTRY_DSN?.trim() ||
  "";
const rawEnvironment =
  process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT?.trim() ||
  process.env.SENTRY_ENVIRONMENT?.trim() ||
  process.env.NODE_ENV ||
  "development";
const rawSampleRate =
  process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE?.trim() ||
  process.env.SENTRY_TRACES_SAMPLE_RATE?.trim() ||
  "";

const isTestEnv = process.env.NODE_ENV === "test";
const sentryEnabled =
  process.env.NODE_ENV === "production" && Boolean(rawDsn) && !isTestEnv;

let hasInitialized = false;
let initializationPromise: Promise<SentryModule | null> | null = null;
let cachedSentry: SentryModule | null = null;

function parseSampleRate(value: string): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    sentryLog.warn("Invalid Sentry sample rate provided", { value });
    return undefined;
  }
  return Math.min(Math.max(parsed, 0), 1);
}

const tracesSampleRate = parseSampleRate(rawSampleRate) ?? (process.env.NODE_ENV === "production" ? 0.1 : 1);

const loadSentry: () => Promise<SentryModule | null> =
  process.env.NODE_ENV === "production"
    ? async () => {
        if (!sentryEnabled) {
          return null;
        }

        if (cachedSentry) {
          return cachedSentry;
        }

        if (!initializationPromise) {
          initializationPromise = import("@sentry/nextjs")
            .then((sentry) => {
              cachedSentry = sentry;
              if (!hasInitialized) {
                try {
                  sentry.init({
                    dsn: rawDsn,
                    environment: rawEnvironment,
                    enabled: sentryEnabled,
                    tracesSampleRate,
                    replaysSessionSampleRate: 0,
                    replaysOnErrorSampleRate: 0,
                    profilesSampleRate: 0,
                  });
                  hasInitialized = true;
                } catch (error) {
                  sentryLog.error("Failed to initialize Sentry", error);
                  return null;
                }
              }
              return cachedSentry;
            })
            .catch((error: unknown) => {
              sentryLog.error("Failed to load Sentry runtime", error);
              cachedSentry = null;
              return null;
            })
            .finally(() => {
              initializationPromise = null;
            });
        }

        return initializationPromise;
      }
    : async () => null;

export type ObservabilityCaptureContext = Parameters<SentryModule["captureException"]>[1];

export function isObservabilityEnabled(): boolean {
  return sentryEnabled;
}

export async function initializeObservability(): Promise<void> {
  if (!sentryEnabled) {
    return;
  }

  await loadSentry();
}

export async function captureException(
  error: unknown,
  context?: ObservabilityCaptureContext,
): Promise<void> {
  if (!sentryEnabled) {
    return;
  }

  const sentry = await loadSentry();
  if (!sentry) {
    sentryLog.warn("captureException skipped because Sentry is unavailable", error);
    return;
  }

  try {
    sentry.captureException(error, context);
  } catch (captureError) {
    captureLog.error("Failed to capture exception with Sentry", captureError, error);
  }
}
