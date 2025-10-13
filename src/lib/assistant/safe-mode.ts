import { SAFE_MODE_FALLBACK } from '@env'

const ENABLED_FLAG_VALUES = new Set(['1', 'true', 'on', 'yes'])
const DISABLED_FLAG_VALUES = new Set(['0', 'false', 'off', 'no'])

function normalizeFlag(value: string | undefined | null): boolean | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase()
  if (!normalized) {
    return null
  }

  if (ENABLED_FLAG_VALUES.has(normalized)) {
    return true
  }

  if (DISABLED_FLAG_VALUES.has(normalized)) {
    return false
  }

  return null
}

function resolveFlag(
  primary: string | undefined,
  secondary: string | undefined,
): boolean {
  return (
    normalizeFlag(primary) ??
    normalizeFlag(secondary) ??
    normalizeFlag(SAFE_MODE_FALLBACK) ??
    false
  )
}

export type PlannerAssistantSafeModeState = {
  readonly server: boolean
  readonly client: boolean
  readonly active: boolean
}

type PlannerAssistantSafeModeEnv = {
  readonly SAFE_MODE?: string
  readonly NEXT_PUBLIC_SAFE_MODE?: string
  readonly [key: string]: string | undefined
}

export function resolvePlannerAssistantSafeMode(
  env: PlannerAssistantSafeModeEnv = process.env,
): PlannerAssistantSafeModeState {
  const server = resolveFlag(env.SAFE_MODE, env.NEXT_PUBLIC_SAFE_MODE)
  const client = resolveFlag(env.NEXT_PUBLIC_SAFE_MODE, env.SAFE_MODE)

  return {
    server,
    client,
    active: server && client,
  }
}
