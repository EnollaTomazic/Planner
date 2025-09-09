import React from 'react';
import { render } from '@testing-library/react';
import Spinner from '@/components/ui/feedback/Spinner';
import { describe, expect, it } from 'vitest';

describe('Spinner', () => {
  it('renders with status role', () => {
    const { getByRole } = render(<Spinner />);
    expect(getByRole('status')).toBeInTheDocument();
  });
});
