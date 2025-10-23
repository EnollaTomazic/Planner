import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Toast, Button } from "@/components/ui";

const meta: Meta<typeof Toast> = {
  title: "Feedback/Toast",
  component: Toast,
  parameters: {
    docs: {
      description: {
        component:
          "Toasts automatically dismiss after their duration. Hover the surface or focus interactive content inside to pause the timer. Enable `showProgress` to surface a shrinking bar that mirrors the remaining time.",
      },
    },
  },
  args: {
    duration: 4000,
    closable: true,
    showProgress: true,
    children: <p className="text-ui">Settings saved</p>,
  },
  argTypes: {
    children: { control: false },
    open: { control: false },
    onOpenChange: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof Toast>;

export const AutoDismiss: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(true);

    React.useEffect(() => {
      setOpen(true);
    }, [args.duration, args.children, args.closable, args.showProgress]);

    return (
      <div className="space-y-[var(--space-3)]">
        <Button size="sm" onClick={() => setOpen(true)}>
          Show toast
        </Button>
        <p className="text-ui text-muted-foreground">
          Hover the toast or focus the close button to pause dismissal.
        </p>
        <Toast {...args} open={open} onOpenChange={setOpen} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "The toast pauses when hovered or when any focusable child (like the close button) is active. The optional progress bar mirrors the remaining time and resumes when interaction ends.",
      },
    },
  },
};
