import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { Select } from '../../src/components/ui/Select';

afterEach(cleanup);

describe('AnimatedSelect', () => {
  it('associates label and trigger via aria-labelledby', () => {
    const items = [
      { value: 'apple', label: 'Apple' },
      { value: 'orange', label: 'Orange' },
    ];
    const { getByText, getByRole } = render(
      <Select variant="animated" label="Fruit" items={items} />
    );

    const labelEl = getByText('Fruit');
    const button = getByRole('button', { name: 'Fruit' });

    expect(labelEl.id).toBeTruthy();
    expect(button).toHaveAttribute('aria-labelledby', labelEl.id);

    fireEvent.click(button);
    const listbox = getByRole('listbox');
    expect(listbox).toHaveAttribute('aria-labelledby', labelEl.id);
  });

  it('has no outline on trigger when focused', () => {
    const items = [
      { value: 'apple', label: 'Apple' },
      { value: 'orange', label: 'Orange' },
    ];
    const { getByRole } = render(
      <Select variant="animated" ariaLabel="Fruit" items={items} />
    );
    const button = getByRole('button');
    fireEvent.focus(button);
    const style = getComputedStyle(button as HTMLElement);
    expect(style.outlineStyle === 'none' || style.outlineStyle === '').toBe(true);
    expect(style.outlineWidth === '0px' || style.outlineWidth === '').toBe(true);
  });
});
