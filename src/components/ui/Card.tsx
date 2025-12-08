import * as React from 'react'
import { Card as LegacyCard, CardBody as LegacyCardBody, CardContent as LegacyCardContent, CardDescription as LegacyCardDescription, CardFooter as LegacyCardFooter, CardHeader as LegacyCardHeader, CardTitle as LegacyCardTitle } from '@/legacy/ui/primitives/Card'
import { isLegacyUiEnabled } from '@/lib/useLegacyUi'
import { cn } from '@/lib/utils'
import {
  Card as ModernCard,
  CardBody as ModernCardBody,
  CardContent as ModernCardContent,
  CardDescription as ModernCardDescription,
  CardFooter as ModernCardFooter,
  CardHeader as ModernCardHeader,
  CardTitle as ModernCardTitle,
} from './primitives/Card'
import type { CardProps } from './primitives/Card'

export type { CardDepth, CardProps, CardStatus } from './primitives/Card'

const ForwardedCard = React.forwardRef<HTMLElement, CardProps>(function ForwardedCard(props, ref) {
  if (isLegacyUiEnabled()) {
    return <LegacyCard {...props} ref={ref as never} />
  }
  return <ModernCard {...props} ref={ref as never} />
})

ForwardedCard.displayName = 'Card'

export const Card = ForwardedCard as typeof ModernCard
export const CardHeader = ModernCardHeader
export const CardTitle = ModernCardTitle
export const CardDescription = ModernCardDescription
export const CardContent = ModernCardContent
export const CardBody = ModernCardBody
export const CardFooter = ModernCardFooter

export const cardSurfaceClassName = cn(
  'relative overflow-hidden',
  'card-neo-soft border border-card-hairline',
  '[box-shadow:var(--depth-shadow-soft)]',
  '[--neo-card-overlay-inset:0px] [--neo-card-overlay-opacity:var(--surface-overlay-strong,0.2)]',
)
