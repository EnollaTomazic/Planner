'use client'

import { useUiFeatureFlags } from '@/lib/theme-context'
import {
  HomePageFallbackContent,
  type HomePageFallbackProps,
} from './HomePageFallbackContent.client'

export default function HomePageFallback({
  heroHeadingId,
  overviewHeadingId,
}: HomePageFallbackProps) {
  const { glitchLandingEnabled } = useUiFeatureFlags()

  return (
    <HomePageFallbackContent
      glitchLandingEnabled={glitchLandingEnabled}
      heroHeadingId={heroHeadingId}
      overviewHeadingId={overviewHeadingId}
    />
  )
}
