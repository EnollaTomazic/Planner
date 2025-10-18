import HomePlannerIslandClient from './HomePlannerIsland.client'

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
    />
  )
}

