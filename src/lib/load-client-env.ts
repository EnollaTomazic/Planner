import loadClientEnv from '../../env/client'

const SAFE_MODE_FALLBACK = 'true'

function withSafeModeFallback(): NodeJS.ProcessEnv {
  const envSource =
    typeof process !== 'undefined'
      ? (process.env as NodeJS.ProcessEnv)
      : ({} as NodeJS.ProcessEnv)

  if (envSource.NEXT_PUBLIC_SAFE_MODE !== undefined) {
    return envSource
  }

  const publicSafeModeKey = 'NEXT_PUBLIC_SAFE_MODE'
  const safeModeKey = 'SAFE_MODE'

  const nextEnv: NodeJS.ProcessEnv = {
    ...envSource,
    [publicSafeModeKey]: SAFE_MODE_FALLBACK,
  }

  envSource[publicSafeModeKey] = SAFE_MODE_FALLBACK

  const safeModeValue = envSource[safeModeKey]

  if (!safeModeValue || !safeModeValue.trim()) {
    envSource[safeModeKey] = SAFE_MODE_FALLBACK
  }

  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn(
      '[env] NEXT_PUBLIC_SAFE_MODE was missing; defaulting to "true" so the client runtime can continue with stricter AI guardrails.'
    )
  }

  return nextEnv
}

export type ClientEnv = ReturnType<typeof loadClientEnv>

export function readClientEnv(): ClientEnv {
  const envWithFallback = withSafeModeFallback()

  try {
    return loadClientEnv(envWithFallback)
  } catch (error) {
    console.error('[env] Failed to load client environment variables.', error)
    if (
      typeof process !== 'undefined' &&
      typeof process.exit === 'function' &&
      process.env.NODE_ENV !== 'test'
    ) {
      process.exit(1)
    }
    throw error
  }
}
