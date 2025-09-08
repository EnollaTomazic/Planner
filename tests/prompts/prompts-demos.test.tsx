import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import PromptsDemos from '@/components/prompts/PromptsDemos';

afterEach(cleanup);

describe('PromptsDemos', () => {
  it('renders key demo sections', () => {
    render(<PromptsDemos />);
    expect(
      screen.getByRole('button', { name: 'Focus me to see the glow' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Input' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Select' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Textarea' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Scroll to top' })
    ).toBeInTheDocument();
  });
});

