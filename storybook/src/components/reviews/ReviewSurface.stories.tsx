import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ReviewSurface from "@/components/reviews/ReviewSurface";

const meta: Meta<typeof ReviewSurface> = {
  title: "Reviews/ReviewSurface",
  component: ReviewSurface,
  args: {
    tone: "default",
    padding: "sm",
    children: (
      <p className="text-ui text-muted-foreground">
        ReviewSurface wraps review content in the shared rounded card shell,
        ensuring consistent tokens for radius, border, and background.
      </p>
    ),
  },
};

export default meta;

type Story = StoryObj<typeof ReviewSurface>;

export const Playground: Story = {};

export const SliderShell: Story = {
  args: {
    padding: "none",
    paddingX: "md",
    children: (
      <div className="relative h-12">
        <div className="absolute left-[var(--space-4)] right-[var(--space-4)] top-1/2 -translate-y-1/2">
          <div className="relative h-2 w-full rounded-full bg-muted shadow-neo-inset">
            <div
              className="absolute left-0 top-0 h-2 w-[55%] rounded-full bg-gradient-to-r from-primary to-accent shadow-ring [--ring:var(--primary)]"
            />
            <div
              className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-border bg-card shadow-neoSoft"
              style={{ left: "calc(55% - (var(--space-2) + var(--space-1) / 2))" }}
            />
          </div>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Combine padding controls with custom slider markup to recreate the score and focus inputs used throughout reviews.",
      },
    },
  },
};

export const MutedTone: Story = {
  args: {
    tone: "muted",
    padding: "md",
    children: (
      <div className="space-y-[var(--space-1)] text-ui">
        <p className="font-medium text-foreground/80">Muted tone</p>
        <p className="text-muted-foreground">
          Muted surfaces lean on the muted token for quieter callouts while keeping
          the same rounded geometry.
        </p>
      </div>
    ),
  },
};
