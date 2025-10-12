import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { Select } from '../../src/components/ui/Select';

afterEach(cleanup);

describe('Select', () => {
  it('renders default state', () => {
    const { container } = render(
      <Select
        variant="native"
        aria-label="test"
        items={[
          { value: '', label: 'Choose…' },
          { value: 'a', label: 'A' },
        ]}
        value=""
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders focus state', () => {
    const { container, getByRole } = render(
      <Select
        variant="native"
        aria-label="test"
        items={[
          { value: '', label: 'Choose…' },
          { value: 'a', label: 'A' },
        ]}
        value=""
      />
    );
    fireEvent.focus(getByRole('combobox'));
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders error state', () => {
    const { container } = render(
      <Select
        variant="native"
        aria-label="test"
        errorText="Error"
        items={[{ value: '', label: 'Choose…' }]}
        value=""
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders success state', () => {
    const { container } = render(
      <Select
        variant="native"
        aria-label="test"
        success
        items={[{ value: '', label: 'Choose…' }]}
        value=""
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders disabled state', () => {
    const { container } = render(
      <Select
        variant="native"
        aria-label="test"
        disabled
        items={[{ value: '', label: 'Choose…' }]}
        value=""
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('has no outline when focused', () => {
    const { getByRole } = render(
      <Select
        variant="native"
        aria-label="outline"
        items={[{ value: '', label: 'Choose…' }]}
        value=""
      />
    );
    const select = getByRole('combobox');
    fireEvent.focus(select);
    const style = getComputedStyle(select);
    expect(style.outlineStyle === 'none' || style.outlineStyle === '').toBe(true);
    expect(style.outlineWidth === '0px' || style.outlineWidth === '').toBe(true);
  });
});
