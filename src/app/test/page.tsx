"use client";
import * as React from "react";
import Hero from "@/components/ui/layout/Hero";
import Hero2 from "@/components/ui/layout/Hero2";
import SectionCard from "@/components/ui/layout/SectionCard";
import Split from "@/components/ui/layout/Split";
import TabBar from "@/components/ui/layout/TabBar";
import TitleBar from "@/components/ui/layout/TitleBar";
import SearchBar from "@/components/ui/primitives/searchbar";
import Button from "@/components/ui/primitives/button";
import Input from "@/components/ui/primitives/input";
import Textarea from "@/components/ui/primitives/textarea";
import Pill from "@/components/ui/primitives/pill";
import Badge from "@/components/ui/primitives/badge";
import Toggle from "@/components/ui/toggles/toggle";
import CheckCircle from "@/components/ui/toggles/CheckCircle";
import { NeonIcon } from "@/components/ui/toggles/NeonIcon";
import { Sun, Moon, Search } from "lucide-react";
import { useState } from "react";

// Icons
import {  Plus, Trash2, Star } from "lucide-react";

export default function TestPage() {
  const [search, setSearch] = React.useState("");
  const [tab, setTab] = React.useState("one");
  const [toggle, setToggle] = React.useState<"Left" | "Right">("Left");
  const [checked, setChecked] = React.useState(false);

  return (
    <main className="space-y-8 py-6">
      {/* TitleBar wants label (not title) */}
      <TitleBar label="Prototype Gallery" idText="ID:0x13LG" />

      {/* Hero wants heading/subtitle; it renders children below the bar */}
      <Hero
        eyebrow="Header"
        heading="Hero Example"
        subtitle="Lavender-Glitch style"
        right={<Button className="btn-cta">Action</Button>}
      >
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Sticky header with eyebrow + subtitle + right slot.
        </p>
      </Hero>

      {/* Hero2 lives under ui/layout and expects heading (not title) */}
      <Hero2 eyebrow="Alt" heading="Hero2 Card" subtitle="HUD header with neon divider" />

      {/* TabBar from ui/layout with items/value/onValueChange */}
      <SectionCard>
        <SectionCard.Header
          title="TabBar"
          actions={<span className="text-xs text-[hsl(var(--muted-foreground))]">sliding indicator</span>}
        />
        <SectionCard.Body>
          <TabBar
            items={[
              { key: "one", label: "First" },
              { key: "two", label: "Second" },
              { key: "three", label: "Third" },
            ]}
            value={tab}
            onValueChange={setTab}
          />
        </SectionCard.Body>
      </SectionCard>

      {/* Inputs & Search — SearchBar import path uses searchBar.tsx */}
      <SectionCard>
        <SectionCard.Header title="Inputs & Search" />
        <SectionCard.Body className="space-y-3">
          <SearchBar value={search} onValueChange={setSearch} placeholder="Search…" />
          <Input placeholder="Normal input" />
          <Textarea placeholder="Textarea here" />
        </SectionCard.Body>
      </SectionCard>

      {/* Buttons */}
      <SectionCard>
        <SectionCard.Header title="Buttons" />
        <SectionCard.Body className="flex flex-wrap gap-3">
          <Button className="btn-cta">Primary</Button>
          <Button>Secondary</Button>
        </SectionCard.Body>
      </SectionCard>

      {/* Pills & Badges */}
      <SectionCard>
        <SectionCard.Header title="Pills & Badges" />
        <SectionCard.Body className="flex flex-wrap gap-2">
          <Pill>Default Pill</Pill>
          <Badge>Default Badge</Badge>
          <Badge data-tone="primary">Primary</Badge>
          <Badge data-tone="accent">Accent</Badge>
        </SectionCard.Body>
      </SectionCard>

      {/* Neon + Toggles */}
      <SectionCard>
        <SectionCard.Header title="Neon & Toggles" />
        <SectionCard.Body className="flex flex-wrap items-center gap-6">
          <NeonIcon icon={Star} on={checked} title="Neon follows checked" />
          <Toggle value={toggle} onChange={setToggle} />
          <CheckCircle checked={checked} onChange={setChecked} />
        </SectionCard.Body>
      </SectionCard>

      {/* Split layout is in components/layout (not ui) */}
      <Split
        left={
          <SectionCard>
            <SectionCard.Header title="Left Split" />
            <SectionCard.Body>Left content</SectionCard.Body>
          </SectionCard>
        }
        right={
          <SectionCard>
            <SectionCard.Header title="Right Split" />
            <SectionCard.Body>Right content</SectionCard.Body>
          </SectionCard>
        }
      />
    </main>
  );
}