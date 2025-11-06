'use client';

import * as React from 'react';

import {
  SegmentedButton,
  type SegmentedButtonProps,
} from './SegmentedButton';

export type GlitchSegmentedButtonProps = Omit<
  SegmentedButtonProps,
  'glitch' | 'depth'
> & {
  glitch?: boolean;
  depth?: SegmentedButtonProps['depth'];
};

export const GlitchSegmentedButton = React.forwardRef<
  HTMLElement,
  GlitchSegmentedButtonProps
>(function GlitchSegmentedButton(
  { glitch = true, depth = 'raised', ...rest },
  ref,
) {
  return <SegmentedButton ref={ref} glitch={glitch} depth={depth} {...rest} />;
});
