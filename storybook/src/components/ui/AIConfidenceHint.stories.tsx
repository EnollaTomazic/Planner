import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { AIConfidenceHint, AIExplainTooltip } from "@/components/ui/ai";

const meta: Meta<typeof AIConfidenceHint> = {
  title: "AI/AIConfidenceHint",
  component: AIConfidenceHint,
  parameters: {
    docs: {
      description: {
        component:
          "Confidence hints communicate how well the assistant grounded its response so players know when to verify details.",
      },
    },
  },
  args: {
    level: "medium",
    score: 0.62,
    description: "Signals look solid with a couple of open questions to verify.",
  },
};

export default meta;

type Story = StoryObj<typeof AIConfidenceHint>;

export const Medium: Story = {};

export const Low: Story = {
  args: {
    level: "low",
    score: 0.22,
    description: "Grounding is limited, so double-check the assistant before sharing.",
  },
};

export const High: Story = {
  args: {
    level: "high",
    score: 0.92,
    description: "The answer matched trusted sources and passed self-checks.",
  },
};

export const WithTooltip: Story = {
  render: (args) => (
    <AIConfidenceHint {...args}>
      <AIExplainTooltip
        triggerLabel="Why this rating?"
        explanation="Confidence blends retrieval coverage, grounding matches, and the assistant's self-check heuristics."
        tone="neutral"
        triggerProps={{ size: "sm", variant: "quiet" }}
      />
    </AIConfidenceHint>
  ),
};
