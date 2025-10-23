import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import TimerRingIcon from "@/icons/TimerRingIcon";
import type { RingSize } from "@/lib/tokens";

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
const ringSizes: RingSize[] = ["s", "m", "l"];

export const MultipleRings: Story = {
  render: () => (
    <div className="flex flex-col gap-[var(--space-8)]">
      <div className="flex items-center gap-[var(--space-6)]">
        {progressValues.map((pct) => (
          <div key={pct} className="size-[var(--ring-diameter-l)]">
            <TimerRingIcon pct={pct} size="l" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-[var(--space-6)]">
        {ringSizes.map((ringSize) => (
          <div
            key={ringSize}
            className="size-[var(--ring-demo-size,var(--ring-diameter-l))]"
            style={{
              "--ring-demo-size": `var(--ring-diameter-${ringSize})`,
            } as React.CSSProperties}
          >
            <TimerRingIcon pct={75} size={ringSize} />
          </div>
        ))}
      </div>
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
