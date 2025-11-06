'use client'

import * as React from 'react'
import HomePlannerIslandClient from './HomePlannerIsland.client'
import { HomePageFallbackContent } from './HomePageFallbackContent.client'
import { useUiFeatureFlags } from '@/lib/theme-context'

type HomePageContentProps = {
  heroHeadingId: string
  overviewHeadingId: string
}

export default function HomePageContent({
  heroHeadingId,
  overviewHeadingId,
}: HomePageContentProps) {
  const { glitchLandingEnabled } = useUiFeatureFlags()
  const [shouldRenderIsland, setShouldRenderIsland] = React.useState(
    !glitchLandingEnabled,
  )

  React.useEffect(() => {
    if (!glitchLandingEnabled) {
      setShouldRenderIsland(true)
      return
    }

    setShouldRenderIsland(false)

    const fallbackDelayMs = 400
    const timeout = window.setTimeout(() => {
      setShouldRenderIsland(true)
    }, fallbackDelayMs)

    return () => window.clearTimeout(timeout)
  }, [glitchLandingEnabled])

  if (!shouldRenderIsland) {
    return (
      <HomePageFallbackContent
        glitchLandingEnabled={glitchLandingEnabled}
        heroHeadingId={heroHeadingId}
        overviewHeadingId={overviewHeadingId}
      />
    )
  }

  return (
    <HomePlannerIslandClient
      glitchLandingEnabled={glitchLandingEnabled}
      heroHeadingId={heroHeadingId}
      overviewHeadingId={overviewHeadingId}
    />
  )
}
