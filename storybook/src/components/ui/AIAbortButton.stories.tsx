import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Octagon } from "lucide-react";

import { AIAbortButton } from "@/components/ui";

const docsSource = `
const handleAbort = () => {
  // Cancel the active assistant response.
};

<AIAbortButton busy onAbort={handleAbort} />
`;

const meta: Meta<typeof AIAbortButton> = {
  title: "AI/AIAbortButton",
  component: AIAbortButton,
  parameters: {
    docs: {
      description: {
        component:
          "Abort buttons surface while the assistant streams output. Keep them disabled until content is flowing so accidental clicks do not cancel idle sessions.",
      },
      source: {
        code: docsSource,
        language: "tsx",
      },
    },
    controls: {
      include: ["busy", "label"],
    },
  },
  args: {
    onAbort: fn(),
    busy: false,
  },
  argTypes: {
    onAbort: { action: "abort" },
    className: { control: false },
    children: { control: false },
    icon: { control: false },
    disabled: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof AIAbortButton>;

export const Idle: Story = {
  name: "Idle (disabled)",
  args: {
    busy: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "The button remains disabled until the assistant begins streaming. Screen readers still announce that the control will stop generation when active.",
      },
    },
  },
};

export const Busy: Story = {
  args: {
    busy: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Set `busy` to true once tokens stream. The control enables immediately so users can cancel without waiting for the model to finish.",
      },
    },
  },
};

export const CustomLabel: Story = {
  args: {
    busy: true,
    label: "Abort rewrite",
  },
  render: (args) => (
    <AIAbortButton
      {...args}
      icon={<Octagon className="size-[var(--space-4)]" aria-hidden />}
    >
      Abort rewrite
    </AIAbortButton>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Provide a custom `label` (and matching children) when canceling a specific workflow like a rewrite or summarization. Icons can be swapped to align with domain semantics.",
      },
    },
  },
};
