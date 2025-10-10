import loadClientEnv from '../../env/client'

export type ClientEnv = ReturnType<typeof loadClientEnv>

export function readClientEnv(): ClientEnv {
  try {
    const env = loadClientEnv()

    if (
      typeof process !== 'undefined' &&
      typeof process.env !== 'undefined' &&
      process.env.NEXT_PUBLIC_SAFE_MODE === undefined
    ) {
      console.warn(
        '[env] NEXT_PUBLIC_SAFE_MODE was not provided; defaulting to "false".'
      )
    }

    return env
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
