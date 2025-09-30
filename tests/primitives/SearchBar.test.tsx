import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import SearchBar from "@/components/ui/primitives/SearchBar";

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
    vi.runAllTimers();
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

  it('applies loading state', () => {
    const { getByRole } = render(
      <SearchBar value="" onValueChange={() => {}} loading />
    );
    const form = getByRole('search');
    expect(form).toHaveAttribute('data-loading', 'true');
    const input = getByRole('searchbox');
    expect(input).toBeDisabled();
  });

  it("applies numeric height as pixels", () => {
    const { getByRole } = render(
      <SearchBar value="" onValueChange={() => {}} height={52} />,
    );
    const field = getByRole("searchbox").parentElement as HTMLElement;
    expect(field.dataset.customHeight).toBe("true");
    expect(field.style.getPropertyValue("--field-custom-height")).toBe("52px");
  });

  it('renders an associated label when provided', () => {
    const { getByLabelText } = render(
      <SearchBar value="" onValueChange={() => {}} label="Search tasks" />
    );

    expect(getByLabelText('Search tasks')).toBeInTheDocument();
  });

  it('allows external labelling via aria-labelledby', () => {
    const { getByRole } = render(
      <>
        <span id="search-title">Lookup</span>
        <SearchBar
          value=""
          onValueChange={() => {}}
          aria-labelledby="search-title"
        />
      </>
    );

    const input = getByRole('searchbox');
    expect(input).toHaveAttribute('aria-labelledby', 'search-title');
    expect(input).not.toHaveAttribute('aria-label');
  });
});
