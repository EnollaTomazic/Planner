import * as React from "react";
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

  it('disables browser text help by default', () => {
    const { getByRole } = render(
      <SearchBar value="" onValueChange={() => {}} />
    );
    const input = getByRole('searchbox');
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(input).toHaveAttribute('autocorrect', 'off');
    expect(input).toHaveAttribute('autocapitalize', 'none');
    expect(input).toHaveAttribute('spellcheck', 'false');
  });

  it('allows overriding text helpers', () => {
    const { getByRole } = render(
      <SearchBar
        value=""
        onValueChange={() => {}}
        autoComplete="on"
        autoCorrect="on"
        spellCheck={true}
        autoCapitalize="words"
      />
    );
    const input = getByRole('searchbox');
    expect(input).toHaveAttribute('autocomplete', 'on');
    expect(input).toHaveAttribute('autocorrect', 'on');
    expect(input).toHaveAttribute('autocapitalize', 'words');
    expect(input).toHaveAttribute('spellcheck', 'true');
  });
});
