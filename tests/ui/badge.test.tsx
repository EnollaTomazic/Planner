import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { Badge } from '@/components/ui';

afterEach(() => {
  cleanup();
});

describe('Badge', () => {
  it('renders neutral tone by default', () => {
    const { getByText } = render(<Badge>Neutral</Badge>);
    const badge = getByText('Neutral');
    expect(badge).toHaveClass('border-card-hairline');
    expect(badge).toHaveClass('bg-muted/18');
  });

  it('applies accent tone styles', () => {
    const { getByText } = render(<Badge tone="accent">Accent</Badge>);
    const badge = getByText('Accent');
    expect(badge).toHaveClass('border-[var(--accent-overlay)]');
  });

  it('supports the xs size', () => {
    const { getByText } = render(<Badge size="xs">Small</Badge>);
    const badge = getByText('Small');
    expect(badge).toHaveClass('px-[var(--space-2)]');
    expect(badge).toHaveClass('py-[var(--space-1)]');
    expect(badge).toHaveClass('text-label');
  });
});

