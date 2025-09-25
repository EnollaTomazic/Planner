"use client";

import * as React from "react";
import { Star } from "lucide-react";
import Banner from "@/components/chrome/Banner";
import BrandWordmark from "@/components/chrome/BrandWordmark";
import NavBar from "@/components/chrome/NavBar";
import {
  Button,
  Card,
  GlitchProgress,
  Header,
  Hero,
  HeroCol,
  HeroGrid,
  NeoCard,
  NeonIcon,
  NeomorphicHeroFrame,
  PageShell,
  Progress,
  SearchBar,
  Snackbar,
  Spinner,
  TitleBar,
} from "@/components/ui";
import Badge from "@/components/ui/primitives/Badge";
import VirtualizedList from "@/components/ui/primitives/VirtualizedList";
import {
  ReviewListItem,
  ReviewPanel,
  ReviewSliderTrack,
  ReviewSurface,
  ScoreMeter,
} from "@/components/reviews";
import GalleryItem from "../GalleryItem";
import { cn } from "@/lib/utils";
import { demoReview } from "./ComponentGallery.demoData";
import type { MiscPanelData } from "./useComponentGalleryState";

const GRID_CLASS =
  "grid grid-cols-1 gap-[var(--space-6)] sm:grid-cols-2 md:grid-cols-12 md:gap-[var(--space-8)]";
type PanelItem = { label: string; element: React.ReactNode; className?: string };

interface MiscPanelProps {
  data: MiscPanelData;
}

const VirtualizedListDemo = React.memo(function VirtualizedListDemo() {
  const scrollParentRef = React.useRef<HTMLDivElement>(null);
  const rows = React.useMemo(() => {
    return Array.from({ length: 120 }, (_, index) => `Item ${index + 1}`);
  }, []);

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border/40 bg-card">
      <div className="border-b border-border/40 px-[var(--space-2)] py-[var(--space-1)] text-label font-semibold">
        Virtualized list
      </div>
      <div
        ref={scrollParentRef}
        className="max-h-[calc(var(--space-12)*3)] overflow-y-auto text-ui"
      >
        <table className="w-full text-left text-xs">
          <tbody>
            <VirtualizedList
              items={rows}
              rowHeight={32}
              overscan={2}
              scrollParentRef={scrollParentRef}
              renderItem={(item, index) => (
                <tr
                  key={index}
                  className="h-8 border-b border-border/30 last:border-b-0"
                >
                  <td className="px-[var(--space-2)] text-muted-foreground">{item}</td>
                </tr>
              )}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default function MiscPanel({ data }: MiscPanelProps) {
  const items = React.useMemo<PanelItem[]>(
    () =>
      [
        { label: "Badge", element: <Badge tone="neutral">Badge</Badge> },
        { label: "Badge Accent", element: <Badge tone="accent">Accent</Badge> },
        {
          label: "Accent Overlay Box",
          element: (
            <div className="w-56 h-6 flex items-center justify-center rounded-[var(--radius-md)] bg-accent-overlay text-accent-foreground">
              Overlay
            </div>
          ),
        },
        {
          label: "Foreground Overlay Box",
          element: (
            <div className="w-56 h-6 flex items-center justify-center rounded-[var(--radius-md)] border border-border/10 bg-foreground/5 text-foreground/70">
              FG Overlay
            </div>
          ),
        },
        {
          label: "Surface",
          element: (
            <div className="w-56 h-6 flex items-center justify-center rounded-[var(--radius-md)] bg-surface">
              Surface
            </div>
          ),
        },
        {
          label: "Surface 2",
          element: (
            <div className="w-56 h-6 flex items-center justify-center rounded-[var(--radius-md)] bg-surface-2">
              Surface 2
            </div>
          ),
        },
        {
          label: "Ring Subtle",
          element: (
            <div className="w-56 h-6 flex items-center justify-center rounded-[var(--radius-md)] ring-1 ring-ring/5">
              Ring 5%
            </div>
          ),
        },
        {
          label: "Progress",
          element: (
            <div className="w-56">
              <Progress value={50} />
            </div>
          ),
        },
        {
          label: "GlitchProgress",
          element: (
            <GlitchProgress
              current={3}
              total={5}
              showPercentage
              className="w-56 flex items-center gap-[var(--space-3)]"
              trackClassName="flex-1"
              percentageClassName="w-12 text-right"
            />
          ),
        },
        {
          label: "Spinner",
          element: (
            <div className="w-56 flex justify-center">
              <Spinner />
            </div>
          ),
        },
        {
          label: "NeonIcon",
          element: (
            <div className="w-56 flex justify-center">
              <NeonIcon icon={Star} on={true} />
            </div>
          ),
        },
        {
          label: "Card",
          element: (
            <Card className="w-56 h-8 flex items-center justify-center">Card content</Card>
          ),
        },
        {
          label: "PageShell",
          element: (
            <PageShell
              grid
              className="rounded-card border border-border/40 bg-surface/60 py-[var(--space-6)]"
              contentClassName="items-start"
            >
              <div className="col-span-full text-label font-semibold tracking-[0.02em] text-muted-foreground md:col-span-7">
                PageShell
              </div>
              <p className="col-span-full text-ui text-muted-foreground md:col-span-7">
                Constrains page content to the shell width.
              </p>
              <div className="col-span-full flex flex-wrap justify-end gap-[var(--space-2)] md:col-span-5 md:justify-self-end">
                <Button size="sm">Primary</Button>
                <Button size="sm" variant="ghost">
                  Ghost
                </Button>
              </div>
            </PageShell>
          ),
          className: "sm:col-span-2 md:col-span-12 w-full",
        },
        {
          label: "TitleBar",
          element: (
            <div className="w-56">
              <TitleBar label="Navigation" />
            </div>
          ),
        },
        {
          label: "Banner",
          element: (
            <div className="w-56">
              <Banner title="Banner" actions={<Button size="sm">Action</Button>} />
            </div>
          ),
        },
        {
          label: "BrandWordmark",
          element: (
            <div className="w-56 flex justify-center">
              <BrandWordmark />
            </div>
          ),
        },
        { label: "NavBar", element: <NavBar /> },
        {
          label: "ReviewListItem",
          element: (
            <div className="w-56">
              <ReviewListItem review={demoReview} />
            </div>
          ),
        },
        {
          label: "ReviewListItem Loading",
          element: (
            <div className="w-56">
              <ReviewListItem loading />
            </div>
          ),
        },
        {
          label: "VirtualizedList",
          element: <VirtualizedListDemo />,
          className: "sm:col-span-2 md:col-span-6",
        },
        {
          label: "ReviewSurface",
          element: (
            <div className="w-56">
              <ReviewSurface padding="md" tone="muted">
                <div className="text-ui text-foreground/70">Surface content</div>
              </ReviewSurface>
            </div>
          ),
        },
        {
          label: "ReviewSliderTrack",
          element: (
            <div className="w-56">
              <ReviewSurface padding="inline" className="relative h-[var(--control-h-lg)]">
                <ReviewSliderTrack value={7} tone="score" variant="display" />
              </ReviewSurface>
            </div>
          ),
        },
        {
          label: "ScoreMeter",
          element: (
            <div className="w-56">
              <ScoreMeter label="Score" value={8} detail={<span>Great positioning</span>} />
            </div>
          ),
        },
        {
          label: "ReviewPanel",
          element: <ReviewPanel>Content</ReviewPanel>,
          className: "sm:col-span-2 md:col-span-12 w-full",
        },
        {
          label: "Review Layout",
          element: (
            <div className="grid w-full gap-[var(--space-4)] md:grid-cols-12">
              <div className="md:col-span-4 md:w-60 bg-panel h-10 rounded-[var(--radius-md)]" />
              <div className="md:col-span-8 bg-muted h-10 rounded-[var(--radius-md)]" />
            </div>
          ),
          className: "sm:col-span-2 md:col-span-12 w-full",
        },
        {
          label: "Snackbar",
          element: (
            <div className="w-56 flex justify-center">
              <Snackbar message="Saved" actionLabel="Undo" onAction={() => {}} />
            </div>
          ),
        },
        { label: "Title Ghost", element: <h2 className="title-ghost">Ghost Title</h2> },
        { label: "Title Glow", element: <h2 className="title-glow">Glowing Title</h2> },
        {
          label: "Glitch Text",
          element: (
            <div className="glitch text-title font-semibold tracking-[-0.01em]">Glitch</div>
          ),
        },
        {
          label: "Aurora Background",
          element: (
            <div className="glitch-root bg-aurora-layers bg-noise w-56 h-24 rounded-[var(--radius-md)] flex items-center justify-center">
              Backdrop
            </div>
          ),
        },
        {
          label: "Noir Background",
          element: (
            <div
              className="w-56 h-24 rounded-[var(--radius-md)] flex items-center justify-center"
              style={{
                backgroundColor: "hsl(var(--noir-background))",
                color: "hsl(var(--noir-foreground))",
                border: "1px solid hsl(var(--noir-border))",
              }}
            >
              Noir
            </div>
          ),
        },
        {
          label: "Hardstuck Background",
          element: (
            <div
              className="w-56 h-24 rounded-[var(--radius-md)] flex items-center justify-center"
              style={{
                backgroundColor: "hsl(var(--hardstuck-background))",
                color: "hsl(var(--hardstuck-foreground))",
                border: "1px solid hsl(var(--hardstuck-border))",
              }}
            >
              Hardstuck
            </div>
          ),
        },
        {
          label: "Header",
          element: (
            <div className="w-56">
              <Header
                heading="Header"
                eyebrow="Eyebrow"
                subtitle="Subtitle"
                sticky={false}
                icon={<Star className="opacity-80" />}
                tabs={{
                  items: [
                    { key: "one", label: "One" },
                    { key: "two", label: "Two" },
                  ],
                  value: data.headerTabs.value,
                  onChange: data.headerTabs.onChange,
                  ariaLabel: "Gallery header tabs",
                }}
              />
            </div>
          ),
        },
        {
          label: "Hero",
          element: (
            <div className="w-56 space-y-[var(--space-4)]">
              <div className="space-y-[var(--space-2)]">
                <p className="text-label font-medium text-muted-foreground">Glitch (default)</p>
                <Hero
                  heading="Hero"
                  eyebrow="Eyebrow"
                  subtitle="Subtitle"
                  sticky={false}
                  topClassName="top-0"
                  subTabs={{
                    items: [
                      { key: "one", label: "One" },
                      { key: "two", label: "Two" },
                    ],
                    value: data.headerTabs.value,
                    onChange: data.headerTabs.onChange,
                    ariaLabel: "Gallery hero tabs",
                    linkPanels: false,
                  }}
                  search={{ value: "", onValueChange: () => {}, round: true }}
                  actions={<Button size="sm">Action</Button>}
                >
                  <div className="text-ui font-medium text-muted-foreground">Body</div>
                </Hero>
              </div>
              <div className="space-y-[var(--space-2)]">
                <p className="text-label font-medium text-muted-foreground">Glitch (subtle)</p>
                <Hero
                  heading="Hero"
                  eyebrow="Eyebrow"
                  subtitle="Subtitle"
                  sticky={false}
                  topClassName="top-0"
                  glitch="subtle"
                  subTabs={{
                    items: [
                      { key: "one", label: "One" },
                      { key: "two", label: "Two" },
                    ],
                    value: data.headerTabs.value,
                    onChange: data.headerTabs.onChange,
                    ariaLabel: "Gallery hero tabs (subtle)",
                    linkPanels: false,
                  }}
                  search={{ value: "", onValueChange: () => {}, round: true }}
                  actions={
                    <Button size="sm" variant="secondary">
                      Calm action
                    </Button>
                  }
                >
                  <div className="text-ui font-medium text-muted-foreground">Body</div>
                </Hero>
              </div>
              <NeomorphicHeroFrame
                variant="dense"
                align="end"
                label="Hero frame demo"
                slots={{
                  search: {
                    node: (
                      <SearchBar
                        value={data.searchBar.value}
                        onValueChange={data.searchBar.onValueChange}
                        placeholder="Search layout patterns…"
                        aria-label="Search layout patterns"
                        className="w-full"
                      />
                    ),
                    label: "Search layout patterns",
                  },
                  actions: {
                    node: (
                      <Button size="sm" variant="secondary" className="whitespace-nowrap">
                        Assign scout
                      </Button>
                    ),
                    label: "Layout quick actions",
                  },
                }}
              >
                <Hero
                  heading="Frame-ready"
                  eyebrow="No padding"
                  subtitle="Outer shell provides spacing"
                  sticky={false}
                  topClassName="top-0"
                  tone="supportive"
                  frame={false}
                  rail={false}
                  padding="none"
                >
                  <HeroGrid variant="dense">
                    <HeroCol span={7} className="space-y-[var(--space-2)] text-ui text-muted-foreground">
                      <p className="font-semibold text-foreground">Flush to the frame</p>
                      <p>
                        Dense spacing trims the padding while the slot row keeps search and quick actions aligned with the hero copy.
                      </p>
                    </HeroCol>
                    <HeroCol span={5} className="space-y-[var(--space-2)] text-label text-muted-foreground">
                      <div className="rounded-card r-card-md border border-border/25 bg-card/60 px-[var(--space-3)] py-[var(--space-2)]">
                        <span className="font-semibold text-foreground">Slot order</span>
                        <div>Tabs → Search → Actions</div>
                      </div>
                      <div className="rounded-card r-card-md border border-border/25 bg-card/60 px-[var(--space-3)] py-[var(--space-2)]">
                        <span className="font-semibold text-foreground">Grid helpers</span>
                        <div>HeroGrid + HeroCol</div>
                      </div>
                    </HeroCol>
                  </HeroGrid>
                </Hero>
              </NeomorphicHeroFrame>
            </div>
          ),
        },
        {
          label: "Header + Hero",
          element: (
            <div className="w-56 h-56 overflow-auto space-y-[var(--space-6)]">
              <Header heading="Stacked" icon={<Star className="opacity-80" />} />
              <Hero heading="Stacked" topClassName="top-[var(--header-stack)]" />
              <div className="h-96" />
            </div>
          ),
        },
        {
          label: "Card Neo",
          element: (
            <NeoCard className="w-56 flex items-center justify-center text-center">Card Neo</NeoCard>
          ),
        },
        {
          label: "Save Status",
          element: (
            <div className="w-56">
              <div className="text-label font-medium tracking-[0.02em] text-muted-foreground" aria-live="polite">
                All changes saved
              </div>
            </div>
          ),
        },
        {
          label: "Muted Text",
          element: (
            <p className="w-56 text-ui font-medium text-muted-foreground text-center">
              Example of muted foreground text
            </p>
          ),
        },
        {
          label: "Badge Tones",
          element: (
            <div className="w-56 flex justify-center gap-[var(--space-2)]">
              <Badge tone="neutral">Neutral</Badge>
              <Badge tone="accent">Accent</Badge>
              <Badge tone="primary">Primary</Badge>
            </div>
          ),
        },
        {
          label: "Badge Sizes",
          element: (
            <div className="w-56 flex flex-wrap justify-center gap-[var(--space-2)]">
              <Badge size="sm">SM</Badge>
              <Badge size="md">MD</Badge>
              <Badge size="lg">LG</Badge>
              <Badge size="xl">XL</Badge>
            </div>
          ),
        },
        {
          label: "Class Merge",
          element: (
            <div
              className={cn(
                "w-56 h-8 flex items-center justify-center text-danger-foreground bg-danger",
                "bg-accent-2",
              )}
            >
              Accent wins
            </div>
          ),
        },
        {
          label: "Grid Auto Rows",
          element: (
            <div className="w-56 grid grid-cols-2 gap-[var(--space-2)] [grid-auto-rows:minmax(0,1fr)]">
              <div className="card-neo p-[var(--space-2)]">A</div>
              <div className="card-neo p-[var(--space-4)]">B with more content</div>
              <div className="card-neo p-[var(--space-4)]">C</div>
              <div className="card-neo p-[var(--space-2)]">D</div>
            </div>
          ),
        },
        {
          label: "Widths",
          element: (
            <div className="flex gap-[var(--space-2)]">
              <div className="h-10 w-72 border rounded-[var(--radius-md)] flex items-center justify-center text-label font-medium tracking-[0.02em] text-muted-foreground">
                w-72
              </div>
              <div className="h-10 w-80 border rounded-[var(--radius-md)] flex items-center justify-center text-label font-medium tracking-[0.02em] text-muted-foreground">
                w-80
              </div>
            </div>
          ),
          className: "sm:col-span-2 md:col-span-12",
        },
      ],
    [data.headerTabs.value, data.headerTabs.onChange, data.searchBar.value, data.searchBar.onValueChange],
  );

  return (
    <div className={GRID_CLASS}>
      {items.map((item) => (
        <GalleryItem
          key={item.label}
          label={item.label}
          className={cn("md:col-span-4", item.className)}
        >
          {item.element}
        </GalleryItem>
      ))}
    </div>
  );
}
