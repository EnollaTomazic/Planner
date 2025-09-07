import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import Textarea from '../../src/components/ui/primitives/Textarea';

afterEach(cleanup);

describe('Textarea', () => {
  it('renders default state', () => {
    const { container } = render(<Textarea aria-label="test" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders focus state', () => {
    const { container, getByRole } = render(<Textarea aria-label="test" />);
    fireEvent.focus(getByRole('textbox'));
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders disabled state', () => {
    const { container } = render(<Textarea aria-label="test" disabled />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders pill tone', () => {
    const { container } = render(<Textarea aria-label="test" tone="pill" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders error state', () => {
    const { container } = render(
      <Textarea aria-label="test" aria-invalid="true" />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('handles aria-invalid="false" as non-error', () => {
    const { container } = render(
      <Textarea aria-label="test" aria-invalid="false" />
    );
    expect(container.firstChild).not.toHaveClass(
      'border-[hsl(var(--destructive)/0.6)]'
    );
  });

  it('has no outline when focused', () => {
    const { getByRole } = render(<Textarea aria-label="outline" />);
    const ta = getByRole('textbox');
    fireEvent.focus(ta);
    const style = getComputedStyle(ta);
    expect(style.outlineStyle === 'none' || style.outlineStyle === '').toBe(true);
    expect(style.outlineWidth === '0px' || style.outlineWidth === '').toBe(true);
  });
});
