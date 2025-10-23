import { glitchLandingEnabled } from '@/lib/features'
import {
  HomePageFallbackContent,
  type HomePageFallbackProps,
} from './HomePageFallbackContent'

export default function HomePageFallbackServer({
  heroHeadingId,
  overviewHeadingId,
}: HomePageFallbackProps) {
  return (
    <HomePageFallbackContent
      glitchLandingEnabled={glitchLandingEnabled}
      heroHeadingId={heroHeadingId}
      overviewHeadingId={overviewHeadingId}
    />
  )
}
