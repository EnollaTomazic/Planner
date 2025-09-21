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
    expect(badge).toHaveClass('px-[var(--space-3)]');
    expect(badge).toHaveClass('py-[var(--space-2)]');
    expect(badge).toHaveClass('text-label');
  });

  it('applies accent tone styles', () => {
    const { getByText } = render(<Badge tone="accent">Accent</Badge>);
    const badge = getByText('Accent');
    expect(badge).toHaveClass('border-[var(--accent-overlay)]');
  });

  it('supports the size tokens', () => {
    const { getByText } = render(
      <>
        <Badge size="sm">Small</Badge>
        <Badge size="md">Medium</Badge>
        <Badge size="lg">Large</Badge>
        <Badge size="xl">Extra large</Badge>
        <Badge size="xs">Alias</Badge>
      </>,
    );

    expect(getByText('Small')).toHaveClass('px-[var(--space-2)]');
    expect(getByText('Small')).toHaveClass('py-[var(--space-1)]');
    expect(getByText('Small')).toHaveClass('text-label');

    expect(getByText('Medium')).toHaveClass('px-[var(--space-3)]');
    expect(getByText('Medium')).toHaveClass('py-[var(--space-2)]');
    expect(getByText('Medium')).toHaveClass('text-label');

    expect(getByText('Large')).toHaveClass('px-[var(--space-4)]');
    expect(getByText('Large')).toHaveClass('text-ui');

    expect(getByText('Extra large')).toHaveClass('px-[var(--space-5)]');
    expect(getByText('Extra large')).toHaveClass('py-[var(--space-3)]');
    expect(getByText('Extra large')).toHaveClass('text-title');

    expect(getByText('Alias')).toHaveClass('px-[var(--space-2)]');
    expect(getByText('Alias')).toHaveClass('py-[var(--space-1)]');
  });
});

