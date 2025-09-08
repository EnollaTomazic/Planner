import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, beforeEach, expect, afterEach } from 'vitest';
import PromptsPage from '@/components/prompts/PromptsPage';
import { resetLocalStorage } from '../setup';

afterEach(cleanup);

describe('PromptsPage', () => {
  beforeEach(() => {
    resetLocalStorage();
  });

  it('saves prompts and filters results', async () => {
    render(<PromptsPage />);

    const titleInput = screen.getByPlaceholderText('Title');
    const textArea = screen.getByPlaceholderText('Write your prompt or snippet…');
    const saveButton = screen.getByRole('button', { name: 'Save' });

    fireEvent.change(titleInput, { target: { value: 'First' } });
    fireEvent.change(textArea, { target: { value: 'one' } });
    fireEvent.click(saveButton);
    await screen.findByText('First');
    expect(screen.getByText('1 saved')).toBeInTheDocument();

    fireEvent.change(titleInput, { target: { value: '' } });
    fireEvent.change(textArea, { target: { value: 'Second line\nmore' } });
    fireEvent.click(saveButton);
    await screen.findByText('Second line');
    expect(screen.getByText('2 saved')).toBeInTheDocument();

    const search = screen.getByPlaceholderText('Search prompts…');
    fireEvent.change(search, { target: { value: 'second' } });
    expect(screen.getByText('Second line')).toBeInTheDocument();
    expect(screen.queryByText('First')).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'zzz' } });
    expect(
      screen.getByText('Nothing matches your search. Typical.')
    ).toBeInTheDocument();
  });

  it('ignores empty saves', async () => {
    render(<PromptsPage />);
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();
    fireEvent.click(saveButton);
    await waitFor(() => expect(screen.getByText('0 saved')).toBeInTheDocument());
    expect(
      screen.getByText('Nothing matches your search. Typical.')
    ).toBeInTheDocument();
  });
});

