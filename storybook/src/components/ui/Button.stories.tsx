import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui";

const meta: Meta<typeof Button> = {
  title: "Primitives/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Buttons can render native buttons by default or anchors when `href` is provided. The same size, tone, and motion tokens apply across both variants.",
      },
    },
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg", "xl"],
    },
  },
  args: {
    tone: "primary",
    variant: "secondary",
    size: "md",
    children: "Action",
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const AsAnchor: Story = {
  args: {
    href: "https://planner.example/link",
    tone: "accent",
    variant: "primary",
    children: "Anchor CTA",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Passing `href` renders the button as an anchor while keeping hover, focus, active, loading, and disabled behavior aligned with the button variant.",
      },
    },
  },
};
