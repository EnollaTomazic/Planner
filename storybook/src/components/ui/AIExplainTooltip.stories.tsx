import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { AIExplainTooltip } from "@/components/ui/ai";

const meta: Meta<typeof AIExplainTooltip> = {
  title: "AI/AIExplainTooltip",
  component: AIExplainTooltip,
  parameters: {
    docs: {
      description: {
        component:
          "Explain tooltips provide contextual guidance without pulling focus away from the transcript or action buttons.",
      },
    },
  },
  args: {
    triggerLabel: "How grounding works",
    explanation:
      "We cross-check the draft with curated playbook snippets and logged scrim outcomes before surfacing it here.",
    shortcutHint: "Press ? to open help",
  },
};

export default meta;

type Story = StoryObj<typeof AIExplainTooltip>;

export const Accent: Story = {};

export const Neutral: Story = {
  args: {
    tone: "neutral",
    triggerLabel: "Why am I seeing this?",
    explanation: "Neutral tone keeps the helper grounded when accent colors would clash with nearby status surfaces.",
  },
};

export const DefaultOpen: Story = {
  args: {
    defaultOpen: true,
    triggerLabel: "Trace summary",
    explanation: "Opens by default for first-run experiences where guidance is critical.",
  },
};
