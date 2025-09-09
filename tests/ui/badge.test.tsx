import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { Badge } from '@/components/ui';

afterEach(() => {
  cleanup();
});

describe('Badge', () => {
  it('renders neutral variant by default', () => {
    const { getByText } = render(<Badge>Neutral</Badge>);
    const badge = getByText('Neutral');
    expect(badge).toHaveClass('bg-[hsl(var(--muted)/0.25)]');
  });

  it('applies accent variant styles', () => {
    const { getByText } = render(<Badge variant="accent">Accent</Badge>);
    const badge = getByText('Accent');
    expect(badge).toHaveClass('text-[hsl(var(--accent))]');
  });

  it('applies pill variant styles', () => {
    const { getByText } = render(<Badge variant="pill">Pill</Badge>);
    const badge = getByText('Pill');
    expect(badge).toHaveClass('rounded-full');
  });
});

