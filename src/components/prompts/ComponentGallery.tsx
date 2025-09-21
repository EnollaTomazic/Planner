"use client";

import * as React from "react";
import {
  Button,
  Input,
  Textarea,
  Select,
  SettingsSelect,
  GlitchSegmentedGroup,
  GlitchSegmentedButton,
  TabBar,
  Progress,
  GlitchProgress,
  Spinner,
  ThemeToggle,
  AnimationToggle,
  SectionCard,
  TitleBar,
  Header,
  Hero,
  NeomorphicHeroFrame,
  HeroGrid,
  HeroCol,
  PageShell,
  SearchBar,
  Snackbar,
  Card,
  NeoCard,
  CheckCircle,
  NeonIcon,
  Toggle,
  SideSelector,
  PillarBadge,
  PillarSelector,
  Field,
  Label,
  Tabs,
  TabList,
  TabPanel,
  type TabItem,
} from "@/components/ui";
import Badge from "@/components/ui/primitives/Badge";
import SegmentedButton from "@/components/ui/primitives/SegmentedButton";
import { GoalsTabs, GoalsProgress, type FilterKey } from "@/components/goals";
import WelcomeHeroFigure from "@/components/home/WelcomeHeroFigure";
import PromptsHeader from "./PromptsHeader";
import PromptsComposePanel from "./PromptsComposePanel";
import PromptsDemos from "./PromptsDemos";
import {
  ReviewPanel,
  ReviewListItem,
  ReviewSurface,
  ReviewSliderTrack,
  ScoreMeter,
} from "@/components/reviews";
import Banner from "@/components/chrome/Banner";
import BrandWordmark from "@/components/chrome/BrandWordmark";
import NavBar from "@/components/chrome/NavBar";
import {
  DayCardHeader,
  ProjectList,
  TaskList,
  TaskRow,
  EmptyRow,
  DayRow,
  ScrollTopFloatingButton,
  PlannerProvider,
  PlannerListPanel,
} from "@/components/planner";
import type { Pillar, Review } from "@/lib/types";
import type { GameSide } from "@/components/ui/league/SideSelector";
import { Star, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import GalleryItem from "./GalleryItem";

const fieldStoryHref = "/storybook/?path=/story/primitives-field--state-gallery";
import IconButtonShowcase from "./IconButtonShowcase";

type View = "buttons" | "inputs" | "prompts" | "planner" | "misc";

const viewTabs: TabItem<View>[] = [
  { key: "buttons", label: "Buttons" },
  { key: "inputs", label: "Inputs" },
  { key: "prompts", label: "Prompts" },
  { key: "planner", label: "Planner" },
  { key: "misc", label: "Misc" },
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
  matchup: "Lux vs Ahri",
  role: "MID",
  score: 8,
  result: "Win",
};

const demoProjects = [
  { id: "p1", name: "Alpha", done: false, createdAt: Date.now() },
  { id: "p2", name: "Beta", done: true, createdAt: Date.now() },
  {
    id: "p3",
    name: "Gamma (disabled)",
    done: false,
    createdAt: Date.now(),
    disabled: true,
  },
  {
    id: "p4",
    name: "Delta (syncing)",
    done: false,
    createdAt: Date.now(),
    loading: true,
  },
];

const demoTasks = [
  {
    id: "t1",
    title: "Task A",
    done: false,
    projectId: "p1",
    createdAt: Date.now(),
    images: [],
  },
  {
    id: "t2",
    title: "Task B",
    done: true,
    projectId: "p1",
    createdAt: Date.now(),
    images: [],
  },
];

const demoTasksById = Object.fromEntries(
  demoTasks.map((task) => [task.id, task]),
);

const demoTasksByProject = demoTasks.reduce<Record<string, string[]>>(
  (acc, task) => {
    const projectId = task.projectId;
    if (projectId) {
      (acc[projectId] ??= []).push(task.id);
    }
    return acc;
  },
  {},
);

export default function ComponentGallery() {
  const [goalFilter, setGoalFilter] = React.useState<FilterKey>("All");
  const [query, setQuery] = React.useState("");
  const [seg, setSeg] = React.useState("one");
  const [appTab, setAppTab] = React.useState("reviews");
  const [filterTab, setFilterTab] = React.useState("all");
  const [checked, setChecked] = React.useState(false);
  const [toggleSide, setToggleSide] = React.useState<"Left" | "Right">("Left");
  const [side, setSide] = React.useState<GameSide>("Blue");
  const [pillars, setPillars] = React.useState<Pillar[]>([]);
  const [selectValue, setSelectValue] = React.useState<string | undefined>();
  const [nativeSelectValue, setNativeSelectValue] = React.useState("");
  const [defaultVariantSelectValue, setDefaultVariantSelectValue] =
    React.useState("");
  const [successVariantSelectValue, setSuccessVariantSelectValue] =
    React.useState("");
  const [view, setView] = React.useState<View>("buttons");
  const [headerTab, setHeaderTab] = React.useState("one");
  const [tactilePrimaryActive, setTactilePrimaryActive] = React.useState(false);
  const [tactileSecondaryActive, setTactileSecondaryActive] = React.useState(false);

  const labelDemoId = React.useId();

  const buttonItems = React.useMemo(
    () => [
      { label: "Button", element: <Button className="w-56">Click me</Button> },
      {
        label: "IconButton",
        element: <IconButtonShowcase />,
      },
      {
        label: "SegmentedButton",
        element: (
          <div className="w-56 flex gap-[var(--space-2)]">
            <SegmentedButton>Default</SegmentedButton>
            <SegmentedButton selected>Active</SegmentedButton>
            <SegmentedButton disabled>Disabled</SegmentedButton>
          </div>
        ),
      },
      {
        label: "GlitchSegmented",
        element: (
          <GlitchSegmentedGroup value={seg} onChange={setSeg} className="w-56">
            <GlitchSegmentedButton value="one">One</GlitchSegmentedButton>
            <GlitchSegmentedButton value="two">Two</GlitchSegmentedButton>
            <GlitchSegmentedButton value="three">Three</GlitchSegmentedButton>
          </GlitchSegmentedGroup>
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
        label: "Button (tactile toggle)",
        element: (
          <div className="w-56 flex flex-col gap-[var(--space-2)]">
            <Button
              size="sm"
              variant="primary"
              tactile
              aria-pressed={tactilePrimaryActive}
              onClick={() => setTactilePrimaryActive((prev) => !prev)}
            >
              {tactilePrimaryActive ? "Primary active" : "Primary idle"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              tone="accent"
              tactile
              aria-pressed={tactileSecondaryActive}
              onClick={() => setTactileSecondaryActive((prev) => !prev)}
            >
              {tactileSecondaryActive ? "Accent active" : "Accent idle"}
            </Button>
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
          <div className="w-56 flex justify-center gap-[var(--space-2)]">
            <CheckCircle checked={checked} onChange={setChecked} size="sm" />
            <CheckCircle checked={checked} onChange={setChecked} size="md" />
            <CheckCircle checked={checked} onChange={setChecked} size="lg" />
          </div>
        ),
      },
      {
        label: "Toggle",
        element: (
          <Toggle
            value={toggleSide}
            onChange={setToggleSide}
            className="w-56"
          />
        ),
      },
      {
        label: "TabBar (default)",
        element: (
          <TabBar
            items={[
              { key: "one", label: "One" },
              { key: "two", label: "Two" },
              { key: "three", label: "Three" },
            ]}
            className="w-56"
            ariaLabel="Sample tabs"
            linkPanels={false}
          />
        ),
      },
      {
        label: "Tabs primitive",
        element: (
          <Tabs defaultValue="chat" className="max-w-md">
            <TabList
              items={[
                { key: "chat", label: "Chat" },
                { key: "codex", label: "Codex" },
                { key: "notes", label: "Notes" },
              ]}
              ariaLabel="Tabs primitive demo"
              showBaseline
            />
            <TabPanel value="chat">
              <Card className="p-[var(--space-4)] text-ui">
                Compose prompts
              </Card>
            </TabPanel>
            <TabPanel value="codex">
              <Card className="p-[var(--space-4)] text-ui">
                Review checklists
              </Card>
            </TabPanel>
            <TabPanel value="notes">
              <Card className="p-[var(--space-4)] text-ui">
                Autosave notes
              </Card>
            </TabPanel>
          </Tabs>
        ),
      },
      {
        label: "TabBar (app nav)",
        element: (
          <TabBar
            items={[
              { key: "reviews", label: "Reviews" },
              { key: "planner", label: "Planner" },
              { key: "goals", label: "Goals" },
            ]}
            value={appTab}
            onValueChange={setAppTab}
            ariaLabel="Component gallery sections"
            className="w-56"
            linkPanels={false}
          />
        ),
      },
      {
        label: "TabBar (filters)",
        element: (
          <TabBar
            items={[
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "done", label: "Done" },
            ]}
            value={filterTab}
            onValueChange={setFilterTab}
            ariaLabel="Filter items"
            className="w-56"
            linkPanels={false}
          />
        ),
      },
      {
        label: "TabBar (glitch)",
        element: (
          <TabBar
            items={[
              { key: "overview", label: "Overview" },
              { key: "tasks", label: "Tasks" },
              { key: "notes", label: "Notes" },
            ]}
            defaultValue="tasks"
            variant="glitch"
            ariaLabel="Glitch demo tabs"
            linkPanels={false}
            renderItem={({ item, active, props, ref, disabled }) => {
              const { className: baseClassName, onClick, ...restProps } = props;
              const className = cn(
                "btn-like-segmented font-mono text-ui",
                baseClassName,
                active && "btn-glitch is-active",
                disabled && "pointer-events-none opacity-[var(--disabled)]",
              );
              const handleClick: React.MouseEventHandler<HTMLElement> = (event) => {
                onClick?.(event);
              };
              return (
                <button
                  type="button"
                  {...restProps}
                  ref={ref as React.Ref<HTMLButtonElement>}
                  className={className}
                  disabled={disabled}
                  onClick={(event) => {
                    if (disabled) {
                      event.preventDefault();
                      event.stopPropagation();
                      return;
                    }
                    handleClick(event);
                  }}
                >
                  <span className="relative z-10 truncate">{item.label}</span>
                  {active && (
                    <span className="pointer-events-none absolute left-[var(--space-2)] right-[var(--space-2)] -bottom-[var(--space-1)] h-px underline-gradient" />
                  )}
                </button>
              );
            }}
          />
        ),
      },
      {
        label: "SideSelector",
        element: (
          <SideSelector value={side} onChange={setSide} className="w-56" />
        ),
      },
    ],
    [
      seg,
      appTab,
      filterTab,
      checked,
      toggleSide,
      side,
      tactilePrimaryActive,
      tactileSecondaryActive,
    ],
  );

  const inputItems = React.useMemo(
    () => [
      {
        label: "Input",
        element: (
          <Input
            aria-label="Demo input"
            placeholder="Type here"
            className="w-56"
          />
        ),
      },
      {
        label: "Textarea",
        element: (
          <Textarea
            aria-label="Demo textarea"
            placeholder="Write here"
            className="w-56"
          />
        ),
      },
      {
        label: "Field",
        element: (
          <div className="w-56 space-y-[var(--space-2)]">
            <Field.Root>
              <Field.Input
                aria-label="Field input demo"
                placeholder="Primitive input"
              />
            </Field.Root>
            <a
              href={fieldStoryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-[var(--space-1)] text-label font-medium text-accent-foreground transition-colors duration-[var(--dur-quick)] ease-out hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
            >
              Explore Field states
            </a>
          </div>
        ),
      },
      {
        label: "Label",
        element: (
          <div className="w-56">
            <Label htmlFor={labelDemoId}>Label</Label>
            <Input id={labelDemoId} placeholder="With spacing" />
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
        label: "SearchBar (loading)",
        element: (
          <SearchBar
            value={query}
            onValueChange={setQuery}
            className="w-56"
            loading
          />
        ),
      },
      {
        label: "Select",
        element: (
          <Select
            variant="native"
            aria-label="Fruit"
            className="w-56"
            items={[
              { value: "", label: "Choose…" },
              { value: "apple", label: "Apple" },
              { value: "orange", label: "Orange" },
              { value: "pear", label: "Pear" },
            ]}
            value={nativeSelectValue}
            onChange={setNativeSelectValue}
          />
        ),
      },
      {
        label: "SettingsSelect",
        element: (
          <SettingsSelect
            ariaLabel="Theme"
            prefixLabel="Theme"
            items={selectItems}
            value={selectValue}
            onChange={setSelectValue}
            className="w-56"
          />
        ),
      },
      {
        label: "Select Variants",
        element: (
          <div className="w-56 space-y-[var(--space-2)]">
            <Select
              variant="native"
              items={[
                { value: "", label: "Choose…" },
                { value: "a", label: "A" },
                { value: "b", label: "B" },
              ]}
              value={defaultVariantSelectValue}
              onChange={setDefaultVariantSelectValue}
              aria-label="Default native select demo"
            />
            <Select
              variant="native"
              success
              items={[
                { value: "", label: "Choose…" },
                { value: "a", label: "A" },
              ]}
              value={successVariantSelectValue}
              onChange={setSuccessVariantSelectValue}
              aria-label="Success native select demo"
            />
          </div>
        ),
        className: "sm:col-span-2 md:col-span-12",
      },
      {
        label: "Textarea Variants",
        element: (
          <div className="w-56 space-y-[var(--space-2)]">
            <Textarea aria-label="Default textarea demo" placeholder="Default" />
          </div>
        ),
      },
      {
        label: "Input Variants",
        element: (
          <div className="w-56 space-y-[var(--space-2)]">
            <Input aria-label="Small input demo" height="sm" placeholder="Small" />
            <Input aria-label="Medium input demo" placeholder="Medium" />
            <Input aria-label="Large input demo" height="lg" placeholder="Large" />
            <Input aria-label="Tall input demo" height="xl" placeholder="Extra large" />
            <Input aria-label="Input with icon demo" placeholder="With icon" hasEndSlot>
              <Plus className="absolute right-[var(--space-3)] top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            </Input>
          </div>
        ),
        className: "sm:col-span-2 md:col-span-12",
      },
      {
        label: "AnimatedSelect",
        element: (
          <div className="w-56 space-y-[var(--space-2)]">
            <Select
              variant="animated"
              size="sm"
              items={selectItems}
              value={selectValue}
              onChange={setSelectValue}
              className="w-full"
              hideLabel
              placeholder="Small"
              ariaLabel="Small animated select demo"
            />
            <Select
              variant="animated"
              items={selectItems}
              value={selectValue}
              onChange={setSelectValue}
              className="w-full"
              hideLabel
              placeholder="Medium"
              ariaLabel="Medium animated select demo"
            />
            <Select
              variant="animated"
              size="lg"
              items={selectItems}
              value={selectValue}
              onChange={setSelectValue}
              className="w-full"
              hideLabel
              placeholder="Large"
              ariaLabel="Large animated select demo"
            />
          </div>
        ),
      },
    ],
    [
      query,
      nativeSelectValue,
      selectValue,
      defaultVariantSelectValue,
      successVariantSelectValue,
      labelDemoId,
    ],
  );

  const promptItems = React.useMemo(
    () => [
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
        label: "Prompts Header",
        element: (
          <SectionCard className="w-full">
            <SectionCard.Header sticky topClassName="top-[var(--space-8)]">
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
        className: "sm:col-span-2 md:col-span-12 w-full",
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
        className: "sm:col-span-2 md:col-span-12 w-full",
      },
      {
        label: "Prompts Demos",
        element: (
          <div className="w-full">
            <PromptsDemos />
          </div>
        ),
        className: "sm:col-span-2 md:col-span-12 w-full",
      },
      {
        label: "WelcomeHeroFigure",
        element: (
          <div className="w-full space-y-[var(--space-3)]">
            <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
              <div className="flex flex-col items-center gap-[var(--space-2)]">
                <span className="text-label font-medium text-muted-foreground">Default halo</span>
                <div className="w-full max-w-[calc(var(--space-8)*4)]">
                  <WelcomeHeroFigure />
                </div>
              </div>
              <div className="flex flex-col items-center gap-[var(--space-2)]">
                <span className="text-label font-medium text-muted-foreground">Toned-down halo</span>
                <div className="w-full max-w-[calc(var(--space-8)*4)]">
                  <WelcomeHeroFigure haloTone="subtle" showGlitchRail={false} />
                </div>
              </div>
            </div>
          </div>
        ),
        className: "sm:col-span-2 md:col-span-12 w-full",
      },
      {
        label: "Prompts Layout",
        element: (
          <div className="w-full">
            <div className="grid grid-cols-12 gap-[var(--space-6)]">
              <div className="col-span-12 lg:col-span-8 space-y-[var(--space-6)]">
                <SearchBar value="" onValueChange={() => {}} />
                <TabBar
                  items={[{ key: "demo", label: "Demo" }]}
                  value="demo"
                  onValueChange={() => {}}
                  ariaLabel="Demo tabs"
                  linkPanels={false}
                />
                <Card className="h-24" />
              </div>
            </div>
          </div>
        ),
        className: "sm:col-span-2 md:col-span-12 w-full",
      },
    ],
    [pillars],
  );

  const plannerItems = React.useMemo(
    () => [
      {
        label: "GoalsProgress",
        element: <GoalsProgress total={5} pct={60} maxWidth={200} />,
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
        label: "DayCardHeader",
        element: (
          <DayCardHeader
            iso="2024-01-01"
            projectCount={2}
            doneCount={1}
            totalCount={3}
          />
        ),
      },
      { label: "EmptyRow", element: <EmptyRow text="Nothing here" /> },
      {
        label: "TaskRow",
        element: (
          <ul className="w-64">
            <TaskRow
              task={{
                id: "t1",
                title: "Sample",
                done: false,
                createdAt: Date.now(),
                images: ["https://placekitten.com/100/100"],
              }}
              toggleTask={() => {}}
              deleteTask={() => {}}
              renameTask={() => {}}
              selectTask={() => {}}
              addImage={() => {}}
              removeImage={() => {}}
            />
          </ul>
        ),
      },
      {
        label: "PlannerListPanel",
        element: (
          <PlannerListPanel
            renderComposer={() => (
              <form
                className="w-full"
                onSubmit={(event) => {
                  event.preventDefault();
                }}
              >
                <Input className="w-full" placeholder="> add item…" aria-label="Add item" />
              </form>
            )}
            isEmpty={false}
            renderEmpty={() => <EmptyRow text="All caught up" />}
            renderList={() => (
              <ul className="space-y-[var(--space-2)]" aria-label="Demo items">
                {demoProjects.map((project) => (
                  <li key={project.id}>
                    <div className="rounded-card border border-border/40 bg-surface/60 px-[var(--space-4)] py-[var(--space-2)] text-label font-medium">
                      {project.name}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          />
        ),
        className: "sm:col-span-2 md:col-span-12",
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
            addProject={() => ""}
          />
        ),
        className: "sm:col-span-2 md:col-span-12",
      },
      {
        label: "TaskList",
        element: (
          <TaskList
            tasksById={demoTasksById}
            tasksByProject={demoTasksByProject}
            selectedProjectId="p1"
            addTask={() => ""}
            renameTask={() => {}}
            toggleTask={() => {}}
            deleteTask={() => {}}
            addTaskImage={() => {}}
            removeTaskImage={(id, url, index) => {
              void id;
              void url;
              void index;
            }}
            setSelectedTaskId={() => {}}
          />
        ),
        className: "sm:col-span-2 md:col-span-12",
      },
      {
        label: "DayRow",
        element: (
          <PlannerProvider>
            <DayRow iso="2024-01-01" isToday={false} />
          </PlannerProvider>
        ),
        className: "sm:col-span-2 md:col-span-12 w-full",
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
    ],
    [goalFilter],
  );

  const miscItems = React.useMemo(
    () => [
      { label: "Badge", element: <Badge tone="neutral">Badge</Badge> },
      { label: "Badge Accent", element: <Badge tone="accent">Accent</Badge> },
      {
        label: "Accent Overlay Box",
        element: (
          <div className="w-56 h-6 flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-overlay)] text-accent-foreground">
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
          <Card className="w-56 h-8 flex items-center justify-center">
            Card content
          </Card>
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
            <Banner
              title="Banner"
              actions={<Button size="sm">Action</Button>}
            />
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
            <ReviewSurface padding="inline" className="relative h-12">
              <ReviewSliderTrack value={7} tone="score" variant="display" />
            </ReviewSurface>
          </div>
        ),
      },
      {
        label: "ScoreMeter",
        element: (
          <div className="w-56">
            <ScoreMeter
              label="Score"
              value={8}
              detail={<span>Great positioning</span>}
            />
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
        element: (
          <div className="glitch text-title font-semibold tracking-[-0.01em]">
            Glitch
          </div>
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
                value: headerTab,
                onChange: setHeaderTab,
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
              <p className="text-label font-medium text-muted-foreground">
                Glitch (default)
              </p>
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
                  value: headerTab,
                  onChange: setHeaderTab,
                  ariaLabel: "Gallery hero tabs",
                  linkPanels: false,
                }}
                search={{ value: "", onValueChange: () => {}, round: true }}
                actions={<Button size="sm">Action</Button>}
              >
                <div className="text-ui font-medium text-muted-foreground">
                  Body
                </div>
              </Hero>
            </div>
            <div className="space-y-[var(--space-2)]">
              <p className="text-label font-medium text-muted-foreground">
                Glitch (subtle)
              </p>
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
                  value: headerTab,
                  onChange: setHeaderTab,
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
                <div className="text-ui font-medium text-muted-foreground">
                  Body
                </div>
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
                      value={query}
                      onValueChange={setQuery}
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
                      Dense spacing trims the padding while the slot row keeps
                      search and quick actions aligned with the hero copy.
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
          <NeoCard className="w-56 flex items-center justify-center text-center">
            Card Neo
          </NeoCard>
        ),
      },
      {
        label: "Save Status",
        element: (
          <div className="w-56">
            <div
              className="text-label font-medium tracking-[0.02em] text-muted-foreground"
              aria-live="polite"
            >
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
    [headerTab, query],
  );

  const itemsMap: Record<
    View,
    { label: string; element: React.ReactNode; className?: string }[]
  > = {
    buttons: buttonItems,
    inputs: inputItems,
    prompts: promptItems,
    planner: plannerItems,
    misc: miscItems,
  };

  return (
    <div className="space-y-[var(--space-8)]">
      <TabBar
        items={viewTabs}
        value={view}
        onValueChange={setView}
        ariaLabel="Component gallery"
        linkPanels={false}
      />
      <div className="grid grid-cols-1 gap-[var(--space-6)] sm:grid-cols-2 md:grid-cols-12 md:gap-[var(--space-8)]">
        {itemsMap[view].map((item) => (
          <GalleryItem
            key={item.label}
            label={item.label}
            className={cn(
              "md:col-span-4",
              item.className,
            )}
          >
            {item.element}
          </GalleryItem>
        ))}
      </div>
    </div>
  );
}
