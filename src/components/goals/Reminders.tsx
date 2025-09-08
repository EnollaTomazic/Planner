// src/components/team/Reminders.tsx
"use client";

/**
 * Team Reminders (Lavender-Glitch, neon-outlined)
 * - Local-first via usePersistentState("team.reminders.v1")
 * - Search + group chips + pinned toggle
 * - Add / duplicate / delete / reset curated seeds
 * - Inline edit (Enter saves, Esc cancels)
 * - Cards use glitch-card border
 * - Quick Add (input + button + neon quote) now lives in the SAME panel as the cards (SectionCard.Body)
 */


import * as React from "react";
import SectionCard from "@/components/ui/layout/SectionCard";
import Input from "@/components/ui/primitives/Input";
import Textarea from "@/components/ui/primitives/Textarea";
import Badge from "@/components/ui/primitives/Badge";
import IconButton from "@/components/ui/primitives/IconButton";
import TabBar from "@/components/ui/layout/TabBar";
import { uid, usePersistentState } from "@/lib/db";
import {
  Search,
  Plus,
  Pin,
  PinOff,
  Pencil,
  Check,
  X,
  Trash2,
  Copy,
} from "lucide-react";

type Source = "MLA" | "BLA" | "BrokenByConcept" | "Custom";
type Group = "quick" | "pregame" | "laning" | "trading" | "tempo" | "review";

export type Reminder = {
  id: string;
  title: string;
  body?: string;
  tags: string[];
  source: Source;
  group: Group;
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
};

const STORE_KEY = "team.reminders.v1";

/* ---------- curated seeds ---------- */
function R(
  title: string,
  body: string,
  tags: string[],
  source: Source,
  group: Group,
  pinned = false
): Reminder {
  const now = Date.now();
  return {
    id: uid("rem"),
    title,
    body,
    tags,
    source,
    group,
    pinned,
    createdAt: now,
    updatedAt: now,
  };
}

const SEEDS: Reminder[] = [
  R("Hit 2 first", "Push 3 melees → step up together or respect if losing push.", ["Level 2","Bot"], "BLA", "quick", true),
  R("Jungle start check", "Track start → first gank lane → second spawn prio.", ["Jungle Track"], "BrokenByConcept", "quick", true),
  R("3-wave plan", "Say it out loud: slow then crash 3 OR hold then thin/freeze.", ["Waves"], "BLA", "pregame"),
  R("Ward at 2:30", "River/tri on 2:30. Sweep before shove windows.", ["Vision"], "BrokenByConcept", "pregame"),
  R("Space with casters", "Trade when your casters live; back off on enemy wave.", ["Trading","Wave"], "BLA", "laning"),
  R("CD punish", "Trade on enemy spell/CD gaps. Count sums for all-ins.", ["Timers"], "MLA", "trading"),
  R("Good recall", "Shove → recall on spike → arrive first to river.", ["Tempo"], "BrokenByConcept", "tempo"),
  R("Death audit", "Why did you die? Wave, vision, jungle, greed. Name fix.", ["Review"], "BLA", "review"),
];

const GROUP_TABS: Array<{ key: Group | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "quick", label: "Quick" },
  { key: "pregame", label: "Pre-Game" },
  { key: "laning", label: "Laning" },
  { key: "trading", label: "Trading" },
  { key: "tempo", label: "Tempo" },
  { key: "review", label: "Review" },
];

/* ---------- component ---------- */

export default function Reminders() {
  const [items, setItems] = usePersistentState<Reminder[]>(STORE_KEY, SEEDS);
  const [query, setQuery] = React.useState("");
  const [onlyPinned, setOnlyPinned] = React.useState(false);
  const [group, setGroup] = React.useState<Group | "all">("all");
  const [quickAdd, setQuickAdd] = React.useState(""); // Quick Add text

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter(r => (group === "all" ? true : r.group === group))
      .filter(r => (onlyPinned ? r.pinned : true))
      .filter(r => {
        if (!q) return true;
        const hay = [r.title, r.body ?? "", r.tags.join(" "), r.source, r.group].join(" ").toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        if (!!b.pinned === !!a.pinned) return b.updatedAt - a.updatedAt;
        return Number(b.pinned) - Number(a.pinned);
      });
  }, [items, group, onlyPinned, query]);

  function addNewWithTitle(titleText?: string) {
    const title = (titleText ?? "New reminder").trim();
    if (!title) return;
    const now = Date.now();
    const chosenGroup: Group = group === "all" ? "pregame" : group;
    const next: Reminder = {
      id: uid("rem"),
      title,
      body: "",
      tags: [],
      source: "Custom",
      group: chosenGroup,
      pinned: chosenGroup === "quick",
      createdAt: now,
      updatedAt: now,
    };
    setItems(prev => [next, ...prev]);
  }

  function addQuick() {
    const t = quickAdd.trim();
    if (!t) return;
    addNewWithTitle(t);
    setQuickAdd("");
  }

  function patch(id: string, partial: Partial<Reminder>) {
    setItems(prev => prev.map(r => (r.id === id ? { ...r, ...partial, updatedAt: Date.now() } : r)));
  }
  function del(id: string) { setItems(prev => prev.filter(r => r.id !== id)); }
  function dup(id: string) {
    setItems(prev => {
      const src = prev.find(r => r.id === id);
      if (!src) return prev;
      const now = Date.now();
      return [{ ...src, id: uid("rem"), title: `${src.title} (copy)`, createdAt: now, updatedAt: now }, ...prev];
    });
  }
  function resetSeeds() {
    const now = Date.now();
    setItems(SEEDS.map(s => ({ ...s, id: uid("rem"), createdAt: now, updatedAt: now })));
  }

  return (
    <div className="grid gap-3">
      <SectionCard className="card-neo-soft">
        <SectionCard.Header sticky topClassName="top-0">
          {/* header row (no Quick Add here anymore) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full">
            {/* search */}
            <div className="relative flex-1 min-w-[220px]">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-70" />
              <Input
                aria-label="Search reminders"
                placeholder="Search title, text, tags…"
                className="pl-6"
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[hsl(var(--muted-foreground))]">
                {filtered.length}
              </span>
            </div>

            {/* groups */}
            <TabBar
              items={GROUP_TABS.map(t => ({ key: String(t.key), label: t.label }))}
              value={String(group)}
              onValueChange={(k) => setGroup((k === "all" ? "all" : k) as Group | "all")}
              size="md"
              ariaLabel="Group filter"
            />

            {/* pinned */}
            <button
              className={["btn-like-segmented h-10", onlyPinned && "is-active"].filter(Boolean).join(" ")}
              onClick={() => setOnlyPinned(v => !v)}
              aria-pressed={onlyPinned}
              type="button"
              title="Pinned only"
            >
              {onlyPinned ? <PinOff className="mr-1" /> : <Pin className="mr-1" />}
              {onlyPinned ? "Pinned only" : "Any pin"}
            </button>

            {/* actions */}
            <button className="btn-like-segmented h-10" onClick={resetSeeds} type="button" title="Replace with curated seeds">
              Reset
            </button>
          </div>
        </SectionCard.Header>

        {/* Panel body now holds Quick Add + neon quote + cards grid */}
        <SectionCard.Body className="grid gap-3">
          {/* Quick Add row (in the SAME panel as cards) */}
          <div className="sm:p-4 flex items-center gap-4">
            <Input
              aria-label="Quick add"
              placeholder={`Quick add to ${group === "all" ? "Pre-Game" : group.charAt(0).toUpperCase() + group.slice(1)}…`}
              value={quickAdd}
              onChange={(e) => setQuickAdd(e.currentTarget.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addQuick(); } }}
              className="flex-1"
            />
            <IconButton title="Add quick" aria-label="Add quick" onClick={addQuick} size="md" variant="solid">
              <Plus />
            </IconButton>
            <p className="text-xs sm:text-sm italic text-[hsl(var(--muted-foreground))]">
              Stop procrastinating, do it now if you have time
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid card-neo-soft gap-3 sm:gap-4 md:grid-cols-2">
            {filtered.map((r) => (
              <ReminderCard
                key={r.id}
                value={r}
                onChange={(p) => patch(r.id, p)}
                onDelete={() => del(r.id)}
                onDuplicate={() => dup(r.id)}
              />
            ))}

            {filtered.length === 0 && (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Nothing here. Add one or relax your filters.
              </p>
            )}
          </div>
        </SectionCard.Body>
      </SectionCard>
    </div>
  );
}

/* ---------- Card ---------- */

function ReminderCard({
  value,
  onChange,
  onDelete,
  onDuplicate,
}: {
  value: Reminder;
  onChange: (partial: Partial<Reminder>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [title, setTitle] = React.useState(value.title);
  const [body, setBody] = React.useState(value.body ?? "");
  const [tagsText, setTagsText] = React.useState(value.tags.join(", "));
  const titleRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => { if (editing) titleRef.current?.focus(); }, [editing]);

  function save() {
    const cleanTags = tagsText.split(",").map(t => t.trim()).filter(Boolean);
    onChange({ title: title.trim() || "Untitled", body: body.trim(), tags: cleanTags });
    setEditing(false);
  }
  function cancel() {
    setTitle(value.title); setBody(value.body ?? ""); setTagsText(value.tags.join(", ")); setEditing(false);
  }

  return (
    <article className="card-neo rounded-card p-4 sm:p-5 relative">
      {value.pinned && (
        <span aria-hidden className="absolute inset-y-3 left-0 w-[2px] rounded-full bg-[hsl(var(--primary)/.55)]" />
      )}

      <div className="flex items-center justify-between gap-2 mb-2">
        {editing ? (
          <Input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") cancel();
            }}
            aria-label="Title"
            className="font-semibold"
          />
        ) : (
          <h3
            className="font-semibold title-glow cursor-text"
            onClick={() => setEditing(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setEditing(true)}
            title="Click to edit"
          >
            {value.title}
          </h3>
        )}

        <div className="card-neo flex items-center gap-1">
          <IconButton
            title={value.pinned ? "Unpin" : "Pin"}
            aria-label={value.pinned ? "Unpin" : "Pin"}
            onClick={() => onChange({ pinned: !value.pinned })}
            size="sm"
            iconSize="sm"
          >
            {value.pinned ? <PinOff /> : <Pin />}
          </IconButton>
          <IconButton
            title="Duplicate"
            aria-label="Duplicate"
            onClick={onDuplicate}
            size="sm"
            iconSize="sm"
          >
            <Copy />
          </IconButton>
          {editing ? (
            <>
              <IconButton
                title="Save (Enter)"
                aria-label="Save"
                onClick={save}
                size="sm"
                iconSize="sm"
              >
                <Check />
              </IconButton>
              <IconButton
                title="Cancel (Esc)"
                aria-label="Cancel"
                onClick={cancel}
                size="sm"
                iconSize="sm"
              >
                <X />
              </IconButton>
            </>
          ) : (
            <>
              <IconButton
                title="Edit"
                aria-label="Edit"
                onClick={() => setEditing(true)}
                size="sm"
                iconSize="sm"
              >
                <Pencil />
              </IconButton>
              <IconButton
                title="Delete"
                aria-label="Delete"
                onClick={onDelete}
                size="sm"
                iconSize="sm"
              >
                <Trash2 />
              </IconButton>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        {editing ? (
          <>
            <Textarea
              aria-label="Body"
              placeholder="Short, skimmable sentence. Keep it actionable."
              value={body}
              onChange={(e) => setBody(e.currentTarget.value)}
              textareaClassName="min-h-[88px]"
            />
            <Input
              aria-label="Tags (comma separated)"
              placeholder="tags, comma, separated"
              value={tagsText}
              onChange={(e) => setTagsText(e.currentTarget.value)}
            />
            <div className="select-neo-wrap">
              <select
                className="select-neo"
                value={value.group}
                onChange={(e) => onChange({ group: e.currentTarget.value as Group })}
                aria-label="Category"
              >
                <option value="pregame">Pre-Game</option>
                <option value="laning">Laning</option>
                <option value="trading">Trading</option>
                <option value="tempo">Tempo</option>
                <option value="review">Review</option>
                <option value="quick">Quick (pinned)</option>
              </select>
            </div>
          </>
        ) : (
          <>
            {value.body ? (
              <p className="text-sm leading-6 text-[hsl(var(--muted-foreground))]">{value.body}</p>
            ) : (
              <p className="text-sm text-[hsl(var(--muted-foreground))]/80">No text. Click to edit.</p>
            )}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {value.tags.map((t) => <span key={t} className="pill">{t}</span>)}
              <Badge size="xs" tone="neutral" className="opacity-75">{value.group}</Badge>
              <Badge
                size="xs"
                tone={
                  value.source === "MLA" ? "primary"
                  : value.source === "BLA" ? "accent"
                  : value.source === "BrokenByConcept" ? "top"
                  : "neutral"
                }
              >
                {value.source}
              </Badge>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
