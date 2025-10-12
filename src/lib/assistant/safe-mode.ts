const ENABLED_FLAG_VALUES = new Set(['1', 'true', 'on', 'yes'])
const DISABLED_FLAG_VALUES = new Set(['0', 'false', 'off', 'no'])

function normalizeFlag(value: string | undefined): boolean {
  if (typeof value !== 'string') {
    return false
  }

  const normalized = value.trim().toLowerCase()
  if (!normalized) {
    return false
  }

  if (ENABLED_FLAG_VALUES.has(normalized)) {
    return true
  }

  if (DISABLED_FLAG_VALUES.has(normalized)) {
    return false
  }

  return false
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
  const server = normalizeFlag(env.SAFE_MODE)
  const client = normalizeFlag(env.NEXT_PUBLIC_SAFE_MODE)

  return {
    server,
    client,
    active: server && client,
  }
}
