import * as React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DayCard from '@/components/planner/DayCard';
import { PlannerProvider, useDay, useSelectedProject } from '@/components/planner/usePlanner';

const iso = '2024-01-01';

const TestHarness = React.forwardRef((_, ref: React.Ref<any>) => {
  const day = useDay(iso);
  const [selectedProjectId, setSelectedProjectId] = useSelectedProject(iso);
  React.useImperativeHandle(ref, () => ({ day, selectedProjectId, setSelectedProjectId }));
  return <DayCard iso={iso} />;
});

TestHarness.displayName = 'TestHarness';

describe('DayCard', () => {
  it('clears selection when selected project is deleted', async () => {
    const harnessRef = React.createRef<any>();
    render(
      <PlannerProvider>
        <TestHarness ref={harnessRef} />
      </PlannerProvider>
    );

    let pid = '';
    act(() => {
      pid = harnessRef.current.day.addProject('Proj');
      harnessRef.current.setSelectedProjectId(pid);
    });
    expect(harnessRef.current.selectedProjectId).toBe(pid);

    act(() => {
      harnessRef.current.day.deleteProject(pid);
    });

    await waitFor(() => {
      expect(harnessRef.current.selectedProjectId).toBe('');
    });
  });
});
