import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ReviewSurface, ReviewSliderTrack } from "@/components/reviews";
import { cn } from "@/lib/utils";

const meta: Meta<typeof ReviewSurface> = {
  title: "Reviews/ReviewSurface",
  component: ReviewSurface,
  args: {
    tone: "default",
    padding: "md",
    children: (
      <div className="text-ui text-foreground/70">Review surface content</div>
    ),
  },
  parameters: {
    docs: {
      description: {
        component:
          "Review surfaces wrap score summaries, sliders, and timestamp rows with consistent card styling driven by semantic tokens.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ReviewSurface>;

export const Playground: Story = {};

export const MutedTone: Story = {
  args: {
    tone: "muted",
  },
};

export const SliderTrack: Story = {
  args: {
    padding: "inline",
    children: undefined,
  },
  render: (args) => (
    <div className="flex w-64 flex-col gap-[var(--space-3)]">
      <ReviewSurface
        {...args}
        className={cn("relative h-[var(--control-h-lg)]", args.className)}
      >
        <ReviewSliderTrack value={7} tone="score" variant="display" />
      </ReviewSurface>
      <ReviewSurface
        {...args}
        className={cn("relative h-[var(--control-h-lg)]", args.className)}
      >
        <ReviewSliderTrack value={6} tone="focus" variant="display" />
      </ReviewSurface>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "ReviewSliderTrack slots inside ReviewSurface to render shared slider visuals for scores and focus metrics.",
      },
    },
  },
};
