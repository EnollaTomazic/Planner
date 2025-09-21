// src/components/team/CheatSheet.tsx
"use client";
import "./style.css";

/**
 * CheatSheet — edit per card with persistent controls, write-through persistence.
 * Titles use Lavender-Glitch (glitch-title + glitch-flicker + title-glow).
 * Lane labels (TOP/JUNGLE/MID/BOT/SUPPORT) also flicker via team scope.
 * Scoped with data-scope="team" to avoid global glitch leakage.
 */

import * as React from "react";
import { usePersistentState } from "@/lib/db";
import IconButton from "@/components/ui/primitives/IconButton";
import Textarea from "@/components/ui/primitives/Textarea";
import { Pencil, Check } from "lucide-react";
import { ROLES } from "./constants";
import type { Role } from "./constants";
import ChampListEditor from "./ChampListEditor";

/* ───────────── types ───────────── */

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

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function decodeCheatSheet(value: unknown): Archetype[] | null {
  if (!Array.isArray(value)) return null;

  const safeList: Archetype[] = [];

  for (const entry of value) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      return null;
    }

    const {
      id,
      title,
      description,
      wins,
      struggles,
      tips,
      examples,
    } = entry as Record<string, unknown>;

    if (
      typeof id !== "string" ||
      typeof title !== "string" ||
      typeof description !== "string" ||
      !isStringArray(wins)
    ) {
      return null;
    }

    if (typeof struggles !== "undefined" && !isStringArray(struggles)) {
      return null;
    }

    if (typeof tips !== "undefined" && !isStringArray(tips)) {
      return null;
    }

    const laneExamples: LaneExamples = {};

    if (typeof examples !== "undefined") {
      if (
        examples === null ||
        typeof examples !== "object" ||
        Array.isArray(examples)
      ) {
        return null;
      }

      for (const [role, champs] of Object.entries(
        examples as Record<string, unknown>,
      )) {
        if (!ROLES.includes(role as Role)) continue;
        if (!isStringArray(champs)) return null;
        laneExamples[role as Role] = [...champs];
      }
    }

    const archetype: Archetype = {
      id,
      title,
      description,
      wins: [...wins],
      examples: laneExamples,
    };

    if (typeof struggles !== "undefined") {
      archetype.struggles = [...struggles];
    }

    if (typeof tips !== "undefined") {
      archetype.tips = [...tips];
    }

    safeList.push(archetype);
  }

  return safeList;
}

function ensureExamples(examples?: LaneExamples): [LaneExamples, boolean] {
  if (!examples) {
    const safe = ROLES.reduce<LaneExamples>((acc, role) => {
      acc[role] = [];
      return acc;
    }, {} as LaneExamples);
    return [safe, true];
  }

  let changed = false;
  const safe: LaneExamples = { ...examples };

  for (const role of ROLES) {
    const lane = examples[role];
    if (Array.isArray(lane)) continue;
    safe[role] = [];
    if (!changed) changed = true;
  }

  return changed ? [safe, true] : [examples, false];
}

export type CheatSheetProps = {
  className?: string;
  dense?: boolean;
  data?: Archetype[];
  query?: string;
  editing?: boolean;
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
      "Your Bot hits free DPS windows",
    ],
    struggles: ["Flank TP and backline dive", "Hard poke before engage"],
    tips: [
      "Track enemy flash + engage timers.",
      "Peel first, chase later. Don’t burn mobility spells early.",
    ],
    examples: {
      Top: ["Ornn", "Sion", "Shen"],
      Jungle: ["Sejuani", "Maokai"],
      Mid: ["Orianna", "Azir"],
      Bot: ["Jinx", "Zeri"],
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
      Bot: ["Kai’Sa", "Samira"],
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
      Bot: ["Ashe", "Varus"],
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
      Bot: ["Varus", "Ezreal"],
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
      Bot: ["Xayah"],
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
      Bot: ["Miss Fortune"],
      Support: ["Rell", "Alistar"],
    },
  },
];

/* ───────────── tiny UI helpers ───────────── */

function Label({ children }: { children: React.ReactNode }) {
  const text = typeof children === "string" ? children : String(children ?? "");
  return (
    <div
      className="glitch-anim glitch-label text-label font-medium tracking-[0.02em] uppercase text-muted-foreground"
      data-text={text}
    >
      {text}
    </div>
  );
}

/* ───────────── editable primitives ───────────── */

function TitleEdit({
  value,
  onChange,
  editing,
}: {
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
}) {
  if (!editing)
    return (
      <h3
        className="glitch-title glitch-flicker title-glow text-title sm:text-title-lg font-semibold tracking-[-0.01em]"
        data-text={value}
      >
        {value}
      </h3>
    );
  return (
    <input
      dir="ltr"
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      className="w-full bg-transparent border-none rounded-[var(--control-radius)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-title sm:text-title-lg font-semibold tracking-[-0.01em] glitch-title title-glow"
      aria-label="Archetype title"
      autoFocus
    />
  );
}

function ParagraphEdit({
  value,
  onChange,
  editing,
}: {
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
}) {
  if (!editing)
    return (
      <p className="mt-[var(--space-1)] text-ui font-medium text-muted-foreground">
        {value}
      </p>
    );
  return (
    <Textarea
      dir="ltr"
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      rows={2}
      className="mt-[var(--space-1)]"
      resize="resize-y"
      textareaClassName="min-h-[calc(var(--spacing-8)*2+var(--spacing-7)+var(--spacing-1))] text-ui font-medium text-muted-foreground leading-relaxed"
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
  const [list, setList] = React.useState<string[]>(() => {
    const cleaned = items.map((item) => item.trim()).filter(Boolean);
    return cleaned.length ? [...items] : [""];
  });
  const liRefs = React.useRef<Array<HTMLLIElement | null>>([]);

  React.useEffect(() => {
    const cleaned = items.map((item) => item.trim()).filter(Boolean);
    setList(cleaned.length ? [...items] : [""]);
  }, [items]);

  function scrubItemText(el: HTMLLIElement): string {
    el.normalize();
    const text = el.textContent ?? "";
    const hasUnsafeNodes = Array.from(el.childNodes).some(
      (node) => node.nodeType !== Node.TEXT_NODE,
    );
    if (hasUnsafeNodes) {
      el.textContent = text;
      return el.textContent ?? "";
    }
    return text;
  }

  function insertPlainText(el: HTMLLIElement, text: string) {
    const selection = window.getSelection();
    if (!selection?.rangeCount) {
      el.textContent = text;
      return;
    }

    const range = selection.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) {
      el.textContent = text;
      return;
    }

    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.setStart(textNode, textNode.length);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function handlePaste(i: number, e: React.ClipboardEvent<HTMLLIElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    const plain = e.clipboardData?.getData("text/plain") ?? "";
    insertPlainText(el, plain);
    const text = scrubItemText(el);
    const next = [...list];
    next[i] = text;
    update(next);
  }

  function update(next: string[]) {
    const trimmed = next.map((item) => item.trim());
    const filtered = trimmed.filter(Boolean);
    setList(filtered.length ? next : [""]);
    onChange(filtered.length ? filtered : []);
  }

  function handleItemInput(i: number, e: React.FormEvent<HTMLLIElement>) {
    const el = e.currentTarget;
    const text = scrubItemText(el);
    const next = [...list];
    next[i] = text;
    update(next);
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLLIElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const next = [...list];
      next.splice(i + 1, 0, "");
      update(next);
      requestAnimationFrame(() => liRefs.current[i + 1]?.focus());
    }
    if (e.key === "Backspace" && list[i] === "") {
      e.preventDefault();
      const next = [...list];
      next.splice(i, 1);
      update(next.length ? next : [""]);
      requestAnimationFrame(() => {
        const idx = i > 0 ? i - 1 : 0;
        liRefs.current[idx]?.focus();
      });
    }
  }

  if (!editing) {
    return (
      <ul className="mt-[var(--space-1)] list-none pl-[var(--space-6)] space-y-[var(--space-1)] text-ui font-medium leading-5 text-foreground">
        {list
          .filter((w) => w.trim().length)
          .map((w, idx) => (
            <li
              key={idx}
              className="relative pl-[var(--space-3)] before:absolute before:left-0 before:top-[var(--space-2)] before:h-[var(--space-2)] before:w-[var(--space-2)] before:rounded-full before:bg-current"
            >
              {w}
            </li>
          ))}
      </ul>
    );
  }

  return (
    <ul
      className="mt-[var(--space-1)] list-none pl-[var(--space-6)] space-y-[var(--space-1)] text-ui font-medium leading-5 text-foreground"
      aria-label={ariaLabel}
    >
      {list.map((w, idx) => (
        <li
          key={idx}
          ref={(el) => {
            liRefs.current[idx] = el;
          }}
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label={ariaLabel}
          tabIndex={0}
          dir="ltr"
          suppressContentEditableWarning
          onInput={(e) => handleItemInput(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={(e) => handlePaste(idx, e)}
          onDrop={(event) => event.preventDefault()}
          className="relative pl-[var(--space-3)] before:absolute before:left-0 before:top-[var(--space-2)] before:h-[var(--space-2)] before:w-[var(--space-2)] before:rounded-full before:bg-current"
        >
          {w}
        </li>
      ))}
    </ul>
  );
}

/* ───────────── main component ───────────── */

export default function CheatSheet({
  className = "",
  dense = false,
  data = DEFAULT_SHEET,
  query = "",
  editing = false,
}: CheatSheetProps) {
  const [sheet, setSheet] = usePersistentState<Archetype[]>(
    "team:cheatsheet.v2",
    data,
    {
      decode: decodeCheatSheet,
    },
  );
  const [editingId, setEditingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let needsUpdate = false;
    const next = sheet.map((arc) => {
      const [safeExamples, changed] = ensureExamples(arc.examples);
      if (!changed) return arc;
      needsUpdate = true;
      return {
        ...arc,
        examples: safeExamples,
      };
    });

    if (needsUpdate) {
      setSheet(next);
    }
  }, [sheet, setSheet]);

  React.useEffect(() => {
    if (!editing) setEditingId(null);
  }, [editing]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sheet;
    return sheet.filter((a) => {
      const hay = [
        a.title,
        a.description,
        ...(a.wins ?? []),
        ...(a.struggles ?? []),
        ...(a.tips ?? []),
        ...Object.values(a.examples ?? {}).flat(),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [sheet, query]);

  const patchArc = React.useCallback(
    (id: string, partial: Partial<Archetype>) => {
      setSheet((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;

          const base = { ...a, ...partial };
          const mergedExamples =
            "examples" in partial
              ? {
                  ...(a.examples ?? {}),
                  ...(partial.examples ?? {}),
                }
              : base.examples;

          const [safeExamples, changed] = ensureExamples(mergedExamples);

          if ("examples" in partial || changed) {
            base.examples = safeExamples;
          }

          return base;
        }),
      );
    },
    [setSheet],
  );

  return (
    <section
      data-scope="team"
      className={[
        "grid gap-[var(--space-4)] sm:gap-[var(--space-6)] md:grid-cols-2 xl:grid-cols-3",
        className,
      ].join(" ")}
    >
      {filtered.map((a) => {
        const isEditing = editing && editingId === a.id;

        return (
          <article
            key={a.id}
            className={[
              "group glitch-card card-neo relative h-full",
              dense
                ? "p-[var(--space-4)]"
                : "p-[var(--space-5)]",
            ].join(" ")}
          >
            {/* Top-right edit/save control */}
            {editing && (
              <div className="absolute right-[var(--space-2)] top-[var(--space-2)] z-10 flex items-center gap-[var(--space-1)] opacity-100 pointer-events-auto">
                {!isEditing ? (
                  <IconButton
                    title="Edit"
                    aria-label="Edit"
                    size="sm"
                    onClick={() => setEditingId(a.id)}
                  >
                    <Pencil />
                  </IconButton>
                ) : (
                  <IconButton
                    title="Save"
                    aria-label="Save"
                    size="sm"
                    onClick={() => setEditingId(null)}
                  >
                    <Check />
                  </IconButton>
                )}
              </div>
            )}

            {/* Neon spine */}
            <span aria-hidden className="glitch-rail" />

            {/* Title + description */}
            <header className="mb-[var(--space-3)]">
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
            <div className="grid grid-cols-1 gap-[var(--space-4)]">
              <div>
                <Label>Wins when</Label>
                <BulletListEdit
                  items={a.wins}
                  onChange={(v) => patchArc(a.id, { wins: v })}
                  editing={isEditing}
                  ariaLabel="Wins when"
                />
              </div>

              {a.struggles?.length || isEditing ? (
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

              {a.tips?.length || isEditing ? (
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
                <div className="mt-[var(--space-2)] space-y-[var(--space-2)]">
                  {ROLES.map(
                    (role) => {
                      const champs = a.examples?.[role] ?? [];
                      const setChamps = (list: string[]) =>
                        patchArc(a.id, {
                          examples: { [role]: list } as LaneExamples,
                        });
                      const showRow = champs.length || isEditing;
                      if (!showRow) return null;

                      return (
                        <div
                          key={role}
                          className="grid grid-cols-[calc(var(--spacing-8)+var(--spacing-5))_1fr] items-start gap-x-[var(--space-3)]"
                        >
                          <div
                            className="glitch-title glitch-flicker text-label font-medium tracking-[0.02em] text-muted-foreground pt-[var(--space-1)]"
                            data-text={role}
                          >
                            {role}
                          </div>
                          <ChampListEditor
                            list={champs}
                            onChange={setChamps}
                            editing={isEditing}
                          />
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
