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
import Input from "@/components/ui/primitives/Input";
import Textarea from "@/components/ui/primitives/Textarea";
import IconButton from "@/components/ui/primitives/IconButton";
import {
  Shield,
  Swords,
  Eraser,
  NotebookPen,
  Copy,
} from "lucide-react";
import { usePersistentState } from "@/lib/db";
import { copyText } from "@/lib/clipboard";

/* ───────────────── types & constants ───────────────── */

export type Team = {
  top: string;
  jungle: string;
  mid: string;
  bot: string;
  support: string;
  notes?: string;
};
export type TeamState = { allies: Team; enemies: Team };
export type LaneKey = Exclude<keyof Team, "notes">;
type Side = "allies" | "enemies";

export const TEAM_KEY = "team_comp_v1";
const EMPTY_TEAM: Team = {
  top: "",
  jungle: "",
  mid: "",
  bot: "",
  support: "",
  notes: "",
};
export const LANES: { key: LaneKey; label: string }[] = [
  { key: "top", label: "Top" },
  { key: "jungle", label: "Jungle" },
  { key: "mid", label: "Mid" },
  { key: "bot", label: "Bot" },
  { key: "support", label: "Support" },
];

export function createInitialTeamState(): TeamState {
  return {
    allies: { ...EMPTY_TEAM },
    enemies: { ...EMPTY_TEAM },
  };
}

export function useTeamBuilderState() {
  return usePersistentState<TeamState>(TEAM_KEY, createInitialTeamState());
}

/* ───────────────── helpers ───────────────── */

function teamToLines(t: Team) {
  return [
    `Top: ${t.top || "-"}`,
    `Jungle: ${t.jungle || "-"}`,
    `Mid: ${t.mid || "-"}`,
    `Bot: ${t.bot || "-"}`,
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

export type BuilderHandle = {
  swapSides: () => void;
  copyAll: () => void;
};

type BuilderProps = {
  editing?: boolean;
  state?: TeamState;
  onStateChange?: React.Dispatch<React.SetStateAction<TeamState>>;
};

export default React.forwardRef<BuilderHandle, BuilderProps>(
  function Builder({ editing, state: providedState, onStateChange }: BuilderProps, ref) {
    void editing;
    const [internalState, setInternalState] = useTeamBuilderState();
    const state = providedState ?? internalState;
    const setState = onStateChange ?? setInternalState;

    const filledCount = React.useMemo(() => {
      const countTeam = (t: Team) =>
        [t.top, t.jungle, t.mid, t.bot, t.support].filter((value) => {
          if (typeof value !== "string") {
            return false;
          }
          return value.trim().length > 0;
        }).length;
      return {
        allies: countTeam(state.allies),
        enemies: countTeam(state.enemies),
      };
    }, [state]);

    const setLane = React.useCallback(
      (side: Side, lane: LaneKey, value: string) => {
        const trimmedValue = value.trim();
        setState((prev) => ({
          ...prev,
          [side]: { ...prev[side], [lane]: trimmedValue },
        }));
      },
      [setState],
    );

    const setNotes = React.useCallback(
      (side: Side, value: string) => {
        setState((prev) => ({
          ...prev,
          [side]: { ...prev[side], notes: value },
        }));
      },
      [setState],
    );

    const clearSide = React.useCallback(
      (side: Side) => {
        setState((prev) => ({
          ...prev,
          [side]: { ...EMPTY_TEAM },
        }));
      },
      [setState],
    );

    const swapSides = React.useCallback(() => {
      setState((prev) => ({
        allies: { ...prev.enemies },
        enemies: { ...prev.allies },
      }));
    }, [setState]);

    const copy = React.useCallback(
      async (selection: "all" | "allies" | "enemies") => {
        const text =
          selection === "all"
            ? stringify(state)
            : stringify({
                allies: selection === "allies" ? state.allies : EMPTY_TEAM,
                enemies: selection === "enemies" ? state.enemies : EMPTY_TEAM,
              });

        await copyText(text);
      },
      [state],
    );

    const handleCopyAll = React.useCallback(() => {
      void copy("all");
    }, [copy]);

    const handleAlliesLane = React.useCallback(
      (lane: LaneKey, value: string) => {
        setLane("allies", lane, value);
      },
      [setLane],
    );

    const handleAlliesNotes = React.useCallback(
      (value: string) => {
        setNotes("allies", value);
      },
      [setNotes],
    );

    const handleAlliesClear = React.useCallback(() => {
      clearSide("allies");
    }, [clearSide]);

    const handleAlliesCopy = React.useCallback(() => {
      void copy("allies");
    }, [copy]);

    const handleEnemiesLane = React.useCallback(
      (lane: LaneKey, value: string) => {
        setLane("enemies", lane, value);
      },
      [setLane],
    );

    const handleEnemiesNotes = React.useCallback(
      (value: string) => {
        setNotes("enemies", value);
      },
      [setNotes],
    );

    const handleEnemiesClear = React.useCallback(() => {
      clearSide("enemies");
    }, [clearSide]);

    const handleEnemiesCopy = React.useCallback(() => {
      void copy("enemies");
    }, [copy]);

  /* ─────────────── UI ─────────────── */

    React.useImperativeHandle(
      ref,
      () => ({
        swapSides,
        copyAll: handleCopyAll,
      }),
      [handleCopyAll, swapSides],
    );

  return (
    <div data-scope="team" className="w-full mt-[var(--space-6)]">
      <section className="rounded-card r-card-lg glitch-card relative p-[var(--space-5)] text-card-foreground">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-[var(--space-6)]">
          {/* Allies */}
          <div className="md:col-span-5">
            <SideEditor
              side="allies"
              title="Allies"
              icon={<Shield />}
              value={state.allies}
              onLane={handleAlliesLane}
              onNotes={handleAlliesNotes}
              onClear={handleAlliesClear}
              onCopy={handleAlliesCopy}
              count={filledCount.allies}
            />
          </div>

          {/* Center spine (md+) */}
          <div className="hidden md:block relative md:col-span-2">
            <span
              aria-hidden
              className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-px bg-border"
            />
          </div>

          {/* Enemies */}
          <div className="md:col-span-5">
            <SideEditor
              side="enemies"
              title="Enemies"
              icon={<Swords />}
              value={state.enemies}
              onLane={handleEnemiesLane}
              onNotes={handleEnemiesNotes}
              onClear={handleEnemiesClear}
              onCopy={handleEnemiesCopy}
              count={filledCount.enemies}
            />
          </div>
        </div>
      </section>
    </div>
  );
});

/* ───────────────── subcomponents ───────────────── */

function SideEditor(props: {
  side: Side;
  title: string;
  icon: React.ReactNode;
  value: Team;
  onLane: (lane: LaneKey, v: string) => void;
  onNotes: (v: string) => void;
  onClear: () => void;
  onCopy: () => void;
  count: number;
}) {
  const { side, title, icon, value, onLane, onNotes, onClear, onCopy, count } = props;

  return (
    <div className="rounded-card r-card-lg glitch-card relative p-[var(--space-4)] text-card-foreground">
      {/* neon rail */}
      <span aria-hidden className="glitch-rail" />

      <header className="mb-[var(--space-3)] flex items-center gap-[var(--space-2)]">
        {/* glitchy side title */}
        <span
          className="glitch-title glitch-flicker title-glow inline-flex items-center gap-[var(--space-2)]"
          data-text={title}
        >
          {icon}
          <strong className="text-body sm:text-title font-semibold tracking-[-0.01em]">{title}</strong>
        </span>

        <span className="ml-auto pill pill-compact text-label font-medium tracking-[0.02em] uppercase">
          {count}/5 filled
        </span>
      </header>

      <div className="grid gap-[var(--space-3)]">
        {LANES.map(({ key, label }) => {
          const inputId = `${side}-${key}`;
          return (
            <div
              key={key}
              className="grid grid-cols-[calc(var(--spacing-8)+var(--spacing-5))_1fr] items-center gap-[var(--space-3)]"
            >
              <label
                className="glitch-title glitch-flicker text-label font-medium tracking-[0.02em] text-muted-foreground"
                data-text={label}
                htmlFor={inputId}
              >
                {label}
              </label>
              <Input
                id={inputId}
                placeholder={`Enter ${label} champion`}
                value={value[key] as string}
                onChange={(e) => onLane(key, e.currentTarget.value)}
              />
            </div>
          );
        })}

        <div className="grid gap-[var(--space-3)]">
          <label
            className="text-label font-medium tracking-[0.02em] text-muted-foreground inline-flex items-center gap-[var(--space-2)]"
            htmlFor={`${side}-notes`}
          >
            <NotebookPen className="opacity-80" /> Notes
          </label>
          <Textarea
            id={`${side}-notes`}
            placeholder="Short plan, spikes, target calls…"
            value={value.notes ?? ""}
            onChange={(e) => onNotes(e.currentTarget.value)}
            resize="resize-y"
            textareaClassName="min-h-[calc(var(--spacing-8)*2+var(--spacing-7)+var(--spacing-1))] leading-relaxed"
            rows={4}
          />
        </div>

        {/* side actions: icon-only, same behavior */}
        <div className="mt-[var(--space-1)] flex items-center gap-[var(--space-2)] justify-end">
          <IconButton
            title={`Clear ${title}`}
            aria-label={`Clear ${title}`}
            variant="ghost"
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
