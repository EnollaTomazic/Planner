import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { ReviewListItem } from '../../src/components/reviews/ReviewListItem';
import type { Review } from '../../src/lib/types';

afterEach(cleanup);

const baseReview: Review = {
  id: '1',
  title: 'Sample Review',
  notes: 'Quick note',
  createdAt: 1700000000000,
  matchup: 'Lux vs Ahri',
  role: 'MID',
  score: 9,
  result: 'Win',
  tags: [],
  pillars: [],
};

describe('ReviewListItem', () => {
  it('renders default state', () => {
    const { container } = render(<ReviewListItem review={baseReview} />);
    expect(container).toMatchSnapshot();
  });

  it('renders selected state', () => {
    const { container } = render(
      <ReviewListItem review={baseReview} selected />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders loading state', () => {
    const { container } = render(<ReviewListItem loading />);
    expect(container).toMatchSnapshot();
  });

  it('renders disabled state', () => {
    const { container } = render(
      <ReviewListItem disabled review={baseReview} />,
    );
    expect(container.firstChild).toHaveClass(
      'disabled:opacity-disabled',
      'disabled:pointer-events-none',
    );
    expect(container).toMatchSnapshot();
  });

  it('renders untitled state', () => {
    const review = { ...baseReview, title: '' };
    const { container } = render(<ReviewListItem review={review} />);
    expect(container).toMatchSnapshot();
  });
});
