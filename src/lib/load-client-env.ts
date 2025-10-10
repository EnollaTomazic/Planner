import { ZodError } from 'zod'

import loadClientEnv from '../../env/client'

const SAFE_MODE_FALLBACK = 'false'

function isMissingSafeModeError(error: unknown): error is ZodError {
  if (!(error instanceof ZodError)) {
    return false
  }

  return error.issues.some(
    (issue) =>
      issue.path.length === 1 &&
      issue.path[0] === 'NEXT_PUBLIC_SAFE_MODE' &&
      issue.message.includes('NEXT_PUBLIC_SAFE_MODE must be provided')
  )
}

function withSafeModeFallback(): NodeJS.ProcessEnv {
  const envSource =
    typeof process !== 'undefined'
      ? (process.env as NodeJS.ProcessEnv)
      : ({} as NodeJS.ProcessEnv)

  if (envSource.NEXT_PUBLIC_SAFE_MODE && envSource.NEXT_PUBLIC_SAFE_MODE.trim()) {
    return envSource
  }

  const nextEnv: NodeJS.ProcessEnv = {
    ...envSource,
    NEXT_PUBLIC_SAFE_MODE: SAFE_MODE_FALLBACK,
  }

  if (typeof process !== 'undefined') {
    process.env.NEXT_PUBLIC_SAFE_MODE = SAFE_MODE_FALLBACK

    if (!process.env.SAFE_MODE || !process.env.SAFE_MODE.trim()) {
      process.env.SAFE_MODE = SAFE_MODE_FALLBACK
    }
  }

  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn(
      '[env] NEXT_PUBLIC_SAFE_MODE was missing; defaulting to "false" so the client runtime can continue.'
    )
  }

  return nextEnv
}

export type ClientEnv = ReturnType<typeof loadClientEnv>

export function readClientEnv(): ClientEnv {
  try {
    return loadClientEnv()
  } catch (error) {
    if (isMissingSafeModeError(error)) {
      return loadClientEnv(withSafeModeFallback())
    }

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
