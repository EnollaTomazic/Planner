'use client';

import * as React from 'react';

import ProgressRingIcon from '@/icons/ProgressRingIcon';
import { getRingMetrics, type RingSize } from '@/lib/tokens';
import { cn } from '@/lib/utils';

import styles from './GlitchProgress.module.css';

const DEFAULT_MAX = 100;

export type GlitchProgressSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type SizeConfig = {
  ringSize: RingSize;
  padding: number;
  halo: number;
};

const SIZE_CONFIG: Record<GlitchProgressSize, SizeConfig> = {
  xs: { ringSize: 'xs', padding: 8, halo: 14 },
  sm: { ringSize: 's', padding: 10, halo: 18 },
  md: { ringSize: 'm', padding: 12, halo: 24 },
  lg: { ringSize: 'l', padding: 14, halo: 30 },
  xl: { ringSize: 'l', padding: 20, halo: 38 },
};

export interface GlitchProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  value?: number | null;
  max?: number;
  size?: GlitchProgressSize;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const GlitchProgress = React.forwardRef<HTMLDivElement, GlitchProgressProps>(
  (
    {
      value = 0,
      max = DEFAULT_MAX,
      size = 'md',
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const safeMax = Number.isFinite(max) && max > 0 ? max : DEFAULT_MAX;
    const numericValue = typeof value === 'number' && Number.isFinite(value) ? value : 0;
    const clampedValue = clamp(numericValue, 0, safeMax);
    const percent = safeMax === 0 ? 0 : (clampedValue / safeMax) * 100;
    const displayPercent = clamp(Number.parseFloat(percent.toFixed(2)), 0, 100);

    const sizeConfig = SIZE_CONFIG[size];
    const metrics = React.useMemo(
      () => getRingMetrics(sizeConfig.ringSize),
      [sizeConfig.ringSize],
    );

    const dimension = metrics.diameter + sizeConfig.padding * 2;
    const cssVars = React.useMemo<React.CSSProperties>(
      () =>
        ({
          '--glitch-progress-size': `${dimension}px`,
          '--glitch-progress-ring-size': `${metrics.diameter}px`,
          '--glitch-progress-padding': `${sizeConfig.padding}px`,
          '--glitch-progress-halo': `${sizeConfig.halo}px`,
        }) as React.CSSProperties,
      [dimension, metrics.diameter, sizeConfig.halo, sizeConfig.padding],
    );

    const {
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...divProps
    } = rest;

    const progressProps = {
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      value: clampedValue,
      max: safeMax,
    } satisfies React.ComponentPropsWithoutRef<'progress'>;

    const mergedStyle = React.useMemo<React.CSSProperties>(
      () => ({ ...cssVars, ...(style ?? {}) }),
      [cssVars, style],
    );

    return (
      <div
        ref={ref}
        className={cn(styles.root, className)}
        data-size={size}
        style={mergedStyle}
        {...divProps}
      >
        <progress className="sr-only" {...progressProps} />
        <div className={styles.shell} aria-hidden>
          <span className={styles.neon} />
          <span className={styles.noise} />
          <span className={styles.inner} />
          <span className={styles.scanlines} />
          <div className={styles.surface}>
            <div className={styles.ring}>
              <ProgressRingIcon pct={displayPercent} size={sizeConfig.ringSize} />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

GlitchProgress.displayName = 'GlitchProgress';
