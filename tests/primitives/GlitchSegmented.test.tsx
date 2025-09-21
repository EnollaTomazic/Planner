import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { GlitchSegmentedGroup, GlitchSegmentedButton } from '../../src/components/ui/primitives/GlitchSegmented';

afterEach(cleanup);

describe('GlitchSegmented', () => {
  it('renders buttons', () => {
    const { getByRole } = render(
      <GlitchSegmentedGroup value="a" onChange={() => {}}>
        <GlitchSegmentedButton value="a">A</GlitchSegmentedButton>
        <GlitchSegmentedButton value="b">B</GlitchSegmentedButton>
      </GlitchSegmentedGroup>
    );
    expect(getByRole('tab', { name: 'A' })).toBeInTheDocument();
    expect(getByRole('tab', { name: 'B' })).toBeInTheDocument();
  });

  it('has no outline when focused', () => {
    const { getByRole } = render(
      <GlitchSegmentedGroup value="a" onChange={() => {}}>
        <GlitchSegmentedButton value="a">A</GlitchSegmentedButton>
      </GlitchSegmentedGroup>
    );
    const btn = getByRole('tab');
    btn.focus();
    const style = getComputedStyle(btn);
    expect(style.outlineStyle === 'none' || style.outlineStyle === '').toBe(true);
    expect(style.outlineWidth === '0px' || style.outlineWidth === '').toBe(true);
  });
});
