import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import Input from '../../src/components/ui/primitives/Input';

afterEach(cleanup);

describe('Input', () => {
  it('uses small size classes by default', () => {
    const { getByRole } = render(<Input aria-label="test" />);
    expect(getByRole('textbox')).toHaveClass('h-11');
  });

  it('adds indent padding when enabled', () => {
    const { getByRole } = render(<Input aria-label="test" indent />);
    expect(getByRole('textbox')).toHaveClass('pl-10');
  });
});
