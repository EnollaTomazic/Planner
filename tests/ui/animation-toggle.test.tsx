import * as React from "react";
import { render, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AnimationToggle } from '@/components/ui';

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove('no-animations');
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove('no-animations');
});

describe('AnimationToggle', () => {
  it('renders a pressed button by default', async () => {
    const { getByRole } = render(<AnimationToggle />);
    const button = getByRole('button', { name: 'Disable animations' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    await waitFor(() => {
      expect(document.documentElement.classList.contains('no-animations')).toBe(false);
    });
  });

  it('toggles animations and updates aria attributes', async () => {
    const { getByRole } = render(<AnimationToggle />);
    const button = getByRole('button');
    fireEvent.click(button);
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).toHaveAttribute('aria-label', 'Enable animations');
      expect(document.documentElement.classList.contains('no-animations')).toBe(true);
    });
  });
});

