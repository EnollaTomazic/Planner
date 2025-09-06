import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import ReviewListItem from '../../src/components/reviews/ReviewListItem';

afterEach(cleanup);

const baseReview = {
  id: '1',
  title: 'Sample Review',
  notes: 'Quick note',
  createdAt: 1700000000000,
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

  it('renders untitled state', () => {
    const review = { ...baseReview, title: '' };
    const { container } = render(<ReviewListItem review={review} />);
    expect(container).toMatchSnapshot();
  });
});
