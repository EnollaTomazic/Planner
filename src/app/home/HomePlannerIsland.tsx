import HomePlannerIslandClient from './HomePlannerIsland.client'
import { glitchLandingEnabled } from '@/lib/features'

type HomePlannerIslandProps = {
  heroHeadingId: string
  overviewHeadingId: string
}

export default function HomePlannerIsland({
  heroHeadingId,
  overviewHeadingId,
}: HomePlannerIslandProps) {
  return (
    <HomePlannerIslandClient
      heroHeadingId={heroHeadingId}
      overviewHeadingId={overviewHeadingId}
      glitchLandingEnabled={glitchLandingEnabled}
    />
  )
}

