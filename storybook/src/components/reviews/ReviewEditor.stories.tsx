import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ReviewEditor } from "@/components/reviews";
import type { Review } from "@/lib/types";
import { Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

const reviewSeed: Review = {
  id: "review-seed-1",
  title: "Lux vs Ahri — Mid lane review",
  opponent: "Ahri",
  lane: "Mid Lane",
  side: "Blue",
  patch: "14.21",
  duration: "32:18",
  matchup: "Lux vs Ahri",
  tags: ["lane-phase", "vision"],
  pillars: ["Vision", "Tempo"],
  notes:
    "Early slow push created crash timing for first roam. Need faster ward swap before 6.",
  createdAt: Date.now() - 1000 * 60 * 60 * 24,
  result: "Win",
  score: 8,
  role: "MID",
  focusOn: true,
  focus: 7,
  markers: [
    { id: "m1", time: "03:15", seconds: 195, note: "Wave held for bounce" },
    { id: "m2", time: "08:41", seconds: 521, note: "Forcing flash mid" },
  ],
};

type ReviewEditorComponentProps = React.ComponentProps<typeof ReviewEditor>;

const noopChangeMeta: NonNullable<ReviewEditorComponentProps["onChangeMeta"]> = () =>
  undefined;
const noopChangeNotes: NonNullable<ReviewEditorComponentProps["onChangeNotes"]> = () =>
  undefined;
const noopChangeTags: NonNullable<ReviewEditorComponentProps["onChangeTags"]> = () =>
  undefined;
const noopRename: NonNullable<ReviewEditorComponentProps["onRename"]> = () => undefined;
const noopDone: NonNullable<ReviewEditorComponentProps["onDone"]> = () => undefined;
const noopDelete: NonNullable<ReviewEditorComponentProps["onDelete"]> = () => undefined;

const meta: Meta<typeof ReviewEditor> = {
  title: "Reviews/ReviewEditor",
  component: ReviewEditor,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "`ReviewEditor` expects a hydrated `Review` record plus callbacks for persisting metadata, notes, and lifecycle events. Use semantic spacing tokens (`var(--space-*)`) around the editor to keep cards aligned with the planner grid.",
      },
    },
    chromatic: { pauseAnimationAtEnd: true },
  },
  args: {
    review: reviewSeed,
    onChangeMeta: noopChangeMeta,
    onChangeNotes: noopChangeNotes,
    onChangeTags: noopChangeTags,
    onRename: noopRename,
    onDone: noopDone,
    onDelete: noopDelete,
  },
  argTypes: {
    review: {
      control: false,
      description:
        "Hydrated review entity including id, tags, pillars, and optional metadata fields used throughout the editor rails.",
    },
    onChangeMeta: {
      control: false,
      description:
        "Callback fired whenever nested sections commit metadata updates (lane, opponent, score, pillars, timestamps).",
    },
    onChangeNotes: {
      control: false,
      description: "Persist edited notes when focus leaves the textarea or save actions trigger.",
    },
    onChangeTags: {
      control: false,
      description: "Persist chip tag changes from the quick-add footer.",
    },
    onRename: {
      control: false,
      description: "Optional handler for syncing lane title edits into surrounding shells.",
    },
    onDone: {
      control: false,
      description: "Optional handler invoked when the editor loses focus so callers can close drawers or navigate away.",
    },
    onDelete: {
      control: false,
      description: "Optional handler connected to the trash action in the header rail.",
    },
    className: {
      control: false,
    },
  },
};

export default meta;

type Story = StoryObj<typeof ReviewEditor>;

function StorySurface({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[var(--background)] py-[var(--space-8)]">
      <div className="mx-auto flex w-full max-w-[min(75rem,100%)] flex-col gap-[var(--space-6)] px-[var(--space-6)]">
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
          "Baseline editor with populated review seed demonstrating compliant spacing, slider rails, and timestamp markers in their default arrangement.",
      },
    },
  },
  render: (args) => (
    <StorySurface>
      <ReviewEditor {...args} className={cn("w-full", args.className)} />
    </StorySurface>
  ),
};

function EditorLoadingSkeleton() {
  return (
    <div className="rounded-card border border-border/40 bg-[color-mix(in_oklab,var(--surface) 92%,transparent)] p-[var(--space-5)] shadow-outline-subtle">
      <div className="flex flex-col gap-[var(--space-4)]">
        <Skeleton className="h-[var(--space-5)] w-full max-w-[calc(var(--space-8)*2)]" />
        <div className="grid gap-[var(--space-3)] sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Skeleton className="h-[var(--space-8)] rounded-[var(--control-radius)]" />
          <Skeleton className="h-[var(--space-8)] rounded-[var(--control-radius)]" />
        </div>
        <Skeleton className="h-[calc(var(--space-8)*3)] rounded-[var(--control-radius)]" />
        <Skeleton className="h-[calc(var(--space-8)*2+var(--space-4))] rounded-[var(--control-radius)]" />
      </div>
    </div>
  );
}

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "While review data hydrates, layer skeleton placeholders that mirror the editor grid so motion stays predictable and spacing stays token-aligned.",
      },
    },
  },
  render: (args) => (
    <StorySurface>
      <div className="grid gap-[var(--space-4)]">
        <EditorLoadingSkeleton />
        <ReviewEditor
          {...args}
          className={cn(
            "pointer-events-none opacity-40 blur-[1px]",
            args.className,
          )}
        />
      </div>
    </StorySurface>
  ),
};

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-card border border-danger/40 bg-[color-mix(in_oklab,var(--danger)/15%,transparent)] px-[var(--space-4)] py-[var(--space-3)] text-label text-danger shadow-outline-subtle"
    >
      {message}
    </div>
  );
}

export const Error: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Surface sync failures with a semantic danger banner while keeping the editor visible for context. QA can wire the retry button into `onDone` or close actions as needed.",
      },
    },
  },
  render: (args) => (
    <StorySurface>
      <div className="grid gap-[var(--space-4)]">
        <ErrorBanner message="Failed to save review changes. Check your connection and retry." />
        <ReviewEditor {...args} className={cn("ring-1 ring-danger/40", args.className)} />
      </div>
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
          "Reduced-motion mode disables the editor's neon focus and pulse animations while preserving spacing and state readability.",
      },
    },
  },
  render: (args) => (
    <ReducedMotionPreview>
      <StorySurface>
        <ReviewEditor
          {...args}
          className={cn("data-[reduced-motion=true]:transition-none", args.className)}
        />
      </StorySurface>
    </ReducedMotionPreview>
  ),
};
