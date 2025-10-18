import type { Meta, StoryObj } from "@storybook/react";

import { AITypingIndicator } from "@/components/ui/ai";

const meta: Meta<typeof AITypingIndicator> = {
  title: "AI/AITypingIndicator",
  component: AITypingIndicator,
  parameters: {
    docs: {
      description: {
        component:
          "Typing indicator bubbles show that the assistant is still streaming context while keeping the transcript readable.",
      },
    },
  },
  args: {
    hint: "Streaming contextual response",
    children: "Drafting follow-up",
  },
};

export default meta;

type Story = StoryObj<typeof AITypingIndicator>;

export const Typing: Story = {
  args: {
    isTyping: true,
  },
};

export const Paused: Story = {
  args: {
    isTyping: false,
    hint: "Paused",
    children: "Tap resume to continue",
  },
};

export const Minimal: Story = {
  args: {
    showAvatar: false,
    hint: "Gathering teammates",
    children: undefined,
  },
};
