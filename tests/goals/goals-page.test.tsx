import React from 'react';
import { render, screen, fireEvent, cleanup, within, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import GoalsPage from '@/components/goals/GoalsPage';

// Clean up DOM after each test
afterEach(cleanup);

describe('GoalsPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('handles adding goals, cap enforcement, completion toggles, and undo', async () => {
    render(<GoalsPage />);

    const titleInput = screen.getByRole('textbox', { name: 'Title' });
    const addButton = screen.getByRole('button', { name: /add goal/i });

    // Add three goals up to the active cap
    for (let i = 1; i <= 3; i++) {
      fireEvent.change(titleInput, { target: { value: `Goal ${i}` } });
      fireEvent.click(addButton);
      // ensure each goal appears
      // eslint-disable-next-line no-await-in-loop
      await screen.findByText(`Goal ${i}`);
    }

    // Attempt to add a fourth active goal, expect cap error
    fireEvent.change(titleInput, { target: { value: 'Goal 4' } });
    fireEvent.click(addButton);
    expect(screen.getByRole('status')).toHaveTextContent('Cap reached');

    // Mark the first goal as done
    const goal1Item = screen.getByText('Goal 1').closest('li') as HTMLElement;
    const toggleBtn = within(goal1Item).getByRole('checkbox', { name: 'Mark done' });
    fireEvent.pointerDown(toggleBtn);
    fireEvent.click(toggleBtn);
    await waitFor(() => {
      const goal1 = screen.getByText('Goal 1').closest('li') as HTMLElement;
      expect(within(goal1).getByText('Done')).toBeInTheDocument();
    });

    // Now adding another goal should succeed
    fireEvent.change(titleInput, { target: { value: 'Goal 4' } });
    fireEvent.click(addButton);
    await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
    const goal4 = await screen.findByText('Goal 4');
    expect(goal4).toBeInTheDocument();

    // Remove the new goal and then undo
    const goal4Item = goal4.closest('li') as HTMLElement;
    const deleteButton = within(goal4Item).getByLabelText('Delete goal');
    fireEvent.click(deleteButton);
    await waitFor(() => expect(screen.queryByText('Goal 4')).not.toBeInTheDocument());
    const undoButton = screen.getByRole('button', { name: 'Undo' });
    fireEvent.click(undoButton);
    expect(await screen.findByText('Goal 4')).toBeInTheDocument();
  });
});

