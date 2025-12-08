import * as React from 'react'

import { ProgressRing as BaseProgressRing, type ProgressRingProps as BaseProgressRingProps } from './feedback/ProgressRing'
import { cn } from '@/lib/utils'

export type ProgressRingProps = BaseProgressRingProps & {
  valueMax?: number
  valueMin?: number
  label?: string
}

export const ProgressRing = React.forwardRef<SVGSVGElement, ProgressRingProps>(
  (
    {
      value,
      valueMax = 100,
      valueMin = 0,
      label,
      className,
      progressClassName,
      trackClassName,
      ...rest
    },
    ref,
  ) => {
    const clamped = React.useMemo(() => {
      if (!Number.isFinite(value)) return valueMin
      return Math.min(Math.max(value, valueMin), valueMax)
    }, [value, valueMin, valueMax])

    const percent = React.useMemo(() => {
      const range = Math.max(valueMax - valueMin, 1)
      return ((clamped - valueMin) / range) * 100
    }, [clamped, valueMax, valueMin])

    return (
      <BaseProgressRing
        ref={ref}
        value={percent}
        role="progressbar"
        aria-valuemin={valueMin}
        aria-valuemax={valueMax}
        aria-valuenow={clamped}
        aria-label={label}
        className={cn('text-[color:hsl(var(--card-hairline)/0.42)] drop-shadow-[0_8px_40px_rgba(0,0,0,0.18)]', className)}
        progressClassName={cn('text-[color:var(--accent-2)] drop-shadow-[0_0_28px_color-mix(in_oklab,var(--accent-1),transparent)]', progressClassName)}
        trackClassName={cn('text-[color:hsl(var(--card-hairline)/0.32)]', trackClassName)}
        showNoise
        {...rest}
      />
    )
  },
)

ProgressRing.displayName = 'ProgressRing'
