import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { Input } from '@/components/ui';

afterEach(cleanup);

describe('Input', () => {
  it('renders default state', () => {
    const { container } = render(<Input aria-label="test" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders focus state', () => {
    const { container, getByRole } = render(<Input aria-label="test" />);
    fireEvent.focus(getByRole('textbox'));
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders error state', () => {
    const { container } = render(<Input aria-label="test" aria-invalid="true" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders disabled state', () => {
    const { container } = render(<Input aria-label="test" disabled />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
