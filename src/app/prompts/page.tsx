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
  const [checked, setChecked] = React.useState(false);
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
    "glow-strong",
    "glow-soft",
  ];

  return (
    <main className="p-6 bg-background text-foreground">
      <TabBar items={tabs} value={tab} onValueChange={setTab} className="mb-6" />
      {tab === "components" ? (
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <section className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-purple-300">Buttons</span>
            <div className="flex gap-2">
              <Button size="sm">SM</Button>
              <Button size="md">MD</Button>
              <Button size="lg">LG</Button>
            </div>
          </section>

          <section className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-purple-300">Icon & Toggles</span>
            <div className="flex items-center gap-4">
              <IconButton size="sm">
                <SearchIcon />
              </IconButton>
              <CheckCircle checked={checked} onChange={setChecked} />
              <NeonIcon icon={Star} on />
            </div>
          </section>

          <section className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-purple-300">Inputs</span>
            <div className="w-full flex flex-col gap-2">
              <Input placeholder="Type here" />
              <Textarea placeholder="Write here" />
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
