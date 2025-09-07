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

  it('renders success state', () => {
    const { container } = render(
      <Select aria-label="test" success>
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

  it('has no outline when focused', () => {
    const { getByRole } = render(
      <Select aria-label="outline">
        <option value="">Choose…</option>
      </Select>
    );
    const select = getByRole('combobox');
    fireEvent.focus(select);
    const style = getComputedStyle(select);
    expect(style.outlineStyle === 'none' || style.outlineStyle === '').toBe(true);
    expect(style.outlineWidth === '0px' || style.outlineWidth === '').toBe(true);
  });

  it('applies rounded-full on pill tone', () => {
    const { container, getByRole } = render(
      <Select aria-label="pill" tone="pill">
        <option value="">Choose…</option>
      </Select>
    );
    const wrapper = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    const select = getByRole('combobox');
    expect(wrapper).toHaveClass('rounded-full');
    expect(select).toHaveClass('rounded-full');
  });
});
