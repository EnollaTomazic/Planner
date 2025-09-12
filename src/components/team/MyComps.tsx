// src/components/team/MyComps.tsx
"use client";

/**
 * MyComps — CRUD for custom comps, single-panel version.
 * - One SectionCard: header + add bar + cards grid inside the same panel
 * - Add comp (title), edit per-role champs (inline chips), notes
 * - Hover-only actions: Copy / Edit / Delete; Save when editing
 * - Local-first via usePersistentState("team:mycomps.v1")
 * - Scoped with data-scope="team" so glitch effects don't bleed globally
 */

import "./style.css";

import * as React from "react";
import { usePersistentState, uid } from "@/lib/db";
import { copyText } from "@/lib/clipboard";
import SectionCard from "@/components/ui/layout/SectionCard";
import IconButton from "@/components/ui/primitives/IconButton";
import Input from "@/components/ui/primitives/Input";
import Textarea from "@/components/ui/primitives/Textarea";
import {
  Clipboard,
  ClipboardCheck,
  Pencil,
  Check,
  Trash2,
  NotebookPen,
  Plus,
} from "lucide-react";
import { sanitizeText } from "@/lib/utils";

/* ───────────── Types ───────────── */

type Role = "Top" | "Jungle" | "Mid" | "Bot" | "Support";

export type TeamComp = {
  id: string;
  title: string;
  roles: Partial<Record<Role, string[]>>;
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

const DB_KEY = "team:mycomps.v1";

/* ───────────── Seeds ───────────── */

const SEEDS: TeamComp[] = [
  {
    id: uid("comp"),
    title: "Protect Jinx",
    roles: {
      Top: ["Sion"],
      Jungle: ["Sejuani"],
      Mid: ["Orianna"],
      Bot: ["Jinx"],
      Support: ["Lulu"],
    },
    notes: "Front-to-back. Track flank TPs, save Lulu ult for diver.",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: uid("comp"),
    title: "Fog Pick Traps",
    roles: {
      Jungle: ["Rengar"],
      Mid: ["Ahri"],
      Bot: ["Ashe"],
      Support: ["Thresh", "Pyke"],
    },
    notes: "Sweep chokes first, convert pick into fast objective start.",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

/* ───────────── Utils ───────────── */

const ROLES: Role[] = ["Top", "Jungle", "Mid", "Bot", "Support"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}
function safeNumber(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : Number.NaN;
  return Number.isFinite(n) ? n : fallback;
}

function stringify(c: TeamComp) {
  const body = ROLES.map((r) => `${r}: ${c.roles[r]?.join(", ") || "-"}`).join(
    "\n",
  );
  return [
    c.title,
    "-----------",
    body,
    c.notes?.trim() ? "\nNotes: " + c.notes.trim() : "",
    "\n# 13 League Review · My Comps",
  ].join("\n");
}

/** Normalize arbitrary localStorage entries into the TeamComp shape. */
function normalize(list: unknown[]): TeamComp[] {
  if (!Array.isArray(list)) return [];
  return list.map((raw): TeamComp => {
    if (!isRecord(raw)) {
      return {
        id: uid("comp"),
        title: "Imported Comp",
        roles: { Top: [], Jungle: [], Mid: [], Bot: [], Support: [] },
        notes: "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }
    const title =
      typeof raw.title === "string" && raw.title.trim()
        ? raw.title
        : "Untitled";
    let roles: Partial<Record<Role, string[]>>;
    if (isRecord(raw.roles)) {
      const next: Partial<Record<Role, string[]>> = {};
      for (const r of ROLES) {
        const v = raw.roles[r as keyof typeof raw.roles];
        next[r] = isStringArray(v) ? v.filter(Boolean) : [];
      }
      roles = next;
    } else {
      roles = { Top: [], Jungle: [], Mid: [], Bot: [], Support: [] };
    }
    const notes = typeof raw.notes === "string" ? raw.notes : "";
    return {
      id: typeof raw.id === "string" ? raw.id : uid("comp"),
      title,
      roles,
      notes,
      createdAt: safeNumber(raw.createdAt, Date.now()),
      updatedAt: safeNumber(raw.updatedAt, Date.now()),
    };
  });
}

/* ───────────── Chips Editor ───────────── */

function ChampChips({
  list,
  onChange,
  editing,
}: {
  list: string[] | undefined;
  onChange: (next: string[]) => void;
  editing: boolean;
}) {
  const champs = list ?? [];

  if (!editing) {
    return (
      <div className="champ-badges mt-1 flex flex-wrap gap-2">
        {(champs.length ? champs : ["-"]).map((c, i) => (
          <span key={i} className="champ-badge glitch-pill text-label font-medium tracking-[0.02em]">
            <i className="dot" />
            {c}
          </span>
        ))}
      </div>
    );
  }

  function setAt(i: number, next: string) {
    const arr = [...champs];
    arr[i] = sanitizeText(next);
    onChange(arr.map(sanitizeText).filter((s) => s.trim().length));
  }
  function insertAfter(i: number) {
    const arr = [...champs];
    arr.splice(i + 1, 0, "");
    const nextArr = arr.length ? arr : [""];
    onChange(nextArr.map(sanitizeText));
  }
  function removeAt(i: number) {
    const arr = [...champs];
    arr.splice(i, 1);
    onChange(arr.map(sanitizeText));
  }

  return (
    <div className="champ-badges mt-1 flex flex-wrap gap-2">
      {(champs.length ? champs : [""]).map((c, i) => (
        <span key={i} className="champ-badge glitch-pill text-label font-medium tracking-[0.02em]">
          <i className="dot" />
          <input
            type="text"
            dir="ltr"
            value={c}
            onChange={(e) => setAt(i, e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                insertAfter(i);
              }
              if (e.key === "Backspace" && !e.currentTarget.value) {
                e.preventDefault();
                removeAt(i);
              }
            }}
            aria-label="Champion name"
            autoComplete="off"
            className="bg-transparent border-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-24"
          />
        </span>
      ))}
    </div>
  );
}

/* ───────────── Component ───────────── */

export type MyCompsProps = { query?: string; editing?: boolean };

export default function MyComps({ query = "", editing = false }: MyCompsProps) {
  // Load and normalize so old/bad records don't break the UI.
  const [raw, setRaw] = usePersistentState<TeamComp[]>(DB_KEY, SEEDS);
  const items = React.useMemo(() => normalize(raw as unknown[]), [raw]);
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => {
      const hay = [
        c.title,
        c.notes ?? "",
        ...ROLES.flatMap((r) => c.roles[r] ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!editing) setEditingId(null);
  }, [editing]);

  // New-comp draft
  const [draft, setDraft] = React.useState("");

  function setItems(next: TeamComp[]) {
    setRaw(next);
  }
  function remove(id: string) {
    setItems(items.filter((x) => x.id !== id));
  }
  function patch(id: string, partial: Partial<TeamComp>) {
    setItems(
      items.map((x) =>
        x.id === id ? { ...x, ...partial, updatedAt: Date.now() } : x,
      ),
    );
  }

  async function copyOne(c: TeamComp) {
    await copyText(stringify(c));
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 900);
  }

  function addNew(e?: React.FormEvent) {
    e?.preventDefault();
    const title = draft.trim();
    if (!title) return;
    const id = uid("comp");
    const next: TeamComp = {
      id,
      title,
      roles: { Top: [], Jungle: [], Mid: [], Bot: [], Support: [] },
      notes: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setItems([next, ...items]);
    setDraft("");
    setEditingId(id); // jump straight into editing
  }

  return (
    <div data-scope="team">
      <SectionCard className="card-neo-soft">
        <SectionCard.Header
          title="My Comps"
          card-neo-soft={`${items.length} ${items.length === 1 ? "comp" : "comps"}`}
        />
        <SectionCard.Body className="space-y-8">
          {/* Add bar (inside the same panel) */}
          {editing && (
            <form
              onSubmit={addNew}
              className="rounded-card flex items-left gap-[var(--spacing-6)] glitch"
            >
              <Input
                dir="ltr"
                name="comp-title"
                value={draft}
                onChange={(e) => setDraft(e.currentTarget.value)}
                placeholder="New comp title…"
                aria-label="New comp title"
                className="flex-1"
              />
              <IconButton
                type="submit"
                title="Add comp"
                aria-label="Add comp"
                size="md"
                className="shrink-0"
                variant="solid"
              >
                <Plus />
              </IconButton>
            </form>
          )}

          {/* Empty states */}
          {items.length === 0 ? (
            <div className="rounded-card r-card-lg p-[var(--spacing-6)] text-ui font-medium text-muted-foreground border border-border">
              No comps yet. Type a title above and press Enter.
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-card r-card-lg p-[var(--spacing-6)] text-ui font-medium text-muted-foreground border border-border">
              Nothing matches your search.
            </div>
          ) : null}

          {/* Cards grid */}
          <div className="grid grid-cols-12 gap-[var(--spacing-4)]">
            {filtered.map((c) => {
              const editingCard = editingId === c.id;

              return (
                <article
                  key={c.id}
                  className="col-span-12 md:col-span-6 xl:col-span-4 group card-neo glitch-card relative p-[var(--spacing-7)]"
                >
                  {/* hover edit/save + delete + copy */}
                  <div className="absolute right-2 top-2 z-10 flex items-left gap-[var(--spacing-1)] opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
                    {!editingCard ? (
                      <>
                        <IconButton
                          title="Copy"
                          aria-label="Copy"
                          size="sm"
                          onClick={() => copyOne(c)}
                        >
                          {copiedId === c.id ? (
                            <ClipboardCheck />
                          ) : (
                            <Clipboard />
                          )}
                        </IconButton>
                        {editing && (
                          <>
                            <IconButton
                              title="Edit"
                              aria-label="Edit"
                              size="sm"
                              onClick={() => setEditingId(c.id)}
                            >
                              <Pencil />
                            </IconButton>
                            <IconButton
                              title="Delete"
                              aria-label="Delete"
                              size="sm"
                              variant="ring"
                              onClick={() => remove(c.id)}
                            >
                              <Trash2 />
                            </IconButton>
                          </>
                        )}
                      </>
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

                  {/* neon rail */}
                  <span aria-hidden className="glitch-rail" />

                  {/* header */}
                  <header className="mb-[var(--spacing-3)]">
                    {!editingCard ? (
                      <h3
                        className="glitch-title glitch-flicker title-glow text-title sm:text-title-lg font-semibold tracking-[-0.01em]"
                        data-text={c.title}
                      >
                        {c.title}
                      </h3>
                    ) : (
                      <Input
                        dir="ltr"
                        name="comp-title-edit"
                        aria-label="Comp title"
                        value={c.title}
                        onChange={(e) =>
                          patch(c.id, { title: e.currentTarget.value })
                        }
                      />
                    )}
                  </header>

                  {/* roles */}
                  <div className="grid gap-3">
                    {ROLES.map((r) => {
                      const list = c.roles[r] ?? [];
                      const setList = (next: string[]) =>
                        patch(c.id, { roles: { ...c.roles, [r]: next } });

                      return (
                        <div
                          key={r}
                          className="grid grid-cols-[calc(var(--spacing-8)+var(--spacing-5))_1fr] items-start gap-3"
                        >
                          <div
                            className="glitch-title glitch-flicker text-label font-medium tracking-[0.02em] text-muted-foreground pt-1"
                            data-text={r}
                          >
                            {r}
                          </div>

                          {/* chips editor/view */}
                          <ChampChips
                            list={list}
                            onChange={setList}
                            editing={editing}
                          />
                        </div>
                      );
                    })}

                    {/* notes */}
                    <div className="grid gap-3">
                      <label className="text-label font-medium tracking-[0.02em] text-muted-foreground inline-flex items-center gap-2">
                        <NotebookPen className="opacity-80" /> Notes
                      </label>
                      {!editingCard ? (
                        <p className="text-ui font-medium text-muted-foreground">
                          {c.notes?.trim() || (
                            <span className="opacity-60">—</span>
                          )}
                        </p>
                      ) : (
                        <Textarea
                          dir="ltr"
                          aria-label="Notes"
                          rows={4}
                          resize="resize-y"
                          textareaClassName="min-h-[calc(var(--spacing-8)*2+var(--spacing-7)+var(--spacing-1))] leading-relaxed"
                          value={c.notes ?? ""}
                          onChange={(e) =>
                            patch(c.id, { notes: e.target.value })
                          }
                        />
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </SectionCard.Body>
      </SectionCard>
    </div>
  );
}
