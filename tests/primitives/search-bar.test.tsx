import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { SearchBar } from '@/components/ui';

afterEach(cleanup);

describe('SearchBar', () => {
  it('invokes callbacks on submit', () => {
    vi.useFakeTimers();
    const handleChange = vi.fn();
    const handleSubmit = vi.fn();
    const { getByRole } = render(
      <SearchBar
        value=""
        onValueChange={handleChange}
        onSubmit={handleSubmit}
        debounceMs={1000}
      />
    );
    const input = getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(handleChange).not.toHaveBeenCalled();
    fireEvent.submit(getByRole('search'));
    expect(handleChange).toHaveBeenCalledWith('hello');
    expect(handleSubmit).toHaveBeenCalledWith('hello');
    vi.useRealTimers();
  });
});
