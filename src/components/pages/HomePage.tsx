import { Suspense } from 'react'

import HomePageContent from '@/app/home/HomePageContent.client'
import HomePageFallback from '@/app/home/HomePageFallback.server'

type HomePageProps = {
  heroHeadingId?: string
  overviewHeadingId?: string
}

export function HomePage({
  heroHeadingId = 'home-hero-heading',
  overviewHeadingId = 'home-overview-heading',
}: HomePageProps = {}) {
  return (
    <Suspense
      fallback={
        <HomePageFallback
          heroHeadingId={heroHeadingId}
          overviewHeadingId={overviewHeadingId}
        />
      }
    >
      <HomePageContent
        heroHeadingId={heroHeadingId}
        overviewHeadingId={overviewHeadingId}
      />
    </Suspense>
  )
}
