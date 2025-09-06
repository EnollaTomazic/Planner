import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import Select from '../../src/components/ui/Select';

afterEach(cleanup);

describe('Select', () => {
  it('renders default state', () => {
    const { container } = render(
      <Select aria-label="test">
        <option value="">Choose…</option>
        <option value="a">A</option>
      </Select>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders focus state', () => {
    const { container, getByRole } = render(
      <Select aria-label="test">
        <option value="">Choose…</option>
        <option value="a">A</option>
      </Select>
    );
    fireEvent.focus(getByRole('combobox'));
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders error state', () => {
    const { container } = render(
      <Select aria-label="test" errorText="Error">
        <option value="">Choose…</option>
      </Select>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders disabled state', () => {
    const { container } = render(
      <Select aria-label="test" disabled>
        <option value="">Choose…</option>
      </Select>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
