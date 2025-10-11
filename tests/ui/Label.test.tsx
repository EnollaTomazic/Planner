import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { Label } from "@/components/ui/Label";

afterEach(() => {
  cleanup();
});

describe('Label', () => {
  it('renders provided text', () => {
    const { getByText } = render(<Label>Username</Label>);
    expect(getByText('Username')).toBeInTheDocument();
  });

  it('associates with input via htmlFor', () => {
    const { getByLabelText } = render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>
    );
    expect(getByLabelText('Email')).toBeInTheDocument();
  });

  it('merges custom class names', () => {
    const { getByText } = render(<Label className="custom">Name</Label>);
    expect(getByText('Name')).toHaveClass('custom');
  });
});

