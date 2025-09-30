import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TimestampMarkers } from "@/components/reviews";
import type { ReviewMarker } from "@/lib/types";
import { Skeleton } from "@/components/ui";
import { createStorageKey } from "@/lib/db";
import {
  LAST_MARKER_MODE_KEY,
  LAST_MARKER_TIME_KEY,
} from "@/components/reviews/reviewData";

const markerSeed: ReviewMarker[] = [
  {
    id: "ts-1",
    time: "02:45",
    seconds: 165,
    note: "Crash wave then ward raptor ramp",
  },
  {
    id: "ts-2",
    time: "09:18",
    seconds: 558,
    note: "Skipped recall to shadow jungler",
  },
  {
    id: "ts-3",
    time: "15:02",
    seconds: 902,
    note: "Lost track of bot wave state",
    noteOnly: true,
  },
];

type TimestampMarkersComponentProps = React.ComponentProps<typeof TimestampMarkers>;

const noopCommitMeta: TimestampMarkersComponentProps["commitMeta"] = () => undefined;

const meta: Meta<typeof TimestampMarkers> = {
  title: "Reviews/TimestampMarkers",
  component: TimestampMarkers,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "`TimestampMarkers` tracks mm:ss pairs or note-only highlights. Pass an array of persisted `ReviewMarker` entries plus a `commitMeta` callback to store edits.",
      },
    },
    chromatic: { pauseAnimationAtEnd: true },
  },
  args: {
    markers: markerSeed,
    commitMeta: noopCommitMeta,
  },
  argTypes: {
    markers: {
      control: false,
      description:
        "Existing marker entries, already normalized to `time`, `seconds`, and `noteOnly` flags.",
    },
    commitMeta: {
      control: false,
      description:
        "Required callback that receives `{ markers: ReviewMarker[] }` whenever the list is edited.",
    },
  },
};

export default meta;

type Story = StoryObj<typeof TimestampMarkers>;

function StorySurface({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[var(--background)] py-[var(--space-8)]">
      <div className="mx-auto flex w-full max-w-[min(40rem,100%)] flex-col gap-[var(--space-5)] px-[var(--space-6)]">
        {children}
      </div>
    </div>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Markers sorted chronologically with timestamp and note-only entries share the same spacing tokens for predictable scanning.",
      },
    },
  },
  render: (args) => (
    <StorySurface>
      <TimestampMarkers {...args} />
    </StorySurface>
  ),
};

function MarkersLoadingSkeleton() {
  return (
    <div className="rounded-card border border-border/40 bg-[color-mix(in_oklab,var(--surface) 92%,transparent)] p-[var(--space-4)] shadow-outline-subtle">
      <div className="flex flex-col gap-[var(--space-3)]">
        <Skeleton className="h-[var(--space-4)] w-full max-w-[calc(var(--space-8)*2)]" />
        <div className="flex items-center gap-[var(--space-2)]">
          <Skeleton className="h-[var(--space-8)] w-[var(--space-8)] rounded-full" />
          <Skeleton className="h-[var(--space-8)] w-[var(--space-8)] rounded-full" />
        </div>
        <div className="grid gap-[var(--space-3)]">
          <Skeleton className="h-[var(--space-8)] rounded-[var(--control-radius)]" />
          <Skeleton className="h-[var(--space-8)] rounded-[var(--control-radius)]" />
        </div>
        <div className="grid gap-[var(--space-2)]">
          <Skeleton className="h-[var(--space-6)] rounded-[var(--control-radius)]" />
          <Skeleton className="h-[var(--space-6)] rounded-[var(--control-radius)]" />
          <Skeleton className="h-[var(--space-6)] rounded-[var(--control-radius)]" />
        </div>
      </div>
    </div>
  );
}

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "When review metadata is still loading, skeleton blocks mirror the toggle rail, inputs, and existing markers so the list doesn't jump once content arrives.",
      },
    },
  },
  render: () => (
    <StorySurface>
      <MarkersLoadingSkeleton />
    </StorySurface>
  ),
};

function ErrorPreview(props: React.ComponentProps<typeof TimestampMarkers>) {
  const cleanupRef = React.useRef<(() => void) | null>(null);

  if (cleanupRef.current === null && typeof window !== "undefined") {
    const modeKey = createStorageKey(LAST_MARKER_MODE_KEY);
    const timeKey = createStorageKey(LAST_MARKER_TIME_KEY);
    const prevMode = window.localStorage.getItem(modeKey);
    const prevTime = window.localStorage.getItem(timeKey);
    window.localStorage.setItem(modeKey, JSON.stringify(true));
    window.localStorage.setItem(timeKey, JSON.stringify("99:99"));
    cleanupRef.current = () => {
      if (prevMode === null) {
        window.localStorage.removeItem(modeKey);
      } else {
        window.localStorage.setItem(modeKey, prevMode);
      }
      if (prevTime === null) {
        window.localStorage.removeItem(timeKey);
      } else {
        window.localStorage.setItem(timeKey, prevTime);
      }
    };
  }

  React.useEffect(() => () => cleanupRef.current?.(), []);
  return <TimestampMarkers {...props} />;
}

export const Error: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Invalid timestamp formats surface inline guidance in the semantic danger color. Seed local storage with the malformed value so QA can verify validation.",
      },
    },
  },
  render: (args) => (
    <StorySurface>
      <ErrorPreview {...args} />
    </StorySurface>
  ),
};

function ReducedMotionPreview({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.add("no-animations");
    return () => {
      root.classList.remove("no-animations");
    };
  }, []);
  return <>{children}</>;
}

export const ReducedMotion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Reduced-motion mode disables the toggle glow and marker pulses while retaining spacing so the interface stays steady for sensitive users.",
      },
    },
  },
  render: (args) => (
    <ReducedMotionPreview>
      <StorySurface>
        <TimestampMarkers {...args} />
      </StorySurface>
    </ReducedMotionPreview>
  ),
};
