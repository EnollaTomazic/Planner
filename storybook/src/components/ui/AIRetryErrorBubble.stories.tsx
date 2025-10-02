import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { AIRetryErrorBubble, AIExplainTooltip } from "@/components/ui/ai";

const meta: Meta<typeof AIRetryErrorBubble> = {
  title: "AI/AIRetryErrorBubble",
  component: AIRetryErrorBubble,
  parameters: {
    docs: {
      description: {
        component:
          "Retry bubbles acknowledge transient issues in the stream and keep the transcript readable while offering recovery.",
      },
    },
  },
  args: {
    onRetry: () => {},
  },
  argTypes: {
    onRetry: { action: "retry" },
  },
};

export default meta;

type Story = StoryObj<typeof AIRetryErrorBubble>;

export const Default: Story = {
  args: {
    message: "The assistant lost connection mid-thought.",
    hint: "Retry to request a clean draft.",
  },
};

export const WithDiagnostics: Story = {
  args: {
    message: "The assistant lost connection mid-thought.",
    hint: "Retry to request a clean draft.",
  },
  render: (args) => (
    <AIRetryErrorBubble {...args}>
      <AIExplainTooltip
        triggerLabel="See diagnostics"
        explanation="Connection dropped between streaming chunks. We recommend retrying so the assistant can rehydrate context."
        triggerProps={{ size: "sm", variant: "quiet" }}
      />
    </AIRetryErrorBubble>
  ),
};

export const Acknowledged: Story = {
  args: {
    message: "Assistant recovered after a brief network hiccup.",
    hint: "You can continue the conversation.",
    onRetry: undefined,
  },
};
