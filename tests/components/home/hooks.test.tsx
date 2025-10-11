import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  useGlitchLandingSplash,
  useHydratedCallback,
} from '@/components/home/hooks'

type GlitchLandingSplashProps = {
  enabled: boolean
  hydrated: boolean
}

type HydratedCallbackHookProps = {
  hydrated: boolean
  callback?: () => void
}

describe('useGlitchLandingSplash', () => {
  it('mounts the splash while hydration completes', () => {
    const { result } = renderHook(
      ({ enabled, hydrated }: GlitchLandingSplashProps) =>
        useGlitchLandingSplash(enabled, hydrated),
      {
        initialProps: { enabled: true, hydrated: false },
      },
    )

    expect(result.current.isSplashVisible).toBe(true)
    expect(result.current.isSplashMounted).toBe(true)
  })

  it('disables the splash when the feature flag is off', () => {
    const { result } = renderHook(
      ({ enabled, hydrated }: GlitchLandingSplashProps) =>
        useGlitchLandingSplash(enabled, hydrated),
      {
        initialProps: { enabled: false, hydrated: false },
      },
    )

    expect(result.current.isSplashVisible).toBe(false)
    expect(result.current.isSplashMounted).toBe(false)

    act(() => {
      result.current.handleClientReady()
      result.current.handleSplashExit()
    })

    expect(result.current.isSplashVisible).toBe(false)
    expect(result.current.isSplashMounted).toBe(false)
  })

  it('hides the splash once hydration completes', () => {
    const { result, rerender } = renderHook(
      ({ enabled, hydrated }: GlitchLandingSplashProps) =>
        useGlitchLandingSplash(enabled, hydrated),
      {
        initialProps: { enabled: true, hydrated: false },
      },
    )

    act(() => {
      rerender({ enabled: true, hydrated: true })
    })

    expect(result.current.isSplashVisible).toBe(false)
    expect(result.current.isSplashMounted).toBe(true)

    act(() => {
      result.current.handleSplashExit()
    })

    expect(result.current.isSplashMounted).toBe(false)
  })
})

describe('useHydratedCallback', () => {
  it('invokes the callback once when hydration finishes', () => {
    const onReady = vi.fn()
    const { rerender } = renderHook<void, HydratedCallbackHookProps>(
      ({ hydrated, callback }) => useHydratedCallback(hydrated, callback),
      {
        initialProps: { hydrated: false, callback: onReady },
      },
    )

    expect(onReady).not.toHaveBeenCalled()

    act(() => {
      rerender({ hydrated: true, callback: onReady })
    })

    expect(onReady).toHaveBeenCalledTimes(1)

    act(() => {
      rerender({ hydrated: true, callback: onReady })
    })

    expect(onReady).toHaveBeenCalledTimes(1)

    act(() => {
      rerender({ hydrated: false, callback: onReady })
    })

    expect(onReady).toHaveBeenCalledTimes(1)

    act(() => {
      rerender({ hydrated: true, callback: onReady })
    })

    expect(onReady).toHaveBeenCalledTimes(2)
  })

  it('skips invocation when no callback is provided', () => {
    const onReady = vi.fn()
    const { rerender } = renderHook<void, HydratedCallbackHookProps>(
      ({ hydrated, callback }) => useHydratedCallback(hydrated, callback),
      {
        initialProps: { hydrated: false },
      },
    )

    act(() => {
      rerender({ hydrated: true })
    })

    expect(onReady).not.toHaveBeenCalled()

    act(() => {
      rerender({ hydrated: true, callback: onReady })
    })

    expect(onReady).toHaveBeenCalledTimes(1)
  })
})
