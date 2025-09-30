import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ReviewList } from "@/components/reviews";
import type { Review } from "@/lib/types";
import { Button, Card, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

const reviewListSeed: Review[] = [
  {
    id: "review-201",
    title: "Lux vs Ahri — Mid control",
    matchup: "Lux vs Ahri",
    tags: ["priority", "vision"],
    pillars: ["Vision", "Tempo"],
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    role: "MID",
    result: "Win",
    score: 8,
  },
  {
    id: "review-202",
    title: "Sivir vs Xayah — Tempo review",
    matchup: "Sivir vs Xayah",
    tags: ["lane-phase"],
    pillars: ["Wave"],
    createdAt: Date.now() - 1000 * 60 * 60 * 30,
    role: "BOT",
    result: "Loss",
    score: 5,
  },
  {
    id: "review-203",
    title: "Leona roam timings",
    matchup: "Leona vs Nautilus",
    tags: ["roam", "vision"],
    pillars: ["Comms", "Vision"],
    createdAt: Date.now() - 1000 * 60 * 90,
    role: "SUPPORT",
    result: "Win",
    score: 7,
    status: "new",
  },
];

type ReviewListComponentProps = React.ComponentProps<typeof ReviewList>;

const noopSelect: NonNullable<ReviewListComponentProps["onSelect"]> = () => undefined;
const noopCreate: NonNullable<ReviewListComponentProps["onCreate"]> = () => undefined;

const meta: Meta<typeof ReviewList> = {
  title: "Reviews/ReviewList",
  component: ReviewList,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "`ReviewList` renders a vertical stack of `ReviewListItem` shells. Provide the current review collection, the selected id, and callbacks for row selection and creation so QA can confirm sidebar flows. When the collection is empty, the component swaps to the glitch ghost call to action while the hero search and sort controls remain disabled until data exists.",
      },
    },
    chromatic: { pauseAnimationAtEnd: true },
  },
  args: {
    reviews: reviewListSeed,
    selectedId: reviewListSeed[0]?.id ?? null,
    onSelect: noopSelect,
    onCreate: noopCreate,
  },
  argTypes: {
    reviews: {
      control: false,
      description: "Ordered array of review entities to display in the sidebar list.",
    },
    selectedId: {
      control: false,
      description: "Currently focused review id so the list can highlight the active row.",
    },
    onSelect: {
      control: false,
      description: "Handler invoked when a row is clicked or activated via keyboard.",
    },
    onCreate: {
      control: false,
      description: "Callback wired to the empty state action for drafting a new review.",
    },
    className: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof ReviewList>;

function StorySurface({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[var(--background)] py-[var(--space-8)]">
      <div className="mx-auto flex w-full max-w-[min(36rem,100%)] flex-col gap-[var(--space-5)] px-[var(--space-6)]">
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
          "Default list with the most recent review selected. The status pulse uses semantic motion tokens while spacing respects the review rail grid.",
      },
    },
  },
  render: (args) => (
    <StorySurface>
      <ReviewList {...args} className={cn("w-full", args.className)} />
    </StorySurface>
  ),
};

export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Empty state showcasing the glitch ghost treatment. The create action remains primary and the page-level search controls stay disabled until at least one review lands.",
      },
    },
  },
  args: {
    reviews: [],
    selectedId: null,
  },
  render: (args) => (
    <StorySurface>
      <ReviewList {...args} className={cn("w-full", args.className)} />
    </StorySurface>
  ),
};

function ReviewListSkeleton() {
  return (
    <Card className="space-y-[var(--space-3)] p-[var(--space-4)] shadow-outline-subtle">
      {[0, 1, 2].map((row) => (
        <div key={row} className="space-y-[var(--space-2)]">
          <Skeleton className="h-[var(--space-4)] w-full max-w-[calc(var(--space-8)*4)]" />
          <Skeleton className="h-[var(--space-3)] w-full max-w-[calc(var(--space-8)*3)]" />
        </div>
      ))}
    </Card>
  );
}

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "While the review feed loads, swap in skeleton rows sized with spacing tokens and keep the existing list blurred underneath to avoid layout shift.",
      },
    },
  },
  render: (args) => (
    <StorySurface>
      <div className="relative">
        <ReviewList
          {...args}
          className={cn("pointer-events-none opacity-30 blur-[1px]", args.className)}
        />
        <div
          aria-hidden
          className="absolute inset-[var(--space-3)] flex flex-col gap-[var(--space-3)]"
        >
          <ReviewListSkeleton />
        </div>
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
          "Pair the list with an inline alert when fetches fail. The banner keeps motion minimal while `ReviewList` remains disabled until retries succeed.",
      },
    },
  },
  render: (args) => (
    <StorySurface>
      <div className="grid gap-[var(--space-4)]">
        <ErrorBanner message="We couldn't load your recent reviews. Try again in a few seconds." />
        <div className="rounded-card border border-border/40 bg-card/60 p-[var(--space-3)]">
          <div className="flex items-center justify-between gap-[var(--space-3)]">
            <span className="text-ui text-muted-foreground">Last sync attempt: 30s ago</span>
            <Button size="sm" tone="accent" onClick={() => args.onSelect?.("retry")}>Retry</Button>
          </div>
        </div>
        <ReviewList
          {...args}
          reviews={[]}
          selectedId={null}
          className={cn("pointer-events-none ring-1 ring-danger/40", args.className)}
        />
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
          "Reduced-motion mode removes the glitch shimmer, falling back to the static ghost avatar while keeping spacing, shadows, and focus treatment intact for accessibility sign-off.",
      },
    },
  },
  args: {
    reviews: [],
    selectedId: null,
  },
  render: (args) => (
    <ReducedMotionPreview>
      <StorySurface>
        <ReviewList {...args} className={cn("w-full", args.className)} />
      </StorySurface>
    </ReducedMotionPreview>
  ),
};
