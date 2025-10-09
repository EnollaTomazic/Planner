import loadClientEnv from '../../env/client'

export type ClientEnv = ReturnType<typeof loadClientEnv>

export function readClientEnv(): ClientEnv {
  try {
    return loadClientEnv()
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
