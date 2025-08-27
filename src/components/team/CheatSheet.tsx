// src/components/team/CheatSheet.tsx
"use client";
import "../team/style.css";

/**
 * CheatSheet — hover-only edit per card, write-through persistence.
 * Titles use Lavender-Glitch (glitch-title + glitch-flicker + title-glow).
 * Lane labels (TOP/JUNGLE/MID/ADC/SUPPORT) also flicker via team scope.
 * Scoped with data-scope="team" to avoid global glitch leakage.
 */

import * as React from "react";
import { useLocalDB } from "@/lib/db";
import IconButton from "@/components/ui/primitives/IconButton";
import { Pencil, Check } from "lucide-react";

/* ───────────── types ───────────── */

type Role = "Top" | "Jungle" | "Mid" | "ADC" | "Support";
type LaneExamples = Partial<Record<Role, string[]>>;

export type Archetype = {
  id: string;
  title: string;
  description: string;
  wins: string[];
  struggles?: string[];
  tips?: string[];
  examples: LaneExamples;
};

export type CheatSheetProps = {
  className?: string;
  dense?: boolean;
  data?: Archetype[];
};

/* ───────────── seeds ───────────── */

const DEFAULT_SHEET: Archetype[] = [
  {
    id: "front-to-back",
    title: "Front to Back",
    description:
      "Anchor team fights around tanks and carries. Peel, kite, and win extended fights.",
    wins: [
      "You frontload engage and kite back cleanly",
      "Enemy blows cooldowns on tanks and loses threat",
      "Your ADC hits free DPS windows",
    ],
    struggles: ["Flank TP and backline dive", "Hard poke before engage"],
    tips: [
      "Track enemy flash + engage timers.",
      "Peel first, chase later. Don’t burn mobility spells early.",
    ],
    examples: {
      Top: ["Ornn", "Sion", "Shen"],
      Jungle: ["Sejuani", "Maokai"],
      Mid: ["Orianni", "Azir"],
      ADC: ["Jinx", "Zeri"],
      Support: ["Braum", "Lulu"],
    },
  },
  {
    id: "dive",
    title: "Dive",
    description:
      "Commit layered engage onto backline. Burst, then reset or exit.",
    wins: [
      "You stack CC on first target",
      "Sidewaves force enemy to group awkwardly",
      "Vision denial creates clean angles",
    ],
    struggles: ["Exhaust/peel supports", "Stopwatches and GA timings"],
    tips: ["Ping dive target early. Commit ults together."],
    examples: {
      Top: ["Kennen", "Camille"],
      Jungle: ["Jarvan IV", "Wukong"],
      Mid: ["Sylas", "Akali"],
      ADC: ["Kai’Sa", "Samira"],
      Support: ["Rakan", "Nautilus"],
    },
  },
  {
    id: "pick",
    title: "Pick",
    description:
      "Create numbers advantage through fog traps, hooks, and skirmish picks.",
    wins: [
      "You control river/entrances with wards and traps",
      "Enemy face-checks first",
      "You convert pick to objective fast",
    ],
    struggles: ["Stall comps with cleanse/QSS", "Stubborn 5-man mid ARAM"],
    tips: ["Don’t overchase. Reset tempo after each pick."],
    examples: {
      Jungle: ["Elise", "Viego"],
      Mid: ["Ahri", "Twisted Fate"],
      ADC: ["Ashe", "Varus"],
      Support: ["Thresh", "Blitzcrank", "Rell"],
    },
  },
  {
    id: "poke-siege",
    title: "Poke & Siege",
    description:
      "Chip HP bars and take structures on timers. Disengage hard engages.",
    wins: [
      "You hit turret windows with waves synced",
      "Enemy has limited engage or no flanks",
      "HP diff forces objective flips",
    ],
    struggles: ["Hard flank TP", "Long-range engage"],
    tips: ["Place wards deep on flanks. Don’t overstay post-poke."],
    examples: {
      Top: ["Jayce"],
      Mid: ["Zoe", "Ziggs"],
      ADC: ["Varus", "Ezreal"],
      Support: ["Karma", "Janna"],
    },
  },
  {
    id: "splitpush-131",
    title: "1-3-1 Split",
    description:
      "Pressure two sides, deny engage, and trade up on map with TP advantage.",
    wins: [
      "You maintain vision and mid prio for cross-map",
      "Your sidelaner wins 1v1 or escapes cleanly",
      "Enemy comp needs 5-man to engage",
    ],
    struggles: ["Hard engage with fast mid-to-side collapse"],
    tips: ["Keep timers: waves, TP, objectives. Don’t group unless forced."],
    examples: {
      Top: ["Camille", "Jax", "Fiora"],
      Mid: ["Ryze", "Azir"],
      ADC: ["Xayah"],
      Support: ["Tahm Kench", "Rakan"],
    },
  },
  {
    id: "wombo",
    title: "Wombo Combo",
    description:
      "Stack AoE CC + AoE damage. Fight on chokes and objective pits.",
    wins: [
      "You force fights in tight spaces",
      "Enemy lacks stopwatches/peel",
      "You layer ults, not overlap them",
    ],
    struggles: ["Disengage and spacing comps"],
    tips: ["Ping ult order. Hold last engage for cleanup."],
    examples: {
      Top: ["Malphite", "Kennen"],
      Jungle: ["Sejuani", "Amumu"],
      Mid: ["Orianna", "Yasuo"],
      ADC: ["Miss Fortune"],
      Support: ["Rell", "Alistar"],
    },
  },
];

/* ───────────── tiny UI helpers ───────────── */

function Label({ children }: { children: React.ReactNode }) {
  const text = typeof children === "string" ? children : String(children ?? "");
  return (
    <div
      className="glitch-anim glitch-label text-[10px] font-semibold tracking-wide uppercase text-[hsl(var(--muted-foreground))]"
      data-text={text}
    >
      {text}
    </div>
  );
}

function ChampPillsView({ champs }: { champs?: string[] }) {
  if (!champs?.length) return null;
  return (
    <div className="champ-badges mt-1">
      {champs.map((c) => (
        <span key={c} className="champ-badge glitch-pill text-xs">
          <i className="dot" />
          {c}
        </span>
      ))}
    </div>
  );
}

/* ───────────── editable primitives ───────────── */

function TitleEdit({
  value,
  onChange,
  editing,
}: { value: string; onChange: (v: string) => void; editing: boolean }) {
  if (!editing)
    return (
      <h3
        className="glitch-title glitch-flicker title-glow text-lg sm:text-xl font-semibold"
        data-text={value}
      >
        {value}
      </h3>
    );
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      className="w-full bg-transparent border-none outline-none text-lg sm:text-xl font-semibold glitch-title title-glow"
      aria-label="Archetype title"
      autoFocus
    />
  );
}

function ParagraphEdit({
  value,
  onChange,
  editing,
}: { value: string; onChange: (v: string) => void; editing: boolean }) {
  if (!editing)
    return (
      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{value}</p>
    );
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      rows={2}
      className="mt-1 w-full resize-y bg-transparent border-none outline-none text-sm text-[hsl(var(--muted-foreground))] planner-textarea"
      aria-label="Description"
    />
  );
}

function BulletListEdit({
  items,
  onChange,
  editing,
  ariaLabel,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  editing: boolean;
  ariaLabel: string;
}) {
  const listRef = React.useRef<HTMLUListElement | null>(null);

  React.useEffect(() => {
    if (!editing || !listRef.current) return;
    if (!listRef.current.querySelector("li")) {
      onChange([""]);
    }
  }, [editing, onChange]);

  const handleInput = () => {
    if (!listRef.current) return;
    const liTexts = Array.from(listRef.current.querySelectorAll("li")).map(
      (li) => li.textContent?.trim() ?? ""
    );
    const cleaned =
      liTexts.filter(Boolean).length === 0 ? [""] : liTexts.filter((t) => t.length > 0);
    onChange(cleaned);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (!editing) return;
    const sel = window.getSelection();
    const target = e.target as HTMLElement;
    const li = target.closest("li");
    if (!li) return;

    if (e.key === "Enter") {
      e.preventDefault();
      const newLi = document.createElement("li");
      newLi.contentEditable = "true";
      newLi.innerHTML = "";
      li.after(newLi);
      newLi.focus();
      handleInput();
      return;
    }

    if (e.key === "Backspace") {
      const atStart =
        sel && sel.anchorOffset === 0 && sel.focusOffset === 0 && (li.textContent ?? "") === "";
      if (atStart) {
        e.preventDefault();
        const prev = li.previousElementSibling as HTMLLIElement | null;
        const parent = li.parentElement;
        li.remove();
        if (prev) {
          prev.focus();
        } else if (parent && !parent.querySelector("li")) {
          const seed = document.createElement("li");
          seed.contentEditable = "true";
          seed.innerHTML = "";
          parent.appendChild(seed);
          seed.focus();
        }
        handleInput();
      }
    }
  };

  if (!editing) {
    return (
      <ul className="mt-1 list-disc list-inside space-y-1 text-sm leading-5">
        {items.map((w, idx) => (
          <li key={idx}>{w}</li>
        ))}
      </ul>
    );
  }

  return (
    <ul
      ref={listRef}
      className="mt-1 list-disc list-inside space-y-1 text-sm leading-5"
      aria-label={ariaLabel}
      onInput={handleInput}
      onKeyDown={onKeyDown}
    >
      {(items.length ? items : [""]).map((w, idx) => (
        <li key={idx} contentEditable suppressContentEditableWarning>
          {w}
        </li>
      ))}
    </ul>
  );
}

function ChampPillsEdit({
  champs,
  onChange,
  editing,
}: {
  champs?: string[];
  onChange: (list: string[]) => void;
  editing: boolean;
}) {
  const list = champs ?? [];

  if (!editing) return <ChampPillsView champs={list} />;

  function setAt(i: number, next: string) {
    const arr = [...list];
    arr[i] = next;
    onChange(arr.filter((s) => s.trim().length));
  }
  function insertAfter(i: number) {
    const arr = [...list];
    arr.splice(i + 1, 0, "");
    onChange(arr.length ? arr : [""]);
  }
  function removeAt(i: number) {
    const arr = [...list];
    arr.splice(i, 1);
    onChange(arr);
  }

  return (
    <div className="champ-badges mt-1 flex flex-wrap gap-1.5">
      {(list.length ? list : [""]).map((c, i) => (
        <span key={i} className="champ-badge glitch-pill text-xs">
          <i className="dot" />
          <span
            contentEditable
            suppressContentEditableWarning
            className="outline-none"
            onInput={(e) => setAt(i, (e.currentTarget.textContent ?? "").trim())}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                insertAfter(i);
              }
              if (e.key === "Backspace") {
                const text = (e.currentTarget.textContent ?? "").trim();
                if (!text) {
                  e.preventDefault();
                  removeAt(i);
                }
              }
            }}
          >
            {c}
          </span>
        </span>
      ))}
    </div>
  );
}

/* ───────────── main component ───────────── */

export default function CheatSheet({
  className = "",
  dense = false,
  data = DEFAULT_SHEET,
}: CheatSheetProps) {
  const [sheet, setSheet] = useLocalDB<Archetype[]>("team:cheatsheet.v2", data);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const patchArc = React.useCallback(
    (id: string, partial: Partial<Archetype>) => {
      setSheet((prev) => prev.map((a) => (a.id === id ? { ...a, ...partial } : a)));
    },
    [setSheet]
  );

  return (
    <section
      data-scope="team"
      className={["grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3", className].join(" ")}
    >
      {sheet.map((a) => {
        const isEditing = editingId === a.id;

        return (
          <article
            key={a.id}
            className={["group glitch-card card-neo relative h-full", dense ? "p-4" : "p-5"].join(" ")}
          >
            {/* Hover-only top-right edit/save button */}
            <div className="absolute right-2 top-2 z-10 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
              {!isEditing ? (
                <IconButton
                  title="Edit"
                  circleSize="sm"
                  onClick={() => setEditingId(a.id)}
                >
                  <Pencil />
                </IconButton>
              ) : (
                <IconButton
                  title="Save"
                  circleSize="sm"
                  onClick={() => setEditingId(null)}
                >
                  <Check />
                </IconButton>
              )}
            </div>

            {/* Neon spine */}
            <span aria-hidden className="glitch-rail" />

            {/* Title + description */}
            <header className="mb-3">
              <TitleEdit
                value={a.title}
                editing={isEditing}
                onChange={(v) => patchArc(a.id, { title: v })}
              />
              <ParagraphEdit
                value={a.description}
                editing={isEditing}
                onChange={(v) => patchArc(a.id, { description: v })}
              />
            </header>

            {/* Body */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Wins when</Label>
                <BulletListEdit
                  items={a.wins}
                  onChange={(v) => patchArc(a.id, { wins: v })}
                  editing={isEditing}
                  ariaLabel="Wins when"
                />
              </div>

              {(a.struggles?.length || isEditing) ? (
                <div>
                  <Label>Struggles vs</Label>
                  <BulletListEdit
                    items={a.struggles ?? []}
                    onChange={(v) => patchArc(a.id, { struggles: v })}
                    editing={isEditing}
                    ariaLabel="Struggles vs"
                  />
                </div>
              ) : null}

              {(a.tips?.length || isEditing) ? (
                <div>
                  <Label>Tips</Label>
                  <BulletListEdit
                    items={a.tips ?? []}
                    onChange={(v) => patchArc(a.id, { tips: v })}
                    editing={isEditing}
                    ariaLabel="Tips"
                  />
                </div>
              ) : null}

              {/* Examples with fixed role column */}
              <div>
                <Label>Examples</Label>
                <div className="mt-2 space-y-2">
                  {(["Top", "Jungle", "Mid", "ADC", "Support"] as Role[]).map((role) => {
                    const champs = a.examples[role];
                    const setChamps = (list: string[]) =>
                      patchArc(a.id, { examples: { ...a.examples, [role]: list } });
                    const showRow = champs?.length || isEditing;
                    if (!showRow) return null;

                    return (
                      <div key={role} className="grid grid-cols-[88px_1fr] items-start gap-x-3">
                        <div
                          className="glitch-title glitch-flicker text-xs font-medium text-[hsl(var(--muted-foreground))] pt-1"
                          data-text={role}
                        >
                          {role}
                        </div>
                        <ChampPillsEdit champs={champs ?? []} onChange={setChamps} editing={isEditing} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
