import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Cog, Trash2 } from "lucide-react";
import { IconButton } from "@/components/ui";

const meta: Meta<typeof IconButton> = {
  title: "Primitives/IconButton",
  component: IconButton,
  parameters: {
    docs: {
      description: {
        component:
          "Icon buttons must include either an `aria-label` or `title` when the child content is only an icon.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof IconButton>;

export const WithAriaLabel: Story = {
  args: {
    variant: "ring",
    tone: "primary",
    size: "md",
  },
  render: (args) => (
    <IconButton {...args} aria-label="Open settings">
      <Cog />
    </IconButton>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use `aria-label` when the icon conveys an action without visible text. This label is announced to assistive technology.",
      },
    },
  },
};

export const WithTitle: Story = {
  args: {
    variant: "solid",
    tone: "danger",
    size: "md",
  },
  render: (args) => (
    <IconButton {...args} title="Delete item">
      <Trash2 />
    </IconButton>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Providing a `title` also satisfies the accessible label requirement; the component applies it as an `aria-label` automatically.",
      },
    },
  },
};
