"use client";

import * as React from "react";
import {
  Button,
  Card,
  IconButton,
  Input,
  Textarea,
  Badge,
  GlitchSegmentedGroup,
  GlitchSegmentedButton,
  CheckCircle,
  NeonIcon,
  TabBar,
} from "@/components/ui";
import { Search as SearchIcon, Star } from "lucide-react";

export default function Page() {
  const [seg, setSeg] = React.useState("one");
  const [tab, setTab] = React.useState("components");
  const tabs = [
    { key: "components", label: "Components" },
    { key: "colors", label: "Colors" },
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
  ];

  return (
    <main className="p-6 bg-background text-foreground">
      <TabBar items={tabs} value={tab} onValueChange={setTab} className="mb-6" />
      {tab === "components" ? (
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <section className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-purple-300">Buttons</span>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button size="sm">SM</Button>
                <Button size="md">MD</Button>
                <Button size="lg">LG</Button>
              </div>
              <div className="flex gap-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>
          </section>

          <section className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-purple-300">Icon & Toggles</span>
            <div className="flex items-center gap-4">
              <IconButton variant="ring">
                <SearchIcon />
              </IconButton>
              <IconButton variant="solid" tone="accent">
                <SearchIcon />
              </IconButton>
              <IconButton variant="glow" tone="danger">
                <SearchIcon />
              </IconButton>
              <CheckCircle checked />
              <CheckCircle checked={false} />
              <NeonIcon icon={Star} on />
              <NeonIcon icon={Star} on={false} />
            </div>
          </section>

          <section className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-purple-300">Inputs</span>
            <div className="w-full flex flex-col gap-2">
              <Input placeholder="Default" />
              <Input placeholder="Error" aria-invalid />
              <Input placeholder="Pill" tone="pill" />
            </div>
          </section>

          <section className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-purple-300">Textareas</span>
            <div className="w-full flex flex-col gap-2">
              <Textarea placeholder="Default" />
              <Textarea placeholder="Pill" tone="pill" />
            </div>
          </section>

          <section className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-purple-300">Badge Variants</span>
            <div className="flex gap-2">
              <Badge variant="neutral">Neutral</Badge>
              <Badge variant="accent">Accent</Badge>
              <Badge variant="pill">Pill</Badge>
            </div>
          </section>

          <section className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-purple-300">Card</span>
            <Card className="w-full h-32 flex items-center justify-center">
              Card content
            </Card>
          </section>

          <section className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-purple-300">Segmented</span>
            <GlitchSegmentedGroup value={seg} onChange={setSeg} className="w-full">
              <GlitchSegmentedButton value="one">One</GlitchSegmentedButton>
              <GlitchSegmentedButton value="two">Two</GlitchSegmentedButton>
              <GlitchSegmentedButton value="three">Three</GlitchSegmentedButton>
            </GlitchSegmentedGroup>
          </section>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {colorList.map((c) => (
            <div key={c} className="flex flex-col items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-purple-300">{c}</span>
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
