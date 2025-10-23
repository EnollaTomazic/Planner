'use client'

import type { HomePageFallbackContentProps } from './HomePageFallbackContent.view'
import { HomePageFallbackContentView } from './HomePageFallbackContent.view'

export type {
  HomePageFallbackContentProps,
  HomePageFallbackProps,
} from './HomePageFallbackContent.view'

export function HomePageFallbackContent(props: HomePageFallbackContentProps) {
  return <HomePageFallbackContentView {...props} />
}
