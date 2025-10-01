import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Cog, RefreshCw, Trash2 } from "lucide-react";
import { IconButton } from "@/components/ui";

const meta: Meta<typeof IconButton> = {
  title: "Primitives/IconButton",
  component: IconButton,
  parameters: {
    docs: {
      description: {
        component:
          "Icon buttons must expose an accessible name when the child content is only an icon. Provide `aria-label`, `aria-labelledby`, or a `title` attribute (which will be mirrored to `aria-label` for assistive tech).",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof IconButton>;

export const WithAriaLabel: Story = {
  args: {
    variant: "quiet",
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
    variant: "secondary",
    tone: "info",
    size: "sm",
  },
  render: (args) => (
    <IconButton {...args} title="Refresh data">
      <RefreshCw />
    </IconButton>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "When you only have tooltip text, set the `title` attribute. IconButton will reuse the value as an `aria-label` so screen readers announce the control.",
      },
    },
  },
};

export const WithAriaLabelledby: Story = {
  args: {
    variant: "primary",
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
