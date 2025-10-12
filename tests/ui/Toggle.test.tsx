import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { Toggle } from "@/components/ui/toggles/Toggle";

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

  it('reflects loading state via aria-busy', () => {
    const { getByRole, rerender } = render(<Toggle loading />);
    const button = getByRole('switch');

    expect(button).toHaveAttribute('aria-busy', 'true');

    rerender(<Toggle loading={false} />);

    expect(button).not.toHaveAttribute('aria-busy');
  });

  it('exposes glitch state tokens for styling', () => {
    const { getByRole } = render(<Toggle leftLabel="Left" rightLabel="Right" />);
    const button = getByRole('switch');

    expect(button.className).toContain('[--toggle-hover-surface:hsl(var(--accent)/0.16)]');
    expect(button.className).toContain('[--toggle-active-surface:hsl(var(--accent)/0.26)]');
    expect(button.className).toContain('[--toggle-focus-ring:var(--ring-contrast)]');
  });
});
