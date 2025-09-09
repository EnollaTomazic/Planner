// src/components/team/Builder.tsx
"use client";
import "./style.css";

/**
 * Builder — Allies vs Enemies with a center divider
 * - Local storage via usePersistentState
 * - Icon-only actions with tooltips (Swap / Copy)
 * - Glitch-styled titles and subtle neon rail
 * - Center spine shows on md+ only
 */

import * as React from "react";
import Hero from "@/components/ui/layout/Hero";
import SectionCard from "@/components/ui/layout/SectionCard";
import Input from "@/components/ui/primitives/Input";
import Textarea from "@/components/ui/primitives/Textarea";
import IconButton from "@/components/ui/primitives/IconButton";
import {
  Shield,
  Swords,
  Shuffle,
  Clipboard,
  ClipboardCheck,
  Eraser,
  NotebookPen,
  Copy,
} from "lucide-react";
import { usePersistentState } from "@/lib/db";
import { copyText } from "@/lib/clipboard";

/* ───────────────── types & constants ───────────────── */

type Team = {
  top: string;
  jungle: string;
  mid: string;
  adc: string;
  support: string;
  notes?: string;
};
type TeamState = { allies: Team; enemies: Team };

const TEAM_KEY = "team_comp_v1";
const EMPTY_TEAM: Team = {
  top: "",
  jungle: "",
  mid: "",
  adc: "",
  support: "",
  notes: "",
};
const LANES: { key: keyof Team; label: string }[] = [
  { key: "top", label: "Top" },
  { key: "jungle", label: "Jungle" },
  { key: "mid", label: "Mid" },
  { key: "adc", label: "ADC" },
  { key: "support", label: "Support" },
];

/* ───────────────── helpers ───────────────── */

function teamToLines(t: Team) {
  return [
    `Top: ${t.top || "-"}`,
    `Jungle: ${t.jungle || "-"}`,
    `Mid: ${t.mid || "-"}`,
    `ADC: ${t.adc || "-"}`,
    `Support: ${t.support || "-"}`,
    ...(t.notes?.trim() ? ["", `Notes: ${t.notes.trim()}`] : []),
  ].join("\n");
}

function stringify(s: TeamState) {
  const left = teamToLines(s.allies);
  const right = teamToLines(s.enemies);
  return [
    "Allies",
    "------",
    left,
    "",
    "Enemies",
    "-------",
    right,
    "",
    "# 13 League Review · Team Builder",
  ].join("\n");
}

/* ───────────────── component ───────────────── */

export default function Builder() {
  const [state, setState] = usePersistentState<TeamState>(TEAM_KEY, {
    allies: { ...EMPTY_TEAM },
    enemies: { ...EMPTY_TEAM },
  });
  const [copied, setCopied] = React.useState<"all" | "allies" | "enemies" | null>(null);

  const filledCount = React.useMemo(() => {
    const countTeam = (t: Team) =>
      [t.top, t.jungle, t.mid, t.adc, t.support].filter(Boolean).length;
    return { allies: countTeam(state.allies), enemies: countTeam(state.enemies) };
  }, [state]);

  function setLane(side: "allies" | "enemies", lane: keyof Team, value: string) {
    setState({
      ...state,
      [side]: { ...state[side], [lane]: value },
    });
  }

  function setNotes(side: "allies" | "enemies", value: string) {
    setState({
      ...state,
      [side]: { ...state[side], notes: value },
    });
  }

  function clearSide(side: "allies" | "enemies") {
    setState({
      ...state,
      [side]: { ...EMPTY_TEAM },
    });
  }

  function swapSides() {
    setState({ allies: state.enemies, enemies: state.allies });
  }

  async function copy(selection: "all" | "allies" | "enemies") {
    const text =
      selection === "all"
        ? stringify(state)
        : stringify({
            allies: selection === "allies" ? state.allies : EMPTY_TEAM,
            enemies: selection === "enemies" ? state.enemies : EMPTY_TEAM,
          });

    await copyText(text);
    setCopied(selection);
    setTimeout(() => setCopied(null), 1300);
  }

  /* ─────────────── UI ─────────────── */

  return (
    <div data-scope="team" className="w-full">
      <Hero
        eyebrow="Comps"
        heading="Builder"
        subtitle="Fill allies vs enemies. Swap in one click."
        right={
          <div className="flex items-center gap-2">
            <IconButton
              title="Swap Allies ↔ Enemies"
              aria-label="Swap Allies and Enemies"
              onClick={swapSides}
              size="sm"
              iconSize="sm"
            >
              <Shuffle />
            </IconButton>
            <IconButton
              title="Copy both sides"
              aria-label="Copy both sides"
              onClick={() => copy("all")}
              size="sm"
              iconSize="sm"
            >
              {copied === "all" ? <ClipboardCheck /> : <Clipboard />}
            </IconButton>
          </div>
        }
      />
      <div className="mt-6">
        <SectionCard className="card-neo-soft glitch-card">
          <SectionCard.Body>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_12px_1fr] gap-6">
            {/* Allies */}
            <SideEditor
              title="Allies"
              icon={<Shield />}
              value={state.allies}
              onLane={(lane, v) => setLane("allies", lane, v)}
              onNotes={(v) => setNotes("allies", v)}
              onClear={() => clearSide("allies")}
              onCopy={() => copy("allies")}
              count={filledCount.allies}
            />

            {/* Center spine (md+) */}
            <div className="hidden md:block relative">
              <span
                aria-hidden
                className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-px bg-border"
              />
            </div>

            {/* Enemies */}
            <SideEditor
              title="Enemies"
              icon={<Swords />}
              value={state.enemies}
              onLane={(lane, v) => setLane("enemies", lane, v)}
              onNotes={(v) => setNotes("enemies", v)}
              onClear={() => clearSide("enemies")}
              onCopy={() => copy("enemies")}
              count={filledCount.enemies}
            />
          </div>
        </SectionCard.Body>
        </SectionCard>
      </div>
    </div>
  );
}

/* ───────────────── subcomponents ───────────────── */

function SideEditor(props: {
  title: string;
  icon: React.ReactNode;
  value: Team;
  onLane: (lane: keyof Team, v: string) => void;
  onNotes: (v: string) => void;
  onClear: () => void;
  onCopy: () => void;
  count: number;
}) {
  const { title, icon, value, onLane, onNotes, onClear, onCopy, count } = props;

  return (
    <div className="rounded-card p-4 glitch-card card-neo relative">
      {/* neon rail */}
      <span aria-hidden className="glitch-rail" />

      <header className="mb-3 flex items-center gap-2">
        {/* glitchy side title */}
        <span
          className="glitch-title glitch-flicker title-glow inline-flex items-center gap-2"
          data-text={title}
        >
          {icon}
          <strong className="text-base sm:text-lg">{title}</strong>
        </span>

        <span className="ml-auto pill pill-compact text-xs tracking-wide uppercase">
          {count}/5 filled
        </span>
      </header>

      <div className="grid gap-3">
        {LANES.map(({ key, label }) => (
          <div key={key} className="grid grid-cols-[88px_1fr] items-center gap-3">
            <label
              className="glitch-title glitch-flicker text-xs font-medium text-muted-foreground"
              data-text={label}
            >
              {label}
            </label>
            <Input
              aria-label={`${title} ${label}`}
              placeholder={`Enter ${label} champion`}
              value={value[key] as string}
              onChange={(e) => onLane(key, e.currentTarget.value)}
            />
          </div>
        ))}

        <div className="grid gap-3">
          <label className="text-xs text-muted-foreground inline-flex items-center gap-2">
            <NotebookPen className="opacity-80" /> Notes
          </label>
          <Textarea
            aria-label={`${title} notes`}
            placeholder="Short plan, spikes, target calls…"
            value={value.notes ?? ""}
            onChange={(e) => onNotes(e.currentTarget.value)}
            resize="resize-y"
            textareaClassName="min-h-[180px] leading-relaxed"
            rows={4}
          />
        </div>

        {/* side actions: icon-only, same behavior */}
        <div className="mt-1 flex items-center gap-2 justify-end">
          <IconButton
            title={`Clear ${title}`}
            aria-label={`Clear ${title}`}
            variant="ring"
            onClick={onClear}
            size="sm"
            iconSize="sm"
          >
            <Eraser />
          </IconButton>
          <IconButton
            title={`Copy ${title}`}
            aria-label={`Copy ${title}`}
            onClick={onCopy}
            size="sm"
            iconSize="sm"
          >
            <Copy />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
