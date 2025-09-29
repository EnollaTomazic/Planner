import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PlannerProvider } from "@/components/planner";
import PlannerCreateFab from "@/components/planner/PlannerCreateFab";

const meta: Meta<typeof PlannerCreateFab> = {
  title: "Planner/PlannerCreateFab",
  component: PlannerCreateFab,
  decorators: [
    (Story) => (
      <PlannerProvider>
        <Story />
      </PlannerProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof PlannerCreateFab>;

export const Visible: Story = {
  render: () => {
    const ref = React.createRef<HTMLElement>();
    return <PlannerCreateFab watchRef={ref} forceVisible />;
  },
};
