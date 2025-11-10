import * as React from 'react'

import RingNoiseDefs from '@/icons/RingNoiseDefs'
import { getRingMetrics, type RingSize } from '@/lib/tokens'
import { cn } from '@/lib/utils'

type ProgressRingSize = RingSize | number

type ProgressRingCap = 'butt' | 'round' | 'square'

export interface ProgressRingProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, 'children'> {
  value: number
  size?: ProgressRingSize
  strokeWidth?: number
  trackClassName?: string
  progressClassName?: string
  cap?: ProgressRingCap
  showNoise?: boolean
}

const DEFAULT_RING_SIZE: RingSize = 'm'

export const ProgressRing = React.forwardRef<SVGSVGElement, ProgressRingProps>(
  (
    {
      value,
      size = DEFAULT_RING_SIZE,
      strokeWidth,
      className,
      trackClassName,
      progressClassName,
      cap = 'round',
      showNoise = false,
      ...rest
    },
    ref
  ) => {
    const pct = React.useMemo(() => {
      const numeric = Number(value)
      if (!Number.isFinite(numeric)) {
        return 0
      }
      return Math.max(0, Math.min(100, numeric))
    }, [value])

    const ringSize = typeof size === 'string' ? size : DEFAULT_RING_SIZE
    const metrics = React.useMemo(
      () =>
        strokeWidth == null
          ? getRingMetrics(ringSize)
          : getRingMetrics(ringSize, { stroke: strokeWidth }),
      [ringSize, strokeWidth]
    )
    const resolvedSize = typeof size === 'number' ? size : metrics.diameter
    const ringStroke = strokeWidth ?? metrics.stroke
    const inset = metrics.inset
    const radius = Math.max(resolvedSize / 2 - inset, 0)
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (pct / 100) * circumference

    const uniqueId = React.useId()
    const noiseId = React.useMemo(
      () => `progress-ring-noise-${uniqueId}`,
      [uniqueId]
    )

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${resolvedSize} ${resolvedSize}`}
        className={cn('h-full w-full rotate-[-90deg]', className)}
        focusable={false}
        {...rest}
      >
        {showNoise ? (
          <defs>
            <RingNoiseDefs id={noiseId} />
          </defs>
        ) : null}
        <circle
          cx={resolvedSize / 2}
          cy={resolvedSize / 2}
          r={radius}
          strokeWidth={ringStroke}
          strokeLinecap={cap}
          vectorEffect="non-scaling-stroke"
          fill='none'
          className={cn('text-foreground/20', trackClassName)}
          stroke='currentColor'
        />
        <circle
          cx={resolvedSize / 2}
          cy={resolvedSize / 2}
          r={radius}
          strokeWidth={ringStroke}
          strokeLinecap={cap}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          vectorEffect="non-scaling-stroke"
          fill='none'
          className={cn('text-accent', progressClassName)}
          stroke='currentColor'
          filter={showNoise ? `url(#${noiseId})` : undefined}
        />
      </svg>
    )
  }
)

ProgressRing.displayName = 'ProgressRing'
