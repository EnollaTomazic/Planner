"use client";

import * as React from "react";
import {
  Button,
  IconButton,
  Input,
  Textarea,
  Select,
  Badge,
  GlitchSegmentedGroup,
  GlitchSegmentedButton,
  TabBar,
  Progress,
  Spinner,
  ThemeToggle,
  AnimationToggle,
  SectionCard,
  TitleBar,
  Header,
  Hero,
  SearchBar,
  Snackbar,
  Card,
  CheckCircle,
  NeonIcon,
  Toggle,
  SideSelector,
  PillarBadge,
  PillarSelector,
  AnimatedSelect,
  FieldShell,
  Label,
} from "@/components/ui";
import BadgePrimitive from "@/components/ui/primitives/Badge";
import { GoalsTabs, type FilterKey } from "@/components/goals";
import PromptsHeader from "./PromptsHeader";
import PromptsComposePanel from "./PromptsComposePanel";
import PromptsDemos from "./PromptsDemos";
import ReviewPanel from "@/components/reviews/ReviewPanel";
import ReviewListItem from "@/components/reviews/ReviewListItem";
import Banner from "@/components/chrome/Banner";
import {
  DayCardHeader,
  ProjectList,
  TaskList,
  TaskRow,
  EmptyRow,
  DayRow,
  ScrollTopFloatingButton,
  PlannerProvider,
} from "@/components/planner";
import type { Pillar, Review } from "@/lib/types";
import type { GameSide } from "@/components/ui/league/SideSelector";
import { Search as SearchIcon, Star, Plus, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import GalleryItem from "./GalleryItem";

export default function ComponentGallery() {
  const [goalFilter, setGoalFilter] = React.useState<FilterKey>("All");
  const [query, setQuery] = React.useState("");
  const [seg, setSeg] = React.useState("one");
  const [checked, setChecked] = React.useState(false);
  const [toggleSide, setToggleSide] = React.useState<"Left" | "Right">("Left");
  const [side, setSide] = React.useState<GameSide>("Blue");
  const [pillars, setPillars] = React.useState<Pillar[]>([]);
  const [selectValue, setSelectValue] = React.useState<string | undefined>();

  const tabs = [
    { key: "one", label: "One" },
    { key: "two", label: "Two" },
    { key: "three", label: "Three" },
  ];

  const selectItems = [
    { value: "apple", label: "Apple" },
    { value: "orange", label: "Orange" },
    { value: "pear", label: "Pear" },
  ];

  const demoReview: Review = {
    id: "demo",
    title: "Demo Review",
    notes: "Quick note",
    tags: [],
    pillars: [],
    createdAt: Date.now(),
    score: 8,
    result: "Win",
  };

  const demoProjects = [
    { id: "p1", name: "Alpha", done: false, createdAt: Date.now() },
    { id: "p2", name: "Beta", done: true, createdAt: Date.now() },
  ];

  const demoTasks = [
    { id: "t1", text: "Task A", done: false, projectId: "p1" },
    { id: "t2", text: "Task B", done: true, projectId: "p1" },
  ];

  const componentItems = [
    { label: "Button", element: <Button className="w-56">Click me</Button> },
    {
      label: "IconButton",
      element: (
        <div className="flex gap-2">
          <IconButton
            variant="ring"
            size="md"
            aria-label="Search"
            title="Search"
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            variant="glow"
            size="md"
            aria-label="Search"
            title="Search"
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            variant="ring"
            size="xl"
            aria-label="Search"
            title="Search"
          >
            <SearchIcon />
          </IconButton>
        </div>
      ),
    },
    {
      label: "Input",
      element: <Input placeholder="Type here" className="w-56" />,
    },
    {
      label: "Textarea",
      element: <Textarea placeholder="Write here" className="w-56" />,
    },
    {
      label: "FieldShell",
      element: (
        <FieldShell className="w-56">
          <div className="px-4 py-2 text-sm text-muted-foreground">
            Custom content
          </div>
        </FieldShell>
      ),
    },
    {
      label: "Label",
      element: (
        <div className="w-56">
          <Label htmlFor="label-demo">Label</Label>
          <Input id="label-demo" placeholder="With spacing" />
        </div>
      ),
    },
    { label: "Badge", element: <Badge>Badge</Badge> },
    { label: "Badge Pill", element: <Badge variant="pill">Pill</Badge> },
    {
      label: "Accent Overlay Box",
      element: (
        <div className="w-56 h-6 flex items-center justify-center rounded bg-[var(--accent-overlay)] text-[hsl(var(--accent-foreground))]">
          Overlay
        </div>
      ),
    },
    {
      label: "Foreground Overlay Box",
      element: (
        <div className="w-56 h-6 flex items-center justify-center rounded border border-[hsl(var(--border)/0.1)] bg-[hsl(var(--foreground)/0.05)] text-[hsl(var(--foreground)/0.7)]">
          FG Overlay
        </div>
      ),
    },
    {
      label: "Surface",
      element: (
        <div className="w-56 h-6 flex items-center justify-center rounded bg-[hsl(var(--surface))]">
          Surface
        </div>
      ),
    },
    {
      label: "Surface 2",
      element: (
        <div className="w-56 h-6 flex items-center justify-center rounded bg-[hsl(var(--surface-2))]">
          Surface 2
        </div>
      ),
    },
    {
      label: "Ring Subtle",
      element: (
        <div className="w-56 h-6 flex items-center justify-center rounded ring-1 ring-[hsl(var(--ring)/0.05)]">
          Ring 5%
        </div>
      ),
    },
    {
      label: "SearchBar",
      element: (
        <SearchBar value={query} onValueChange={setQuery} className="w-56" />
      ),
    },
    {
      label: "Segmented",
      element: (
        <GlitchSegmentedGroup value={seg} onChange={setSeg} className="w-56">
          <GlitchSegmentedButton value="one">One</GlitchSegmentedButton>
          <GlitchSegmentedButton value="two">Two</GlitchSegmentedButton>
          <GlitchSegmentedButton value="three">Three</GlitchSegmentedButton>
        </GlitchSegmentedGroup>
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
      label: "Spinner",
      element: (
        <div className="w-56 flex justify-center">
          <Spinner />
        </div>
      ),
    },
    {
      label: "ThemeToggle",
      element: (
        <div className="w-56 flex justify-center">
          <ThemeToggle />
        </div>
      ),
    },
    {
      label: "AnimationToggle",
      element: (
        <div className="w-56 flex justify-center">
          <AnimationToggle />
        </div>
      ),
    },
    {
      label: "CheckCircle",
      element: (
        <div className="w-56 flex justify-center">
          <CheckCircle checked={checked} onChange={setChecked} />
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
      label: "Toggle",
      element: (
        <Toggle value={toggleSide} onChange={setToggleSide} className="w-56" />
      ),
    },
    {
      label: "Card",
      element: (
        <Card className="w-56 h-8 flex items-center justify-center">
          Card content
        </Card>
      ),
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
    { label: "Tabs", element: <TabBar items={tabs} className="w-56" /> },
    {
      label: "SideSelector",
      element: (
        <SideSelector value={side} onChange={setSide} className="w-56" />
      ),
    },
    { label: "PillarBadge", element: <PillarBadge pillar="Wave" /> },
    {
      label: "PillarSelector",
      element: (
        <div className="w-56">
          <PillarSelector value={pillars} onChange={setPillars} />
        </div>
      ),
    },
    {
      label: "AnimatedSelect",
      element: (
        <AnimatedSelect
          items={selectItems}
          value={selectValue}
          onChange={setSelectValue}
          className="w-56"
          hideLabel
        />
      ),
    },
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
      label: "ReviewPanel",
      element: <ReviewPanel>Content</ReviewPanel>,
      className: "sm:col-span-2 md:col-span-3 w-full",
    },
    {
      label: "Review Layout",
      element: (
        <div className="grid w-full gap-4 md:grid-cols-12">
          <div className="md:col-span-4 md:w-[240px] bg-[hsl(var(--panel))] h-10 rounded" />
          <div className="md:col-span-8 bg-muted h-10 rounded" />
        </div>
      ),
      className: "sm:col-span-2 md:col-span-3 w-full",
    },
    {
      label: "Select",
      element: (
        <Select aria-label="Fruit" defaultValue="" className="w-56">
          <option value="" disabled hidden>
            Choose…
          </option>
          <option value="apple">Apple</option>
          <option value="orange">Orange</option>
          <option value="pear">Pear</option>
        </Select>
      ),
    },
    {
      label: "Goals Tabs",
      element: (
        <div className="w-56">
          <GoalsTabs value={goalFilter} onChange={setGoalFilter} />
        </div>
      ),
    },
    {
      label: "Snackbar",
      element: (
        <div className="w-56 flex justify-center">
          <Snackbar message="Saved" actionLabel="Undo" onAction={() => {}} />
        </div>
      ),
    },
    {
      label: "Title Ghost",
      element: <h2 className="title-ghost">Ghost Title</h2>,
    },
    {
      label: "Title Glow",
      element: <h2 className="title-glow">Glowing Title</h2>,
    },
    {
      label: "Glitch Text",
      element: <div className="glitch text-lg font-semibold">Glitch</div>,
    },
    {
      label: "Aurora Background",
      element: (
        <div className="glitch-root bg-aurora-layers bg-noise w-56 h-24 rounded-md flex items-center justify-center">
          Backdrop
        </div>
      ),
    },
    {
      label: "Noir Background",
      element: (
        <div
          className="w-56 h-24 rounded-md flex items-center justify-center"
          style={{
            backgroundColor: "hsl(350 70% 4%)",
            color: "hsl(0 0% 92%)",
            border: "1px solid hsl(350 40% 22%)",
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
          className="w-56 h-24 rounded-md flex items-center justify-center"
          style={{
            backgroundColor: "hsl(165 60% 3%)",
            color: "hsl(160 12% 95%)",
            border: "1px solid hsl(165 40% 22%)",
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
          />
        </div>
      ),
    },
    {
      label: "Hero",
      element: (
        <div className="w-56">
          <Hero
            heading="Hero"
            eyebrow="Eyebrow"
            subtitle="Subtitle"
            sticky={false}
            search={{ value: "", onValueChange: () => {}, round: true }}
          >
            <div className="text-sm text-muted-foreground">Body</div>
          </Hero>
        </div>
      ),
    },
    {
      label: "Header + Hero",
      element: (
        <div className="w-56 h-56 overflow-auto space-y-6">
          <Header heading="Stacked" />
          <Hero heading="Stacked" topClassName="top-24" />
          <div className="h-96" />
        </div>
      ),
    },
    {
      label: "Card Neo",
      element: (
        <div className="card-neo w-56 h-8 flex items-center justify-center">
          Card Neo
        </div>
      ),
    },
    {
      label: "Icon Button",
      element: (
        <div className="w-56 flex justify-center gap-2">
          <IconButton aria-label="Add" title="Add">
            <Plus />
          </IconButton>
          <IconButton size="lg" aria-label="Toggle theme" title="Toggle theme">
            <Sun />
          </IconButton>
          <IconButton size="xl" aria-label="Search" title="Search">
            <SearchIcon />
          </IconButton>
        </div>
      ),
    },
    {
      label: "Input Variants",
      element: (
        <div className="w-56 space-y-2">
          <Input height="sm" placeholder="Small" />
          <Input placeholder="Medium" />
          <Input height="lg" placeholder="Large" />
          <Input height={12} placeholder="h-12" />
          <Input tone="pill" placeholder="Pill" />
          <Input placeholder="With icon" hasEndSlot>
            <Plus className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          </Input>
        </div>
      ),
      className: "sm:col-span-2 md:col-span-3",
    },
    {
      label: "Select Variants",
      element: (
        <div className="w-56 space-y-2">
          <Select defaultValue="">
            <option value="" disabled hidden>
              Choose…
            </option>
            <option value="a">A</option>
            <option value="b">B</option>
          </Select>
          <Select success defaultValue="">
            <option value="" disabled hidden>
              Choose…
            </option>
            <option value="a">A</option>
          </Select>
        </div>
      ),
      className: "sm:col-span-2 md:col-span-3",
    },
    {
      label: "Textarea Variants",
      element: (
        <div className="w-56 space-y-2">
          <Textarea placeholder="Default" />
          <Textarea tone="pill" placeholder="Pill" />
        </div>
      ),
    },
    {
      label: "Save Status",
      element: (
        <div className="w-56">
          <div className="text-xs text-muted-foreground" aria-live="polite">
            All changes saved
          </div>
        </div>
      ),
    },
    {
      label: "Muted Text",
      element: (
        <p className="w-56 text-sm text-muted-foreground text-center">
          Example of muted foreground text
        </p>
      ),
    },
    {
      label: "Badge Variants",
      element: (
        <div className="w-56 flex justify-center gap-2">
          <Badge>Neutral</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="pill">Pill</Badge>
        </div>
      ),
    },
    {
      label: "Badge Primitive",
      element: (
        <div className="w-56 flex justify-center gap-2">
          <BadgePrimitive size="xs">XS</BadgePrimitive>
          <BadgePrimitive size="sm">SM</BadgePrimitive>
        </div>
      ),
    },
    {
      label: "Class Merge",
      element: (
        <div
          className={cn(
            "w-56 h-8 flex items-center justify-center text-foreground bg-danger",
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
        <div className="w-56 grid grid-cols-2 gap-2 [grid-auto-rows:minmax(0,1fr)]">
          <div className="card-neo p-2">A</div>
          <div className="card-neo p-4">B with more content</div>
          <div className="card-neo p-4">C</div>
          <div className="card-neo p-2">D</div>
        </div>
      ),
    },
    {
      label: "Widths",
      element: (
        <div className="flex gap-2">
          <div className="h-10 w-72 border rounded-md flex items-center justify-center text-xs text-muted-foreground">
            w-72
          </div>
          <div className="h-10 w-80 border rounded-md flex items-center justify-center text-xs text-muted-foreground">
            w-80
          </div>
        </div>
      ),
      className: "sm:col-span-2 md:col-span-3",
    },
    {
      label: "Prompts Header",
      element: (
        <SectionCard className="w-full">
          <SectionCard.Header sticky topClassName="top-8">
            <PromptsHeader
              count={0}
              query=""
              onQueryChange={() => {}}
              onSave={() => {}}
              disabled
            />
          </SectionCard.Header>
          <SectionCard.Body />
        </SectionCard>
      ),
      className: "sm:col-span-2 md:col-span-3 w-full",
    },
    {
      label: "Prompts Compose",
      element: (
        <div className="w-full max-w-md">
          <PromptsComposePanel
            title=""
            onTitleChange={() => {}}
            text=""
            onTextChange={() => {}}
          />
        </div>
      ),
      className: "sm:col-span-2 md:col-span-3 w-full",
    },
    {
      label: "Prompts Demos",
      element: (
        <div className="w-full">
          <PromptsDemos />
        </div>
      ),
      className: "sm:col-span-2 md:col-span-3 w-full",
    },
    {
      label: "DayCardHeader",
      element: (
        <DayCardHeader
          iso="2024-01-01"
          projectCount={2}
          doneTasks={1}
          totalTasks={3}
        />
      ),
    },
    { label: "EmptyRow", element: <EmptyRow text="Nothing here" /> },
    {
      label: "TaskRow",
      element: (
        <ul className="w-64">
          <TaskRow
            task={{ id: "t1", text: "Sample", done: false }}
            onToggle={() => {}}
            onDelete={() => {}}
            onEdit={() => {}}
            onSelect={() => {}}
          />
        </ul>
      ),
    },
    {
      label: "ProjectList",
      element: (
        <ProjectList
          projects={demoProjects}
          selectedProjectId=""
          setSelectedProjectId={() => {}}
          setSelectedTaskId={() => {}}
          toggleProject={() => {}}
          renameProject={() => {}}
          deleteProject={() => {}}
        />
      ),
      className: "sm:col-span-2 md:col-span-3",
    },
    {
      label: "TaskList",
      element: (
        <TaskList
          tasks={demoTasks}
          selectedProjectId="p1"
          addTask={() => ""}
          renameTask={() => {}}
          toggleTask={() => {}}
          deleteTask={() => {}}
          setSelectedTaskId={() => {}}
        />
      ),
      className: "sm:col-span-2 md:col-span-3",
    },
    {
      label: "DayRow",
      element: (
        <PlannerProvider>
          <DayRow iso="2024-01-01" isToday={false} />
        </PlannerProvider>
      ),
      className: "sm:col-span-2 md:col-span-3 w-full",
    },
    {
      label: "ScrollTopFloatingButton",
      element: (
        <ScrollTopFloatingButton
          watchRef={React.createRef<HTMLElement>()}
          forceVisible
        />
      ),
    },
  ];

  return (
    <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
      {componentItems.map((item, idx) => (
        <GalleryItem key={idx} label={item.label} className={item.className}>
          {item.element}
        </GalleryItem>
      ))}
    </div>
  );
}

