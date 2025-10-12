import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ScrollTopFloatingButton } from "@/components/planner/ScrollTopFloatingButton";

const meta: Meta<typeof ScrollTopFloatingButton> = {
  title: "Planner/ScrollTopFloatingButton",
  component: ScrollTopFloatingButton,
};
export default meta;

type Story = StoryObj<typeof ScrollTopFloatingButton>;

export const Visible: Story = {
  render: () => {
    const ref = React.createRef<HTMLElement>();
    return <ScrollTopFloatingButton watchRef={ref} forceVisible />;
  },
};
