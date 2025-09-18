import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import TimerRingIcon from "@/icons/TimerRingIcon";

const meta: Meta<typeof TimerRingIcon> = {
  title: "Icons/TimerRingIcon",
  component: TimerRingIcon,
  parameters: {
    docs: {
      description: {
        component:
          "TimerRingIcon visualizes elapsed time with a gradient stroke. Each instance maintains its own gradient definition so multiple rings can render together without conflicts.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof TimerRingIcon>;

const progressValues = [25, 50, 75];

export const MultipleRings: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {progressValues.map((pct) => (
        <div key={pct} className="h-20 w-20">
          <TimerRingIcon pct={pct} size={80} />
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Rendering multiple TimerRingIcon instances verifies that each ring keeps a distinct gradient.",
      },
    },
  },
};
