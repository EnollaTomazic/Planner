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
          "Icon buttons must include either an `aria-label` or `aria-labelledby` when the child content is only an icon. Titles may be added for tooltips but do not replace the required accessible name.",
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

export const WithAriaLabelledby: Story = {
  args: {
    variant: "solid",
    tone: "danger",
    size: "md",
  },
  render: (args) => (
    <>
      <span id="delete-action">Delete item</span>
      <IconButton {...args} aria-labelledby="delete-action">
        <Trash2 />
      </IconButton>
    </>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "When a nearby element already provides the visible label, connect it with `aria-labelledby` so screen readers announce the same text.",
      },
    },
  },
};
