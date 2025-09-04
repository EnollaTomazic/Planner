"use client";

// Full Review Editor with icon-only header actions and RoleSelector rail control.
import "../reviews/style.css";
import RoleSelector from "@/components/reviews/RoleSelector";

import * as React from "react";
import type { Review, Pillar, Role } from "@/lib/types";
import Input from "@/components/ui/primitives/input";
import Textarea from "@/components/ui/primitives/textarea";
import IconButton from "@/components/ui/primitives/IconButton";
import PillarBadge from "@/components/ui/league/pillars/PillarBadge";
import {
  Tag,
  Trash2,
  Save,
  Check,
  Target,
  Shield,
  Plus,
  Clock,
  FileText,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uid, useLocalDB } from "@/lib/db";
import {
  ALL_PILLARS,
  LAST_ROLE_KEY,
  LAST_MARKER_MODE_KEY,
  LAST_MARKER_TIME_KEY,
  SCORE_POOLS,
  FOCUS_POOLS,
  pickIndex,
  scoreIcon,
} from "@/components/reviews/reviewData";

/** Faint section label + rule used throughout the form. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <div className="text-xs tracking-wide text-white/20">{children}</div>
      <div className="h-px flex-1 bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
    </div>
  );
}

/** Parse "m:ss" or "mm:ss" into seconds. Returns null for invalid input. */
function parseTime(mmss: string): number | null {
  const m = mmss.trim().match(/^(\d{1,2}):([0-5]\d)$/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Convert seconds to "m:ss" with zero-padded seconds. */
function formatSeconds(total: number): string {
  const minutes = Math.max(0, Math.floor(total / 60));
  const seconds = Math.max(0, total % 60);
  return `${String(minutes)}:${String(seconds).padStart(2, "0")}`;
}

type Result = "Win" | "Loss";

export type Marker = {
  id: string;
  time: string;
  seconds: number;
  note: string;
  noteOnly?: boolean;
};

type ExtendedProps = {
  result?: Result;
  score?: number;
  role?: Role;
  markers?: Marker[];
  focusOn?: boolean;
  focus?: number;
};

type MetaPatch = Omit<Partial<Review>, "role"> & Partial<ExtendedProps>;

function NeonIcon({
  kind,
  on,
  size = 40,
  title,
}: {
  kind: "clock" | "file" | "brain";
  on: boolean;
  size?: number;
  title?: string;
}) {
  const Icon = kind === "clock" ? Clock : kind === "file" ? FileText : Brain;
  const colorVar = kind === "clock" ? "--accent" : kind === "brain" ? "--primary" : "--ring";

  const prevOn = React.useRef(on);
  const [phase, setPhase] = React.useState<"steady-on" | "ignite" | "off" | "powerdown">(
    on ? "steady-on" : "off"
  );

  React.useEffect(() => {
    if (on !== prevOn.current) {
      if (on) {
        setPhase("ignite");
        const t = setTimeout(() => setPhase("steady-on"), 620);
        prevOn.current = on;
        return () => clearTimeout(t);
      } else {
        setPhase("powerdown");
        const t = setTimeout(() => setPhase("off"), 360);
        prevOn.current = on;
        return () => clearTimeout(t);
      }
    }
    prevOn.current = on;
  }, [on]);

  const lit = phase === "ignite" || phase === "steady-on";
  const dimOpacity = lit ? 1 : 0.38;
  const k = Math.round(size * 0.56);

  return (
    <span
      className={cn(
        "relative inline-grid place-items-center overflow-visible rounded-full border",
        "border-[hsl(var(--border))] bg-[hsl(var(--card)/.35)]"
      )}
      style={{ width: size, height: size }}
      aria-hidden
      title={title}
    >
      <Icon
        className="relative z-10"
        style={{
          width: k,
          height: k,
          strokeWidth: 2,
          color: `hsl(var(${colorVar}))`,
          opacity: dimOpacity,
          transition: "opacity 220ms var(--ease-out), transform 220ms var(--ease-out)",
          transform:
            phase === "ignite" ? "scale(1.02)" : phase === "powerdown" ? "scale(0.985)" : "scale(1)",
        }}
      />
      <Icon
        className={cn("absolute", lit ? "animate-[neonCore_2.8s_ease-in-out_infinite]" : "")}
        style={{
          width: k,
          height: k,
          color: `hsl(var(${colorVar}))`,
          opacity: lit ? 0.78 : 0.06,
          filter: `blur(2.5px) drop-shadow(0 0 12px hsl(var(${colorVar})))`,
          transition: "opacity 220ms var(--ease-out)",
        }}
      />
      <Icon
        className={cn("absolute", lit ? "animate-[neonAura_3.6s_ease-in-out_infinite]" : "")}
        style={{
          width: k,
          height: k,
          color: `hsl(var(${colorVar}))`,
          opacity: lit ? 0.42 : 0.04,
          filter: `blur(7px) drop-shadow(0 0 22px hsl(var(${colorVar})))`,
          transition: "opacity 220ms var(--ease-out)",
        }}
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full mix-blend-overlay",
          lit ? "opacity-35 animate-[crtScan_2.1s_linear_infinite]" : "opacity-0"
        )}
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,.07) 0 1px, transparent 1px 3px)",
          transition: "opacity 220ms var(--ease-out)",
        }}
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full",
          phase === "ignite" && "animate-[igniteFlicker_.62s_steps(18,end)_1]"
        )}
        style={{
          background:
            "radial-gradient(80% 80% at 50% 50%, rgba(255,255,255,.25), transparent 60%)",
          mixBlendMode: "screen",
          opacity: phase === "ignite" ? 0.85 : 0,
        }}
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full",
          phase === "powerdown" && "animate-[powerDown_.36s_linear_1]"
        )}
        style={{
          background:
            "radial-gradient(120% 120% at 50% 50%, rgba(255,255,255,.16), transparent 60%)",
          mixBlendMode: "screen",
          opacity: phase === "powerdown" ? 0.6 : 0,
        }}
      />
      <style jsx>{`
        @keyframes neonCore {
          0% { opacity:.66; transform:scale(1) }
          50%{ opacity:.88; transform:scale(1.012) }
          100%{ opacity:.66; transform:scale(1) }
        }
        @keyframes neonAura {
          0% { opacity:.32 }
          50%{ opacity:.52 }
          100%{ opacity:.32 }
        }
        @keyframes crtScan {
          0% { transform: translateY(-28%) }
          100%{ transform: translateY(28%) }
        }
        @keyframes igniteFlicker {
          0%{ opacity:.1; filter:blur(.6px) }
          8%{ opacity:1 }
          12%{ opacity:.25 }
          20%{ opacity:1 }
          28%{ opacity:.35 }
          40%{ opacity:1 }
          55%{ opacity:.45; filter:blur(.2px) }
          70%{ opacity:1 }
          100%{ opacity:0 }
        }
        @keyframes powerDown {
          0%{ opacity:.8; transform:scale(1) }
          30%{ opacity:.35; transform:scale(.992) translateY(.2px) }
          60%{ opacity:.12; transform:scale(.985) translateY(-.2px) }
          100%{ opacity:0; transform:scale(.985) }
        }
      `}</style>
    </span>
  );
}

function NeonPillarChip({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  const prev = React.useRef(active);
  const [phase, setPhase] = React.useState<"steady-on" | "ignite" | "off" | "powerdown">(
    active ? "steady-on" : "off"
  );

  React.useEffect(() => {
    if (active !== prev.current) {
      if (active) {
        setPhase("ignite");
        const t = setTimeout(() => setPhase("steady-on"), 620);
        prev.current = active;
        return () => clearTimeout(t);
      } else {
        setPhase("powerdown");
        const t = setTimeout(() => setPhase("off"), 360);
        prev.current = active;
        return () => clearTimeout(t);
      }
    }
    prev.current = active;
  }, [active]);

  const lit = phase === "ignite" || phase === "steady-on";

  return (
    <span className="relative inline-flex">
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl",
          lit ? "opacity-60" : "opacity-0"
        )}
        style={{
          filter: "blur(10px)",
          background:
            "radial-gradient(60% 60% at 50% 50%, hsl(var(--accent)/.45), transparent 70%)",
          transition: "opacity 220ms var(--ease-out)",
        }}
        aria-hidden
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl",
          lit ? "opacity-40 animate-[neonAura_3.6s_ease-in-out_infinite]" : "opacity-0"
        )}
        style={{
          filter: "blur(14px)",
          background:
            "radial-gradient(80% 80% at 50% 50%, hsl(var(--primary)/.35), transparent 75%)",
          transition: "opacity 220ms var(--ease-out)",
        }}
        aria-hidden
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl",
          lit ? "animate-[igniteFlicker_.62s_steps(18,end)_1]" : ""
        )}
        style={{
          background:
            "radial-gradient(80% 80% at 50% 50%, rgba(255,255,255,.22), transparent 60%)",
          mixBlendMode: "screen",
          opacity: lit ? 0.8 : 0,
        }}
        aria-hidden
      />
      <span className="relative z-10">{children}</span>
    </span>
  );
}

function getExt(r: Review): Partial<ExtendedProps> {
  return r as unknown as Partial<ExtendedProps>;
}
function normalizeMarker(m: unknown): Marker {
  const obj = (typeof m === "object" && m !== null ? m : {}) as Record<string, unknown>;
  const asNum = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
  const asStr = (v: unknown) => (typeof v === "string" ? v : undefined);

  const seconds = asNum(obj.seconds) ?? (asStr(obj.time) ? parseTime(asStr(obj.time)!) ?? 0 : 0);

  const timeStr = asStr(obj.time) ?? formatSeconds(seconds);
  return {
    id: asStr(obj.id) ?? uid("mark"),
    time: timeStr,
    seconds,
    note: asStr(obj.note) ?? "",
    noteOnly: Boolean(obj.noteOnly),
  };
}

export default function ReviewEditor({
  review,
  onChangeNotes,
  onChangeTags,
  onRename,
  onChangeMeta,
  onDone,
  onDelete,
  className = "",
}: {
  review: Review;
  onChangeNotes?: (value: string) => void;
  onChangeTags?: (values: string[]) => void;
  onRename?: (title: string) => void;
  onChangeMeta?: (partial: MetaPatch) => void;
  onDone?: () => void;
  onDelete?: () => void;
  className?: string;
}) {
  const [notes, setNotes] = React.useState(review.notes ?? "");
  const [tags, setTags] = React.useState<string[]>(Array.isArray(review.tags) ? review.tags : []);
  const [draftTag, setDraftTag] = React.useState("");

  const [opponent, setOpponent] = React.useState(review.opponent ?? "");
  const [lane, setLane] = React.useState(review.lane ?? review.title ?? "");
  const [pillars, setPillars] = React.useState<Pillar[]>(
    Array.isArray(review.pillars) ? review.pillars : []
  );

  const [lastRole, setLastRole] = useLocalDB<Role>(LAST_ROLE_KEY, "MID");
  const [lastMarkerMode, setLastMarkerMode] = useLocalDB<boolean>(LAST_MARKER_MODE_KEY, true);
  const [lastMarkerTime, setLastMarkerTime] = useLocalDB<string>(LAST_MARKER_TIME_KEY, "");
  const ext0 = getExt(review);
  const initialRole: Role = ext0.role ?? lastRole ?? "MID";
  const [role, setRole] = React.useState<Role>(initialRole);

  const [result, setResult] = React.useState<Result>(ext0.result ?? "Win");
  const [score, setScore] = React.useState<number>(
    Number.isFinite(ext0.score ?? NaN) ? Number(ext0.score) : 5
  );

  const [focusOn, setFocusOn] = React.useState<boolean>(Boolean(ext0.focusOn));
  const [focus, setFocus] = React.useState<number>(
    Number.isFinite(ext0.focus ?? NaN) ? Number(ext0.focus) : 5
  );

  const [markers, setMarkers] = React.useState<Marker[]>(
    Array.isArray(ext0.markers) ? ext0.markers.map(normalizeMarker) : []
  );

  const [useTimestamp, setUseTimestamp] = React.useState(lastMarkerMode);
  const [tTime, setTTime] = React.useState(lastMarkerTime);
  const [tNote, setTNote] = React.useState("");

  const laneRef = React.useRef<HTMLInputElement>(null);
  const opponentRef = React.useRef<HTMLInputElement>(null);
  const resultRef = React.useRef<HTMLButtonElement>(null);
  const scoreRangeRef = React.useRef<HTMLInputElement>(null);
  const focusRangeRef = React.useRef<HTMLInputElement>(null);
  const timeRef = React.useRef<HTMLInputElement>(null);
  const noteRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const ext = getExt(review);
    setNotes(review.notes ?? "");
    setTags(Array.isArray(review.tags) ? review.tags : []);
    setDraftTag("");

    setOpponent(review.opponent ?? "");
    setLane(review.lane ?? review.title ?? "");
    setPillars(Array.isArray(review.pillars) ? review.pillars : []);

    setResult(ext.result ?? "Win");
    setScore(Number.isFinite(ext.score ?? NaN) ? Number(ext.score) : 5);

    const r = ext.role ?? lastRole ?? "MID";
    setRole(r);

    // If it's a new review (no role yet), immediately persist the remembered role
    if (ext.role == null) {
      setLastRole(r);          // keep local memory in sync
      onChangeMeta?.({ role: r });
    }

    setFocusOn(Boolean(ext.focusOn));
    setFocus(Number.isFinite(ext.focus ?? NaN) ? Number(ext.focus) : 5);

    setMarkers(Array.isArray(ext.markers) ? ext.markers.map(normalizeMarker) : []);
    setUseTimestamp(lastMarkerMode);
    setTTime(lastMarkerTime);
    setTNote("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [review.id]);

  const commitMeta = (partial: MetaPatch) => onChangeMeta?.(partial);
  const commitLaneAndTitle = () => {
    const t = (lane || "").trim();
    onRename?.(t);
    commitMeta({ lane: t });
  };
  const commitNotes = () => onChangeNotes?.(notes);

  const extNow = getExt(review);
  const isDirty =
    notes !== (review.notes ?? "") ||
    (extNow.result ?? "Win") !== result ||
    Number(extNow.score ?? NaN) !== score ||
    Boolean(extNow.focusOn) !== focusOn ||
    Number(extNow.focus ?? NaN) !== focus ||
    (review.lane ?? review.title ?? "") !== (lane ?? "") ||
    opponent !== (review.opponent ?? "") ||
    role !== (extNow.role ?? undefined) ||
    JSON.stringify(tags) !== JSON.stringify(review.tags ?? []) ||
    JSON.stringify(pillars) !== JSON.stringify(review.pillars ?? []) ||
    JSON.stringify(markers) !== JSON.stringify(extNow.markers ?? []);

  function saveAll() {
    commitLaneAndTitle();
    commitNotes();
    onChangeTags?.(tags);
    onChangeMeta?.({
      opponent,
      pillars,
      result,
      score,
      role,
      markers,
      focusOn,
      focus,
    });
  }

  const sortedMarkers = React.useMemo(
    () => [...markers].sort((a, b) => a.seconds - b.seconds),
    [markers]
  );

  function togglePillar(p: Pillar) {
    setPillars((prev) => {
      const has = prev.includes(p);
      const next = has ? prev.filter((x) => x !== p) : prev.concat(p);
      commitMeta({ pillars: next });
      return next;
    });
  }
  function addTag(tagRaw: string) {
    const t = tagRaw.trim().replace(/^#/, "");
    if (!t || tags.includes(t)) return;
    const next = [...tags, t];
    setTags(next);
    onChangeTags?.(next);
  }
  function removeTag(t: string) {
    const next = tags.filter((x) => x !== t);
    setTags(next);
    onChangeTags?.(next);
  }

  const canAddMarker = (useTimestamp ? parseTime(tTime) !== null : true) && tNote.trim().length > 0;

  function addMarker() {
    const s = useTimestamp ? parseTime(tTime) : 0;
    const safeS = s === null ? 0 : s;
    const m: Marker = {
      id: uid("mark"),
      time: useTimestamp ? tTime.trim() || "00:00" : "00:00",
      seconds: safeS,
      note: tNote.trim(),
      noteOnly: !useTimestamp,
    };
    const next = [...markers, m];
    setMarkers(next);
    commitMeta({ markers: next });
    setTTime("");
    setTNote("");
    (useTimestamp ? timeRef : noteRef).current?.focus();
  }
  function removeMarker(id: string) {
    const next = markers.filter((m) => m.id !== id);
    setMarkers(next);
    commitMeta({ markers: next });
  }

  const msgIndex = pickIndex(String(review.id ?? "seed") + String(score), 5);
  const pool = SCORE_POOLS[score] ?? SCORE_POOLS[5];
  const msg = pool[msgIndex];
  const { Icon: ScoreIcon, cls: scoreIconCls } = scoreIcon(score);

  const focusMsgIndex = pickIndex(String(review.id ?? "seed-focus") + String(focus), 10);
  const focusMsg = (FOCUS_POOLS[focus] ?? FOCUS_POOLS[5])[focusMsgIndex % 10];

  const go = (ref: React.RefObject<HTMLElement>) => ref.current?.focus();

  function selectRole(v: Role) {
    setRole(v);
    setLastRole(v); // persist globally
    commitMeta({ role: v });
  }

  function onIconKey(e: React.KeyboardEvent, handler: () => void) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handler();
    }
  }

  return (
    <div className={cn("card-neo-soft r-card-lg overflow-hidden transition-none", className)}>
      <div className="section-h sticky">
        <div className="grid w-full grid-cols-[1fr_auto] items-center gap-4">
          <div className="min-w-0">
            <div className="mb-2">
              <SectionLabel>Lane</SectionLabel>
              <RoleSelector value={role} onChange={selectRole} />
            </div>

            <div className="mb-2">
              <div className="relative">
                <Target className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={laneRef}
                  value={lane}
                  onChange={(e) => setLane(e.target.value)}
                  onBlur={commitLaneAndTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitLaneAndTitle();
                      go(opponentRef);
                    }
                  }}
                  className="h-10 rounded-2xl pl-9"
                  placeholder="Ashe/Lulu"
                  aria-label="Lane (used as Title)"
                />
              </div>
            </div>

            <div>
              <SectionLabel>Opponent</SectionLabel>
              <div className="relative">
                <Shield className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={opponentRef}
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  onBlur={() => commitMeta({ opponent })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      go(resultRef);
                    }
                  }}
                  placeholder="Draven/Thresh"
                  className="h-10 rounded-2xl pl-9"
                  aria-label="Opponent"
                />
              </div>
            </div>
          </div>

          <div className="ml-2 flex shrink-0 items-center justify-end gap-2 self-start">
            <IconButton
              aria-label="Save"
              title={isDirty ? "Save changes" : "Nothing to save"}
              disabled={!isDirty}
              circleSize="md"
              iconSize="md"
              variant="ring"
              onClick={saveAll}
            >
              <Save />
            </IconButton>

            {onDelete ? (
              <IconButton
                aria-label="Delete review"
                title="Delete review"
                circleSize="md"
                iconSize="md"
                variant="ring"
                onClick={onDelete}
              >
                <Trash2 />
              </IconButton>
            ) : null}

            {onDone ? (
              <IconButton
                aria-label="Done"
                title="Save and close"
                circleSize="md"
                iconSize="md"
                variant="ring"
                onClick={() => {
                  saveAll();
                  onDone?.();
                }}
              >
                <Check />
              </IconButton>
            ) : null}
          </div>
        </div>
      </div>

      <div className="section-b ds-card-pad space-y-6">
        {/* Result */}
        <div>
          <SectionLabel>Result</SectionLabel>
          <button
            ref={resultRef}
            type="button"
            role="switch"
            aria-checked={result === "Win"}
            onClick={() => setResult((p) => (p === "Win" ? "Loss" : "Win"))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setResult((p) => (p === "Win" ? "Loss" : "Win"));
                go(scoreRangeRef);
              }
            }}
            className={cn(
              "relative inline-flex h-10 w-48 select-none items-center overflow-hidden rounded-2xl",
              "border border-[hsl(var(--border))] bg-[hsl(var(--card))]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
            )}
            title="Toggle Win/Loss"
          >
            <span
              aria-hidden
              className="absolute top-1 bottom-1 left-1 rounded-xl transition-transform duration-300"
              style={{
                width: "calc(50% - 4px)",
                transform: `translate3d(${result === "Win" ? "0" : "calc(100% + 2px)"},0,0)`,
                transitionTimingFunction: "cubic-bezier(.22,1,.36,1)",
                background:
                  result === "Win"
                    ? "linear-gradient(90deg, hsla(160,90%,45%,.32), hsla(190,90%,60%,.28))"
                    : "linear-gradient(90deg, hsla(0,90%,55%,.30), hsla(320,90%,65%,.26))",
                boxShadow: "0 10px 30px hsl(var(--shadow-color) / .25)",
              }}
            />
            <div className="relative z-10 grid w-full grid-cols-2 text-sm font-mono">
              <div
                className={cn(
                  "py-2 text-center",
                  result === "Win" ? "text-white" : "text-[hsl(var(--muted-foreground))]"
                )}
              >
                Win
              </div>
              <div
                className={cn(
                  "py-2 text-center",
                  result === "Loss" ? "text-white" : "text-[hsl(var(--muted-foreground))]"
                )}
              >
                Loss
              </div>
            </div>
          </button>
        </div>

        {/* Score */}
        <div>
          <SectionLabel>Score</SectionLabel>
          <div className="relative h-12 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4">
            <input
              ref={scoreRangeRef}
              type="range"
              min={0}
              max={10}
              step={1}
              value={score}
              onChange={(e) => {
                const v = Number(e.target.value);
                setScore(v);
                commitMeta({ score: v });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  go(timeRef);
                }
              }}
              className="absolute inset-0 z-10 cursor-pointer opacity-0 [appearance:none]"
              aria-label="Score from 0 to 10"
            />
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2">
              <div className="relative h-2 w-full rounded-full bg-[hsl(var(--muted))]">
                <div
                  className="absolute left-0 top-0 h-2 rounded-full"
                  style={{
                    width: `calc(${(score / 10) * 100}% + 10px)`,
                    background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))",
                    boxShadow: "0 0 16px hsl(var(--primary)/.35)",
                  }}
                />
                <div
                  className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[0_10px_25px_hsl(var(--shadow-color)/.25)]"
                  style={{ left: `calc(${(score / 10) * 100}% - 10px)` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[13px] text-muted-foreground">
            <span className="pill h-6 px-2 text-xs">{score}/10</span>
            <ScoreIcon className={cn("h-4 w-4", scoreIconCls)} />
            <span>{msg}</span>
          </div>
        </div>

        {/* Focus */}
        <div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={focusOn ? "Brain light on" : "Brain light off"}
              aria-pressed={focusOn}
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
              onClick={() => {
                const v = !focusOn;
                setFocusOn(v);
                commitMeta({ focusOn: v });
                if (v) focusRangeRef.current?.focus();
              }}
              onKeyDown={(e) =>
                onIconKey(e, () => {
                  const v = !focusOn;
                  setFocusOn(v);
                  commitMeta({ focusOn: v });
                  if (v) focusRangeRef.current?.focus();
                })
              }
            >
              <NeonIcon kind="brain" on={focusOn} />
            </button>
          </div>

          {focusOn && (
            <>
              <div className="mt-3 relative h-12 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4">
                <input
                  ref={focusRangeRef}
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={focus}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setFocus(v);
                    commitMeta({ focus: v });
                  }}
                  className="absolute inset-0 z-10 cursor-pointer opacity-0 [appearance:none]"
                  aria-label="Focus from 0 to 10"
                />
                <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2">
                  <div className="relative h-2 w-full rounded-full bg-[hsl(var(--muted))]">
                    <div
                      className="absolute left-0 top-0 h-2 rounded-full"
                      style={{
                        width: `calc(${(focus / 10) * 100}% + 10px)`,
                        background:
                          "linear-gradient(90deg, hsl(var(--accent)), hsl(var(--primary)))",
                        boxShadow: "0 0 16px hsl(var(--accent)/.35)",
                      }}
                    />
                    <div
                      className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[0_10px_25px_hsl(var(--shadow-color)/.25)]"
                      style={{ left: `calc(${(focus / 10) * 100}% - 10px)` }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[13px] text-muted-foreground">
                <span className="pill h-6 px-2 text-xs">{focus}/10</span>
                <span>{focusMsg}</span>
              </div>
            </>
          )}
        </div>

        {/* Pillars */}
        <div>
          <SectionLabel>Pillars</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {ALL_PILLARS.map((p) => {
              const active = pillars.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePillar(p)}
                  onKeyDown={(e) => onIconKey(e, () => togglePillar(p))}
                  aria-pressed={active}
                  className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                  title={active ? `${p} selected` : `Select ${p}`}
                >
                  <NeonPillarChip active={active}>
                    <PillarBadge pillar={p} size="md" interactive active={active} />
                  </NeonPillarChip>
                </button>
              );
            })}
          </div>
        </div>

        {/* Timestamps */}
        <div>
          <div className="mb-3 flex items-center gap-3">
            <button
              type="button"
              aria-label="Use timestamp"
              aria-pressed={useTimestamp}
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
              onClick={() => {
                setUseTimestamp(true);
                setLastMarkerMode(true);
                setTTime(lastMarkerTime);
              }}
              onKeyDown={(e) =>
                onIconKey(e, () => {
                  setUseTimestamp(true);
                  setLastMarkerMode(true);
                  setTTime(lastMarkerTime);
                })
              }
              title="Timestamp mode"
            >
              <NeonIcon kind="clock" on={useTimestamp} />
            </button>

            <button
              type="button"
              aria-label="Use note only"
              aria-pressed={!useTimestamp}
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
              onClick={() => {
                setUseTimestamp(false);
                setLastMarkerMode(false);
              }}
              onKeyDown={(e) =>
                onIconKey(e, () => {
                  setUseTimestamp(false);
                  setLastMarkerMode(false);
                })
              }
              title="Note-only mode"
            >
              <NeonIcon kind="file" on={!useTimestamp} />
            </button>
          </div>

          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            {useTimestamp ? (
              <Input
                ref={timeRef}
                value={tTime}
                onChange={(e) => {
                  setTTime(e.target.value);
                  setLastMarkerTime(e.target.value);
                }}
                placeholder="00:00"
                className="h-10 rounded-2xl text-center font-mono tabular-nums"
                aria-label="Timestamp time in mm:ss"
                inputMode="numeric"
                pattern="^[0-9]?\d:[0-5]\d$"
                style={{ width: "calc(5ch + 1.7rem)" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canAddMarker) {
                    e.preventDefault();
                    addMarker();
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    noteRef.current?.focus();
                  }
                }}
              />
            ) : (
              <span
                className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm text-white/80"
                style={{ width: "calc(5ch + 1.5rem)" }}
                title="Timestamp disabled"
              >
                <Clock className="h-4 w-4" /> —
              </span>
            )}

            <Input
              ref={noteRef}
              value={tNote}
              onChange={(e) => setTNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canAddMarker) {
                  e.preventDefault();
                  addMarker();
                }
              }}
              placeholder="Note"
              className="h-10 rounded-2xl"
              aria-label="Timestamp note"
            />

            <IconButton
              aria-label="Add timestamp"
              title={canAddMarker ? "Add timestamp" : "Enter details"}
              disabled={!canAddMarker}
              circleSize="md"
              iconSize="sm"
              variant="ring"
              onClick={addMarker}
            >
              <Plus />
            </IconButton>
          </div>

          {sortedMarkers.length === 0 ? (
            <div className="mt-2 text-sm text-muted-foreground">No timestamps yet.</div>
          ) : (
            <ul className="mt-3 space-y-2">
              {sortedMarkers.map((m) => (
                <li
                  key={m.id}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2"
                >
                  {m.noteOnly ? (
                    <span className="pill h-7 min-w-[60px] px-0 flex items-center justify-center">
                      <FileText size={14} className="opacity-80" />
                    </span>
                  ) : (
                    <span className="pill h-7 min-w-[60px] px-2.5 text-[11px] font-mono tabular-nums text-center">
                      {m.time}
                    </span>
                  )}

                  <span className="truncate text-sm">{m.note}</span>
                  <IconButton
                    aria-label="Delete timestamp"
                    title="Delete timestamp"
                    circleSize="sm"
                    iconSize="sm"
                    variant="ring"
                    onClick={() => removeMarker(m.id)}
                  >
                    <Trash2 />
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tags */}
        <div>
          <SectionLabel>Tags</SectionLabel>
          <div className="mt-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={draftTag}
                onChange={(e) => setDraftTag(e.target.value)}
                placeholder="Add tag and press Enter"
                className="h-10 rounded-2xl pl-9"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(draftTag);
                    setDraftTag("");
                  }
                }}
              />
            </div>

            <IconButton
              aria-label="Add tag"
              title="Add tag"
              circleSize="md"
              iconSize="sm"
              variant="ring"
              onClick={() => {
                addTag(draftTag);
                setDraftTag("");
              }}
            >
              <Plus />
            </IconButton>
          </div>

          {tags.length === 0 ? (
            <div className="mt-2 text-sm text-muted-foreground/80">No tags yet.</div>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="chip h-9 px-3.5 text-sm group inline-flex items-center gap-1"
                  title="Remove tag"
                  onClick={() => removeTag(t)}
                >
                  <span>#{t}</span>
                  <span className="opacity-0 transition-opacity group-hover:opacity-100">✕</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <SectionLabel>Notes</SectionLabel>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={commitNotes}
            placeholder="Key moments, mistakes to fix, drills to run…"
            className="textarea-base min-h-[180px]"
          />
        </div>
      </div>
    </div>
  );
}
