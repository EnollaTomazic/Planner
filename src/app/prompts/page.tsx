"use client";

import * as React from "react";
import {
  Button,
  IconButton,
  Input,
  Textarea,
  Badge,
  GlitchSegmentedGroup,
  GlitchSegmentedButton,
  TabBar,
  Progress,
  Spinner,
  ThemeToggle,
  SectionCard,
  TitleBar,
  Hero,
  SearchBar,
} from "@/components/ui";
import { Plus, Sun } from "lucide-react";
import GoalsTabs, { FilterKey } from "@/components/goals/GoalsTabs";

export default function Page() {
  const viewTabs = [
    { key: "components", label: "Components" },
    { key: "colors", label: "Colors" },
  ];

  const demoTabs = [
    { key: "one", label: "One" },
    { key: "two", label: "Two" },
    { key: "three", label: "Three" },
  ];

  const colorList = [
    "background",
    "foreground",
    "card",
    "border",
    "input",
    "ring",
    "accent",
    "accent-2",
    "muted",
    "muted-foreground",
    "danger",
    "success",
    "glow-strong",
    "glow-soft",
  ];

  const [view, setView] = React.useState("components");
  const [goalFilter, setGoalFilter] = React.useState<FilterKey>("All");

  return (
    <main className="page-shell py-6 bg-background text-foreground">
      <div className="mb-8">
        <TabBar items={viewTabs} value={view} onValueChange={setView} />
      </div>
      {view === "components" ? (
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Button Variants</span>
            <div className="w-56 flex justify-center gap-2">
              <Button>Secondary</Button>
              <Button variant="primary">Primary</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Button Sizes</span>
            <div className="w-56 flex justify-center gap-2">
              <Button size="sm">SM</Button>
              <Button size="md">MD</Button>
              <Button size="lg">LG</Button>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Card</span>
            <SectionCard className="w-56 h-40 flex items-center justify-center">
              Card content
            </SectionCard>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Navbar</span>
            <div className="w-56">
              <TitleBar label="Navigation" />
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Tabs</span>
            <TabBar items={demoTabs} className="w-56" />
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Goals Tabs</span>
            <div className="w-56">
              <GoalsTabs value={goalFilter} onChange={setGoalFilter} />
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Progress</span>
            <div className="w-56">
              <Progress value={50} />
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Spinner</span>
            <div className="w-56 flex justify-center">
              <Spinner />
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Theme</span>
            <div className="w-56 flex justify-center">
              <ThemeToggle />
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Title Ghost</span>
            <h2 className="title-ghost">Ghost Title</h2>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Title Glow</span>
            <h2 className="title-glow">Glowing Title</h2>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Glitch Text</span>
            <div className="glitch text-lg font-semibold">Glitch</div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Glitch Background</span>
            <div className="glitch-root bg-glitch-layers bg-noise w-56 h-24 rounded-md flex items-center justify-center">
              Backdrop
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Hero</span>
            <div className="w-56">
              <Hero heading="Hero" eyebrow="Eyebrow" subtitle="Subtitle" sticky={false} />
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Card Neo</span>
            <div className="card-neo w-56 h-40 flex items-center justify-center">
              Card Neo
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Icon Button</span>
            <div className="w-56 flex justify-center gap-2">
              <IconButton>
                <Plus />
              </IconButton>
              <IconButton size="lg">
                <Sun />
              </IconButton>
            </div>
          </div>
            <div className="flex flex-col items-center space-y-2">
              <span className="text-sm font-medium">Input</span>
              <div className="w-56 space-y-2">
                <Input placeholder="Small" />
                <Input size="md" placeholder="Medium" />
                <Input size="lg" placeholder="Large" />
                <Input tone="pill" placeholder="Pill" />
                <Input placeholder="With icon" hasEndSlot>
                  <Plus className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                </Input>
              </div>
            </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Textarea</span>
            <div className="w-56 space-y-2">
              <Textarea placeholder="Default" />
              <Textarea tone="pill" placeholder="Pill" />
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Badge</span>
            <div className="w-56 flex justify-center gap-2">
              <Badge>Neutral</Badge>
              <Badge variant="accent">Accent</Badge>
              <Badge variant="pill">Pill</Badge>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Search Bar</span>
            <div className="w-56">
              <SearchBar value="" onValueChange={() => {}} onSubmit={() => {}} />
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Segmented</span>
            <GlitchSegmentedGroup
              value="a"
              onChange={() => {}}
              className="w-56"
            >
              <GlitchSegmentedButton value="a">A</GlitchSegmentedButton>
              <GlitchSegmentedButton value="b">B</GlitchSegmentedButton>
              <GlitchSegmentedButton value="c">C</GlitchSegmentedButton>
            </GlitchSegmentedGroup>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Widths</span>
            <div className="flex gap-2">
              <div className="h-10 w-72 border rounded-md flex items-center justify-center text-xs text-muted-foreground">
                w-72
              </div>
              <div className="h-10 w-80 border rounded-md flex items-center justify-center text-xs text-muted-foreground">
                w-80
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {colorList.map((c) => (
            <div key={c} className="flex flex-col items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-purple-300">
                {c}
              </span>
              <div
                className="w-24 h-16 rounded-md border"
                style={{ backgroundColor: `hsl(var(--${c}))` }}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

