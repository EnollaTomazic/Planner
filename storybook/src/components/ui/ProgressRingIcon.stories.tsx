import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ProgressRingIcon from "@/icons/ProgressRingIcon";
import type { RingSize } from "@/lib/tokens";

const meta: Meta<typeof ProgressRingIcon> = {
  title: "Icons/ProgressRingIcon",
  component: ProgressRingIcon,
  parameters: {
    docs: {
      description: {
        component:
          "ProgressRingIcon renders determinate progress and shares the same sizing tokens as the timer variant.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ProgressRingIcon>;

const ringSizes: RingSize[] = ["xs", "s", "m"];

export const TokenSizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {ringSizes.map((ringSize) => (
        <div
          key={ringSize}
          className="size-[var(--ring-demo-size,var(--ring-diameter-m))]"
          style={{
            "--ring-demo-size": `var(--ring-diameter-${ringSize})`,
          } as React.CSSProperties}
        >
          <ProgressRingIcon pct={65} size={ringSize} />
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Each progress ring can opt into the shared ring size tokens to align with timer visuals.",
      },
    },
  },
};
