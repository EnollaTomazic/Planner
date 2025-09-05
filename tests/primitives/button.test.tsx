import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { Button } from '../../src/components/ui/primitives/button';

afterEach(cleanup);

describe('Button', () => {
  it('renders its children', () => {
    const { getByRole } = render(<Button>Click me</Button>);
    expect(getByRole('button')).toHaveTextContent('Click me');
  });

  it('applies variant classes', () => {
    const { getByRole } = render(
      <Button className="btn-primary">Click me</Button>
    );
    expect(getByRole('button')).toHaveClass('btn-primary');
  });
});
