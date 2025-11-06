'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

import styles from './GlitchSegmentedGroup.module.css';

type Align = 'start' | 'center' | 'end' | 'between';

export interface GlitchSegmentedGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  align?: Align;
}

export const GlitchSegmentedGroup = React.forwardRef<
  HTMLDivElement,
  GlitchSegmentedGroupProps
>(function GlitchSegmentedGroup(
  { size = 'md', align = 'start', className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('glitch-wrapper group/glitch', styles.root, className)}
      data-size={size}
      data-align={align}
      {...rest}
    >
      <span aria-hidden className={styles.halo} />
      <span aria-hidden className={styles.noise} />
      <div className={styles.content}>{children}</div>
    </div>
  );
});
