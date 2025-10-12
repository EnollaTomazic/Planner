import {
  CLIENT_ENV_KEYS,
  SERVER_ENV_KEYS,
  applySafeModeFallback,
  createEnvSignature,
  getRuntimeEnv,
  handleRuntimeParseFailure,
  pickEnvValues,
} from "./shared";
import {
  clientEnvSchema,
  serverEnvSchema,
  type ClientEnv,
  type ServerEnv,
} from "./schema";

export type { ClientEnv, ServerEnv };
export { SAFE_MODE_FALLBACK } from "./schema";

let cachedClientEnv: ClientEnv | undefined;
let cachedClientSignature: string | undefined;

let cachedServerEnv: ServerEnv | undefined;
let cachedServerSignature: string | undefined;

const CLIENT_SAFE_MODE_WARNING =
  '[env] NEXT_PUBLIC_SAFE_MODE was missing; defaulting to "true" so the client runtime can continue with stricter AI guardrails.';

const SERVER_SAFE_MODE_WARNING =
  '[env] SAFE_MODE was missing; defaulting to "true" so the server runtime can continue with stricter AI guardrails.';

function selectClientEnv(source: NodeJS.ProcessEnv) {
  return pickEnvValues(source, CLIENT_ENV_KEYS);
}

function selectServerEnv(source: NodeJS.ProcessEnv) {
  return pickEnvValues(source, SERVER_ENV_KEYS);
}

export function loadClientEnv(source?: NodeJS.ProcessEnv): ClientEnv {
  if (!source) {
    return readClientEnv();
  }

  const envWithFallback = applySafeModeFallback(source, {
    targetKey: "NEXT_PUBLIC_SAFE_MODE",
    mirrorKey: "SAFE_MODE",
    shouldWarn: false,
    warningMessage: CLIENT_SAFE_MODE_WARNING,
    mutateRuntime: false,
  });

  return clientEnvSchema.parse(selectClientEnv(envWithFallback));
}

export function loadServerEnv(source?: NodeJS.ProcessEnv): ServerEnv {
  if (!source) {
    return readServerEnv();
  }

  const envWithFallback = applySafeModeFallback(source, {
    targetKey: "SAFE_MODE",
    mirrorKey: "NEXT_PUBLIC_SAFE_MODE",
    shouldWarn: true,
    warningMessage: SERVER_SAFE_MODE_WARNING,
    mutateRuntime: false,
  });

  return serverEnvSchema.parse(selectServerEnv(envWithFallback));
}

export function readClientEnv(): ClientEnv {
  const { env, mutateRuntime } = getRuntimeEnv();

  const envWithFallback = applySafeModeFallback(env, {
    targetKey: "NEXT_PUBLIC_SAFE_MODE",
    mirrorKey: "SAFE_MODE",
    shouldWarn: true,
    warningMessage: CLIENT_SAFE_MODE_WARNING,
    mutateRuntime,
  });

  const selected = selectClientEnv(envWithFallback);
  const signature = createEnvSignature(selected, CLIENT_ENV_KEYS);

  if (cachedClientEnv && cachedClientSignature === signature) {
    return cachedClientEnv;
  }

  try {
    const parsed = clientEnvSchema.parse(selected);
    cachedClientEnv = parsed;
    cachedClientSignature = signature;
    return parsed;
  } catch (error) {
    return handleRuntimeParseFailure("client", error);
  }
}

export function readServerEnv(): ServerEnv {
  const { env, mutateRuntime } = getRuntimeEnv();

  const envWithFallback = applySafeModeFallback(env, {
    targetKey: "SAFE_MODE",
    mirrorKey: "NEXT_PUBLIC_SAFE_MODE",
    shouldWarn: true,
    warningMessage: SERVER_SAFE_MODE_WARNING,
    mutateRuntime,
  });

  const selected = selectServerEnv(envWithFallback);
  const signature = createEnvSignature(selected, SERVER_ENV_KEYS);

  if (cachedServerEnv && cachedServerSignature === signature) {
    return cachedServerEnv;
  }

  try {
    const parsed = serverEnvSchema.parse(selected);
    cachedServerEnv = parsed;
    cachedServerSignature = signature;
    return parsed;
  } catch (error) {
    return handleRuntimeParseFailure("server", error);
  }
}
