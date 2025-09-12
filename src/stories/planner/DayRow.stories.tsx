import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DayRow, PlannerProvider } from "@/components/planner";

const meta: Meta<typeof DayRow> = {
  title: "Planner/DayRow",
  component: DayRow,
  decorators: [
    (Story) => (
      <PlannerProvider>
        <Story />
      </PlannerProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof DayRow>;

export const Default: Story = {
  args: {
    iso: "2024-01-01",
    isToday: false,
  },
};
