import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Hero, Button } from "@/components/ui";
import {
  HERO_ILLUSTRATION_STATES,
  type HeroIllustrationState,
} from "@/data/heroImages";

const heroStateCopy: Record<HeroIllustrationState, { subtitle: string; description: string }> = {
  idle: {
    subtitle: "Default idle state",
    description:
      "The baseline illustration keeps the dashboard calm while the assistant idles awaiting user input.",
  },
  hover: {
    subtitle: "Hover lighting",
    description:
      "Subtle lighting shifts reinforce pointer intent when the hero surface is hovered without overwhelming the copy.",
  },
  focus: {
    subtitle: "Focus highlight",
    description:
      "Stronger contrast supports keyboard and assistive tech focus so critical controls stay visible during navigation.",
  },
  alternate: {
    subtitle: "Alternate palette",
    description:
      "An alternate treatment introduces the glitch accent palette for celebratory or themed planner moments.",
  },
};

const docsSnippet = `
<Hero
  eyebrow="Planner"
  heading="Mission control"
  subtitle="Default idle state"
  illustrationState="idle"
>
  <p>The baseline illustration keeps the dashboard calm while the assistant idles.</p>
</Hero>
`;

const meta: Meta<typeof Hero> = {
  title: "Planner/Hero",
  component: Hero,
  parameters: {
    docs: {
      description: {
        component:
          "Planner hero illustrations support idle, hover, focus, and alternate lighting. Use the matching state to mirror the user's interaction without swapping copy or layout.",
      },
      source: {
        code: docsSnippet,
        language: "tsx",
      },
    },
    controls: {
      disable: true,
    },
  },
};

export default meta;

type Story = StoryObj<typeof Hero>;

export const IllustrationStates: Story = {
  name: "Illustration states",
  render: () => (
    <div className="flex flex-col gap-[var(--space-10)]">
      {HERO_ILLUSTRATION_STATES.map((state) => {
        const copy = heroStateCopy[state];

        return (
          <Hero
            key={state}
            eyebrow="Planner hero"
            heading="Mission control"
            subtitle={copy.subtitle}
            illustrationState={state}
            actions={
              <Button size="sm" variant="neo">
                Launch sprint
              </Button>
            }
          >
            <p className="text-ui text-muted-foreground">{copy.description}</p>
          </Hero>
        );
      })}
    </div>
  ),
};
