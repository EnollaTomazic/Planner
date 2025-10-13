import { afterEach, describe, expect, it } from 'vitest'

import { resolvePlannerAssistantSafeMode } from '@/lib/assistant/safe-mode'

const ORIGINAL_SAFE_MODE = process.env.SAFE_MODE
const ORIGINAL_NEXT_PUBLIC_SAFE_MODE = process.env.NEXT_PUBLIC_SAFE_MODE

function setSafeModeEnv(
  server: string | undefined,
  client: string | undefined,
): void {
  if (server === undefined) {
    delete process.env.SAFE_MODE
  } else {
    process.env.SAFE_MODE = server
  }

  if (client === undefined) {
    delete process.env.NEXT_PUBLIC_SAFE_MODE
  } else {
    process.env.NEXT_PUBLIC_SAFE_MODE = client
  }
}

afterEach(() => {
  setSafeModeEnv(ORIGINAL_SAFE_MODE, ORIGINAL_NEXT_PUBLIC_SAFE_MODE)
})

describe('resolvePlannerAssistantSafeMode', () => {
  it('falls back to the safe mode default when flags are missing', () => {
    setSafeModeEnv(undefined, undefined)

    const state = resolvePlannerAssistantSafeMode()

    expect(state.server).toBe(true)
    expect(state.client).toBe(true)
    expect(state.active).toBe(true)
  })

  it('shares the configured server flag when the client flag is missing', () => {
    setSafeModeEnv('false', undefined)

    const state = resolvePlannerAssistantSafeMode()

    expect(state.server).toBe(false)
    expect(state.client).toBe(false)
    expect(state.active).toBe(false)
  })

  it('shares the configured client flag when the server flag is missing', () => {
    setSafeModeEnv(undefined, 'false')

    const state = resolvePlannerAssistantSafeMode()

    expect(state.server).toBe(false)
    expect(state.client).toBe(false)
    expect(state.active).toBe(false)
  })

  it('prefers the matching counterpart when a flag is invalid', () => {
    setSafeModeEnv('maybe', 'true')

    const state = resolvePlannerAssistantSafeMode()

    expect(state.server).toBe(true)
    expect(state.client).toBe(true)
    expect(state.active).toBe(true)
  })
})
