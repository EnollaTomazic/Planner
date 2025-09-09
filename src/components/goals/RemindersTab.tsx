// src/components/goals/RemindersTab.tsx
"use client";

/**
 * RemindersTab — Hero header + borderless TabBar everywhere
 * - Domain tabs in Hero.right (Life | League | Learn), neon divider tint matches domain
 * - Bottom search stays in Hero.bottom
 * - Quick Add row now lives inside the SAME panel as the cards (top of SectionCard.Body)
 * - Groups row uses TabBar (badges show per-group counts)
 * - Filters panel (toggle): Source (TabBar) + Pinned chip
 *
* Notes:
* - Removed ad-hoc CSS import ("../goals/style.css") to keep globals as source of truth.
* - Button/IconButton use canonical props; delete uses tone="danger".
* - Typings added to onChange handlers to avoid implicit any.
 */

import * as React from "react";
import SectionCard from "@/components/ui/layout/SectionCard";
import Input from "@/components/ui/primitives/Input";
import Textarea from "@/components/ui/primitives/Textarea";
import Button from "@/components/ui/primitives/Button";
import IconButton from "@/components/ui/primitives/IconButton";
import Hero, { HeroSearchBar } from "@/components/ui/layout/Hero";
import TabBar from "@/components/ui/layout/TabBar";
import { uid, usePersistentState } from "@/lib/db";
import {
  Search,
  SlidersHorizontal,
  Pin,
  PinOff,
  Trash2,
  Sparkles,
  Gamepad2,
  GraduationCap,
  Pencil,
  Plus,
} from "lucide-react";

/* ───────── Types & seeds ───────── */

type Domain = "Life" | "League" | "Learn";
type Source = "MLA" | "BLA" | "BrokenByConcept" | "Custom";
type Group = "quick" | "pregame" | "laning" | "trading" | "tempo" | "review";

type Reminder = {
  id: string;
  title: string;
  body?: string;
  tags: string[];
  source: Source;
  group: Group;
  pinned?: boolean;
  domain?: Domain;
  createdAt: number;
  updatedAt: number;
};

const STORE_KEY = "goals.reminders.v4";

function R(
  title: string,
  body: string,
  tags: string[],
  source: Source,
  group: Group,
  pinned = false,
  domain?: Domain
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
    domain,
    createdAt: now,
    updatedAt: now,
  };
}

const SEEDS: Reminder[] = [
  R("Hit 2 first", "Push 3 melees → step up or respect if losing push.", [], "BLA", "quick", true, "Learn"),
  R(
    "Jungle start check",
    "Track start → first gank lane → second spawn prio.",
    [],
    "BrokenByConcept",
    "quick",
    true,
    "Learn"
  ),
  R("3-wave plan", "Say it: slow then crash 3 OR hold then thin/freeze.", [], "MLA", "pregame", false, "League"),
  R(
    "Ward 2:30",
    "River/tri at 2:30. Sweep before shove.",
    [],
    "BrokenByConcept",
    "pregame",
    false,
    "Learn"
  ),
  R("Space with casters", "Trade when your casters live; back off on enemy wave.", [], "MLA", "laning", false, "League"),
  R("CD punish", "Trade on enemy cooldown gaps; track sums.", [], "MLA", "trading", false, "League"),
  R(
    "Good recall",
    "Shove → recall on spike → arrive first to river.",
    [],
    "BrokenByConcept",
    "tempo",
    false,
    "Learn"
  ),
  R("Death audit", "Wave, vision, jungle, greed. Name the fix.", [], "BLA", "review", false, "Learn"),
];

const DOMAIN_ITEMS: Array<{ key: Domain; label: string; icon: React.ReactNode }> = [
  {
    key: "Life",
    label: "Life",
    icon: <Sparkles className="mr-1" aria-hidden="true" />,
  },
  {
    key: "League",
    label: "League",
    icon: <Gamepad2 className="mr-1" aria-hidden="true" />,
  },
  {
    key: "Learn",
    label: "Learn",
    icon: <GraduationCap className="mr-1" aria-hidden="true" />,
  },
];

const GROUPS: Array<{ key: Group; label: string; hint?: string }> = [
  { key: "quick",   label: "Quick",    hint: "Pin-worthy" },
  { key: "pregame", label: "Pre-Game", hint: "Before queue" },
  { key: "laning",  label: "Laning",   hint: "Wave & trades" },
  { key: "trading", label: "Trading",  hint: "Windows & sums" },
  { key: "tempo",   label: "Tempo",    hint: "Recall & prio" },
  { key: "review",  label: "Review",   hint: "After game" },
];

/* ───────── Utils ───────── */

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const fmtDate = (ts: number) => {
  const d = new Date(ts);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};
const cap = (s: string) => s.slice(0, 1).toUpperCase() + s.slice(1);

/* ───────── Page ───────── */

export default function RemindersTab() {
  const [items, setItems] = usePersistentState<Reminder[]>(STORE_KEY, SEEDS);
  const [query, setQuery] = React.useState("");
  const [onlyPinned, setOnlyPinned] = React.useState(false);
  const [domain, setDomain] = usePersistentState<Domain>(
    "goals.reminders.domain.v2",
    "League",
  );
  const [group, setGroup] = usePersistentState<Group>(
    "goals.reminders.group.v1",
    "quick",
  );
  const [source, setSource] = usePersistentState<Source | "all">(
    "goals.reminders.source.v1",
    "all",
  );
  const [quickAdd, setQuickAdd] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(false);

  const inferDomain = (r: Reminder): Domain =>
    r.domain ?? (r.source === "BLA" || r.source === "BrokenByConcept" ? "Learn" : "League");

  // counts for group badges (per current domain)
  const counts = React.useMemo(() => {
    const domItems = items.filter((r) => inferDomain(r) === domain);
    return domItems.reduce(
      (acc, r) => ((acc[r.group] = (acc[r.group] ?? 0) + 1), acc),
      { quick: 0, pregame: 0, laning: 0, trading: 0, tempo: 0, review: 0 } as Record<Group, number>
    );
  }, [items, domain]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((r) => inferDomain(r) === domain)
      .filter((r) => r.group === group)
      .filter((r) => (source === "all" ? true : r.source === source))
      .filter((r) => (onlyPinned ? r.pinned : true))
      .filter((r) => {
        if (!q) return true;
        const hay = [r.title, r.body ?? "", r.tags.join(" "), r.source, r.group].join(" ").toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        if (!!b.pinned === !!a.pinned) return b.updatedAt - a.updatedAt;
        return Number(b.pinned) - Number(a.pinned);
      });
  }, [items, domain, group, source, onlyPinned, query]);

  function addNew(initialTitle?: string) {
    const now = Date.now();
    const next: Reminder = {
      id: uid("rem"),
      title: (initialTitle ?? "New reminder").trim() || "New reminder",
      body: "",
      tags: [],
      source: domain === "Learn" ? "BLA" : "Custom",
      group,
      domain,
      pinned: group === "quick",
      createdAt: now,
      updatedAt: now,
    };
    setItems((prev) => [next, ...prev]);
    setQuickAdd("");
  }

  const update = (id: string, partial: Partial<Reminder>) =>
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, ...partial, updatedAt: Date.now() } : r)));

  const remove = (id: string) => setItems((prev) => prev.filter((r) => r.id !== id));

  const showGroups = domain === "League" || domain === "Learn";
  const neonClass = domain === "Life" ? "neon-life" : "neon-primary";

  // TabBar items
  const DOMAIN_TABS = DOMAIN_ITEMS.map(d => ({ key: d.key, label: d.label, icon: d.icon }));
  const GROUP_TABS = GROUPS.map(g => ({
    key: g.key,
    label: g.label,
    badge: counts[g.key], // numeric pill
  }));
  const SOURCE_TABS = (["all", "MLA", "BLA", "BrokenByConcept", "Custom"] as Array<"all" | Source>).map(s => ({
    key: s,
    label: s === "all" ? "All" : s,
  }));

  return (
    <div className="grid gap-4">
      {/* Hero with domain TabBar and bottom search */}
      <Hero
        eyebrow={domain}
        heading="Reminders"
        subtitle="Tiny brain pings you’ll totally ignore until 23:59."
        dividerTint={domain === "Life" ? "life" : "primary"}
        right={
          <TabBar
            items={DOMAIN_TABS}
            value={domain}
            onValueChange={(k) => setDomain(k as Domain)}
            align="end"
            size="md"
            ariaLabel="Reminder domain"
            showBaseline
          />
        }
        bottom={
          <HeroSearchBar
            value={query}
            onValueChange={setQuery}
            placeholder="Search title, text, tags…"
            debounceMs={80}
            right={
              <div className="flex items-center gap-2">
                <span className="text-xs opacity-75">{filtered.length}</span>
                <Search className="opacity-80" size={16} aria-hidden="true" />
              </div>
            }
          />
        }
      />

      <SectionCard className="goal-card">
        <SectionCard.Body>
          <div className="grid gap-3">
            {/* Quick Add row — now INSIDE the same panel as the cards */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (quickAdd.trim()) addNew(quickAdd);
              }}
              className="rounded-card flex items-center gap-6 glitch"
            >
              <Input
                aria-label="Quick add reminder"
                placeholder={`Quick add to ${GROUPS.find((g) => g.key === group)?.label ?? "Group"}…`}
                value={quickAdd}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuickAdd(e.currentTarget.value)}
                className="flex-1"
              />
              <IconButton title="Add quick" aria-label="Add quick" type="submit" size="md" variant="solid">
                <Plus size={16} aria-hidden="true" />
              </IconButton>
              <div className={neonClass}>
                <p className="neon-note text-xs italic">Stop procrastinating, do it now if you have time</p>
              </div>
            </form>

            {/* Groups row (League/Learn) with Filters toggle on the right */}
            {showGroups && (
              <TabBar
                items={GROUP_TABS}
                value={group}
                onValueChange={(k) => setGroup(k as Group)}
                ariaLabel="Reminder group"
                size="md"
                align="between"
                right={
                  <button
                    className={["btn-like-segmented inline-flex items-center gap-1", showFilters && "is-active"]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setShowFilters((v) => !v)}
                    aria-expanded={showFilters}
                    title="Filters"
                    type="button"
                  >
                    <SlidersHorizontal />
                    Filters
                  </button>
                }
              />
            )}

            {/* Filters panel (collapsible) */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-4 pl-[2px]">
                <TabBar
                  items={SOURCE_TABS}
                  value={source}
                  onValueChange={(k) => setSource(k as Source | "all")}
                  ariaLabel="Reminder source filter"
                  size="sm"
                />
                <button
                  type="button"
                  onClick={() => setOnlyPinned((v) => !v)}
                  aria-pressed={onlyPinned}
                  className={["btn-like-segmented", onlyPinned && "is-active"].filter(Boolean).join(" ")}
                  title="Pinned only"
                >
                  {onlyPinned ? (
                    <PinOff className="mr-1" aria-hidden="true" />
                  ) : (
                    <Pin className="mr-1" aria-hidden="true" />
                  )}
                  {onlyPinned ? "Pinned only" : "Any pin"}
                </button>
              </div>
            )}

            {/* Cards grid */}
            <div className="grid gap-3 md:grid-cols-2">
              {filtered.map((r) => (
                <RemTile
                  key={r.id}
                  value={r}
                  onChange={(p) => update(r.id, p)}
                  onDelete={() => remove(r.id)}
                />
              ))}
            </div>

            {filtered.length === 0 && <EmptyState />}
          </div>
        </SectionCard.Body>

        {/* Local styles: keep neon-note flicker; divider is handled by Hero */}
        <style jsx>{`
          .neon-primary { --neon: var(--primary); }
          .neon-life { --neon: var(--accent); }

          .neon-note {
            margin-top: -6px;
            padding-left: 2px;
            color: hsl(var(--neon));
            text-shadow:
              0 0 4px hsl(var(--neon) / 0.55),
              0 0 10px hsl(var(--neon) / 0.35),
              0 0 18px hsl(var(--neon) / 0.2);
            animation: neon-flicker 4s infinite;
          }

          @keyframes neon-flicker {
            0%, 17%, 22%, 26%, 52%, 100% { opacity: 1; }
            18% { opacity: .72; }
            24% { opacity: .55; }
            54% { opacity: .78; }
            70% { opacity: .62; }
            74% { opacity: 1; }
          }

          @media (prefers-reduced-motion: reduce) {
            .neon-note { animation: none; }
          }
        `}</style>
      </SectionCard>
    </div>
  );
}

/* ───────── UI bits ───────── */

function EmptyState() {
  return (
    <div className="goal-card rounded-card ds-card-pad text-sm text-muted-foreground grid place-items-center">
      <p>Nothing here. Add one clear sentence you’ll read in champ select.</p>
    </div>
  );
}

/* ───────── Tile (goals-style, globals-driven) ───────── */

function RemTile({
  value,
  onChange,
  onDelete,
}: {
  value: Reminder;
  onChange: (p: Partial<Reminder>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [title, setTitle] = React.useState(value.title);
  const [body, setBody] = React.useState(value.body ?? "");
  const [tagsText, setTagsText] = React.useState(value.tags.join(", "));
  const titleRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (editing) titleRef.current?.focus();
  }, [editing]);

  function save() {
    const cleanTags = tagsText.split(",").map((t) => t.trim()).filter(Boolean);
    onChange({ title: title.trim() || "Untitled", body: body.trim(), tags: cleanTags });
    setEditing(false);
  }

  const pinned = !!value.pinned;

  return (
    <article className="card-neo rounded-card card-pad relative group">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          {editing ? (
            <Input
              ref={titleRef}
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.currentTarget.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && save()}
              aria-label="Title"
              className="font-semibold uppercase tracking-wide"
            />
          ) : (
            <h4
              className="font-semibold uppercase tracking-wide pr-2 title-glow glitch cursor-text leading-6"
              onClick={() => {
                setEditing(true);
                setTimeout(() => titleRef.current?.focus(), 0);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setEditing(true)}
              title="Click to edit"
            >
              {value.title}
            </h4>
          )}
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            title="Edit"
            aria-label="Edit"
            onClick={() => {
              setEditing(true);
              setTimeout(() => titleRef.current?.focus(), 0);
            }}
            size="sm"
            iconSize="sm"
            className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity"
          >
            <Pencil aria-hidden="true" />
          </IconButton>

          <IconButton
            title="Delete"
            aria-label="Delete"
            onClick={onDelete}
            size="sm"
            iconSize="sm"
            variant="ring"
            className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity"
          >
            <Trash2 aria-hidden="true" />
          </IconButton>

          <IconButton
            aria-pressed={pinned}
            title={pinned ? "Unpin" : "Pin"}
            aria-label={pinned ? "Unpin" : "Pin"}
            onClick={() => onChange({ pinned: !pinned })}
            size="sm"
            iconSize="sm"
          >
            {pinned ? (
              <PinOff aria-hidden="true" />
            ) : (
              <Pin aria-hidden="true" />
            )}
          </IconButton>
        </div>
      </div>

      {/* Body + meta */}
      <div className="mt-2 space-y-3">
        {editing ? (
          <>
            <label className="text-xs opacity-70">Note</label>
            <Textarea
              aria-label="Body"
              placeholder="Short, skimmable sentence."
              value={body}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setBody(e.currentTarget.value)
              }
              className="rounded-2xl"
              resize="resize-y"
              textareaClassName="min-h-[160px] leading-relaxed"
            />

            <label className="text-xs opacity-70">Tags</label>
            <Input
              aria-label="Tags (comma separated)"
              placeholder="tags, comma, separated"
              value={tagsText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagsText(e.currentTarget.value)}
            />

            <div className="segmented inline-flex">
              {(["pregame", "laning", "trading", "tempo", "review", "quick"] as Group[]).map((g) => (
                <button
                  key={g}
                  className={["btn-like-segmented", value.group === g && "is-active"].filter(Boolean).join(" ")}
                  onClick={() => onChange({ group: g })}
                  type="button"
                >
                  {g === "pregame" ? "Pre-Game" : cap(g)}
                </button>
              ))}
            </div>

            <div className="segmented inline-flex">
              {(["MLA", "BLA", "BrokenByConcept", "Custom"] as Source[]).map((s) => (
                <button
                  key={s}
                  className={["btn-like-segmented", value.source === s && "is-active"].filter(Boolean).join(" ")}
                  onClick={() => onChange({ source: s })}
                  type="button"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="segmented inline-flex">
              {(["Life", "League", "Learn"] as Domain[]).map((d) => (
                <button
                  key={d}
                  className={["btn-like-segmented", (value.domain ?? "League") === d && "is-active"].filter(Boolean).join(" ")}
                  onClick={() => onChange({ domain: d })}
                  type="button"
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={save}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  setTitle(value.title);
                  setBody(value.body ?? "");
                  setTagsText(value.tags.join(", "));
                }}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm">
              <span className="opacity-70">Note:</span>{" "}
              {value.body || <span className="opacity-60">No text. Click title to edit.</span>}
            </p>

            <div className="mt-1 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: "var(--accent-overlay)" }}
                />
                <span className="text-xs">{fmtDate(value.createdAt)}</span>
              </div>

              <button
                className="text-xs underline underline-offset-2 text-[hsl(var(--primary))] hover:brightness-75"
                onClick={() => onChange({ pinned: !pinned })}
                title={pinned ? "Unpin" : "Pin"}
                type="button"
              >
                {pinned ? "Pinned" : "Pin"}
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
