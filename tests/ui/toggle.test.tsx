import * as React from "react";
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { Toggle } from '@/components/ui';

afterEach(() => {
  cleanup();
});

describe('Toggle', () => {
  it('labels the switch via aria-labelledby', () => {
    const { getByRole, getByText } = render(
      <Toggle leftLabel="Left" rightLabel="Right" />
    );
    const button = getByRole('switch');
    const left = getByText('Left');
    const right = getByText('Right');
    expect(left.id).toBeTruthy();
    expect(right.id).toBeTruthy();
    expect(button).toHaveAttribute('aria-labelledby', `${left.id} ${right.id}`);
    expect(button).not.toHaveAttribute('aria-label');
  });
});
