import type { Metadata } from "next";
import type { Review } from "@/lib/types";
import {
  Button,
  SectionCard,
  TitleBar,
  TabBar,
  ThemeToggle,
  Progress,
  Hero,
  IconButton,
  Input,
  Textarea,
  Badge,
  Pill,
  SearchBar,
  GlitchSegmentedGroup,
  GlitchSegmentedButton,
  CheckCircle,
  NeonIcon,
  Toggle,
  AnimatedSelect,
} from "@/components/ui";
import ReviewList from "@/components/reviews/ReviewList";
import "@/styles/glitch.css";
import { Plus, Sun } from "lucide-react";

export const metadata: Metadata = { title: "Prompts · 13 League Review" };

export default function Page() {
  const tabs = [
    { key: "one", label: "One" },
    { key: "two", label: "Two" },
    { key: "three", label: "Three" },
  ];

  const selectItems = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
  ];

  const sampleReviews: Review[] = [
    {
      id: "1",
      title: "First Review",
      notes: "Sample notes",
      score: 9,
      result: "Win",
      tags: ["W"],
      pillars: [],
      createdAt: Date.now(),
    },
    {
      id: "2",
      title: "",
      notes: "Needs work",
      score: 7,
      result: "Loss",
      tags: [],
      pillars: [],
      createdAt: Date.now() - 86400000,
    },
  ];

  return (
    <main className="p-6 bg-background text-foreground">
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
          <TabBar items={tabs} className="w-56" />
        </div>
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium">Progress</span>
          <div className="w-56">
            <Progress value={50} />
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
          <span className="text-sm font-medium">Glitch Layer</span>
          <div className="relative w-56 h-24 rounded-md border bg-card/60 scanlines noise jitter" />
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
          </div>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium">Textarea</span>
          <Textarea placeholder="Textarea" className="w-56" />
        </div>
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium">Badge</span>
          <div className="w-56 flex justify-center gap-2">
            <Badge variant="neo" size="sm">9/10</Badge>
            <Badge variant="tag" size="sm">W</Badge>
          </div>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium">Pill</span>
          <div className="w-56 flex justify-center">
            <Pill>Default</Pill>
          </div>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium">Search Bar</span>
          <div className="w-56">
            <SearchBar value="" onValueChange={() => {}} />
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
          <span className="text-sm font-medium">Check Circle</span>
          <div className="w-56 flex justify-center gap-2">
            <CheckCircle checked={false} onChange={() => {}} />
            <CheckCircle checked onChange={() => {}} />
          </div>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium">Neon Icon</span>
          <NeonIcon icon={Sun} on />
        </div>
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium">Toggle</span>
          <Toggle value="Left" onChange={() => {}} />
        </div>
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium">Select</span>
          <div className="w-56">
            <AnimatedSelect
              items={selectItems}
              value="apple"
              onChange={() => {}}
            />
          </div>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium">Review List</span>
          <div className="w-72">
            <ReviewList
              reviews={sampleReviews}
              selectedId={null}
              onSelect={() => {}}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

