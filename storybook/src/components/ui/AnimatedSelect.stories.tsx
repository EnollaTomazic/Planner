import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AnimatedSelect } from "@/components/ui";

const meta: Meta<typeof AnimatedSelect> = {
  title: "Primitives/AnimatedSelect",
  component: AnimatedSelect,
  argTypes: {
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "inline-radio" },
    },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "AnimatedSelect automatically repositions the floating menu to stay visible within the viewport.",
      },
    },
  },
  args: {
    size: "md",
  },
};

export default meta;

type Story = StoryObj<typeof AnimatedSelect>;

const demoItems = [
  { value: "now", label: "Immediate" },
  { value: "soon", label: "Later today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "next-week", label: "Next week" },
];

type AnimatedSelectProps = React.ComponentProps<typeof AnimatedSelect>;

function AutoOpenDemo(props: AnimatedSelectProps) {
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    const node = triggerRef.current;
    if (!node) return;
    const raf = requestAnimationFrame(() => {
      if (node.getAttribute("aria-expanded") !== "true") {
        node.click();
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex min-h-screen items-end justify-center bg-background p-[var(--space-6)]">
      <AnimatedSelect ref={triggerRef} {...props} />
    </div>
  );
}

export const FlipsNearViewportEdge: Story = {
  args: {
    label: "Schedule",
    placeholder: "Choose timing",
    items: demoItems,
  },
  render: (args) => <AutoOpenDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          "This scenario renders the select control near the bottom of the viewport. The menu flips upward to remain fully visible.",
      },
    },
  },
};

