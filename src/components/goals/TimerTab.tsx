// src/components/goals/TimerTab.tsx
"use client";

import * as React from "react";
import SectionCard from "@/components/ui/layout/SectionCard";
import IconButton from "@/components/ui/primitives/IconButton";
import Hero from "@/components/ui/layout/Hero";
import SegmentedButton from "@/components/ui/primitives/SegmentedButton";
import TimerRing from "./TimerRing";
import DurationSelector from "./DurationSelector";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  BookOpen,
  Brush,
  Code2,
  User,
} from "lucide-react";
import { usePersistentState } from "@/lib/db";
import { clamp } from "@/lib/utils";

/* profiles */
type ProfileKey = "study" | "clean" | "code" | "custom";
type Profile = {
  key: ProfileKey;
  label: string;
  icon: React.ReactNode;
  defaultMin: number;
};
const PROFILES: Profile[] = [
  {
    key: "study",
    label: "Studying",
    icon: <BookOpen className="mr-1" />,
    defaultMin: 45,
  },
  {
    key: "clean",
    label: "Cleaning",
    icon: <Brush className="mr-1" />,
    defaultMin: 30,
  },
  {
    key: "code",
    label: "Coding",
    icon: <Code2 className="mr-1" />,
    defaultMin: 60,
  },
  {
    key: "custom",
    label: "Custom",
    icon: <User className="mr-1" />,
    defaultMin: 25,
  },
];

/* helpers */
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const fmt = (ms: number) => {
  const m = Math.floor(ms / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${pad(m)}:${pad(s)}`;
};
const parseMmSs = (v: string) => {
  const m = v.trim().match(/^(\d{1,3})\s*:\s*([0-5]?\d)$/);
  if (!m) return null;
  const mm = Number(m[1]),
    ss = Number(m[2]);
  return mm * 60_000 + ss * 1000;
};

const ADJUST_BTN_CLASS =
  "absolute top-[var(--space-2)] sm:-top-[var(--space-4)] rounded-full bg-background/40 backdrop-blur shadow-glow transition-transform duration-150 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring";

export default function TimerTab() {
  const [profile, setProfile] = usePersistentState<ProfileKey>(
    "goals.timer.profile.v1",
    "study",
  );
  const [customMinutes, setCustomMinutes] = usePersistentState<number>(
    "goals.timer.customMin.v1",
    25,
  );

  const profileDef = React.useMemo(
    () => PROFILES.find((p) => p.key === profile)!,
    [profile],
  );
  const isCustom = profile === "custom";
  const minutes = isCustom ? customMinutes : profileDef.defaultMin;

  // remaining time
  const [remaining, setRemaining] = usePersistentState<number>(
    "goals.timer.remaining.v1",
    minutes * 60_000,
  );
  const [running, setRunning] = usePersistentState<boolean>(
    "goals.timer.running.v1",
    false,
  );

  const prevProfile = React.useRef<ProfileKey>(profile);
  // Reset timer when switching profiles
  React.useEffect(() => {
    if (prevProfile.current !== profile) {
      setRunning(false);
      setRemaining(
        (profile === "custom" ? customMinutes : profileDef.defaultMin) * 60_000,
      );
      prevProfile.current = profile;
    }
  }, [profile, customMinutes, profileDef.defaultMin, setRunning, setRemaining]);

  // edit mode for mm:ss
  const [timeEdit, setTimeEdit] = React.useState(fmt(remaining));
  React.useEffect(() => {
    setTimeEdit(fmt(remaining));
  }, [remaining]);

  // tick loop
  React.useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => Math.max(0, r - 250));
    }, 250);
    return () => window.clearInterval(id);
  }, [running, setRemaining]);

  // adjust minutes for custom
  function adjust(delta: number) {
    if (!isCustom) return;
    if (running) return;
    const ms = remaining;
    const secs = Math.floor((ms % 60_000) / 1000);
    const next = clamp(minutes + delta, 0, 180);
    setCustomMinutes(next);
    setRemaining(next * 60_000 + secs * 1000);
  }

  const start = React.useCallback(() => {
    setRemaining((r) => (r <= 0 ? minutes * 60_000 : r));
    setRunning(true);
  }, [minutes, setRemaining, setRunning]);
  const pause = React.useCallback(() => {
    setRunning(false);
  }, [setRunning]);
  const reset = React.useCallback(() => {
    setRunning(false);
    setRemaining(minutes * 60_000);
  }, [minutes, setRunning, setRemaining]);
  function commitEdit() {
    if (!isCustom || running) return;
    const ms = parseMmSs(timeEdit);
    if (ms == null) {
      setTimeEdit(fmt(remaining));
      return;
    }
    const mm = Math.floor(ms / 60_000),
      ss = Math.floor((ms % 60_000) / 1000);
    setCustomMinutes(mm);
    setRemaining(mm * 60_000 + ss * 1000);
  }

  const totalMs = minutes * 60_000;
  const progress = Math.max(
    0,
    Math.min(1, 1 - remaining / Math.max(1, totalMs)),
  );
  const finished = remaining <= 0;

  // Tab items map
  const tabItems = React.useMemo(
    () =>
      PROFILES.map((p) => ({
        key: p.key,
        label: (
          <span className="inline-flex items-center">
            {p.icon}
            {p.label}
          </span>
        ),
      })),
    [],
  );

  // Right slot content for Custom: quick duration chips + custom time field
  const rightSlot = isCustom ? (
    <div className="flex items-center flex-wrap gap-2">
      <DurationSelector
        value={minutes}
        onChange={(m) => {
          if (running) return;
          setCustomMinutes(m);
          setRemaining(m * 60_000);
        }}
        disabled={running}
      />
      <input
        aria-label="Custom minutes and seconds"
        value={timeEdit}
        onChange={(e) => setTimeEdit(e.currentTarget.value)}
        onBlur={commitEdit}
        onKeyDown={(e) => e.key === "Enter" && commitEdit()}
        placeholder="mm:ss"
        disabled={running}
        className="w-[5ch] rounded-full border border-border/20 bg-background/20 px-2 text-center text-ui font-medium backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        type="text"
      />
    </div>
  ) : null;

  // keyboard shortcuts
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === " ") {
        e.preventDefault();
        if (running) pause();
        else start();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        reset();
      } else if (isCustom && !running && /^[1-6]$/.test(e.key)) {
        const opts = [10, 15, 20, 25, 30, 45];
        const idx = Number(e.key) - 1;
        const m = opts[idx];
        if (m != null) {
          setCustomMinutes(m);
          setRemaining(m * 60_000);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, isCustom, pause, start, reset, setCustomMinutes, setRemaining]);

  const pct = Math.round(progress * 100);
  const [ringSize, setRingSize] = React.useState(224);
  React.useEffect(() => {
    function update() {
      setRingSize(Math.min(224, window.innerWidth - 64));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <>
      <Hero
        frame={false}
        topClassName="top-[var(--header-stack)]"
        eyebrow="Focus"
        heading="Timer"
        subtitle="Pick a duration and focus."
        subTabs={{
          items: tabItems,
          value: profile,
          onChange: (k: string) => setProfile(k as ProfileKey),
          size: "md",
          align: "between",
          ariaLabel: "Timer profiles",
          right: rightSlot,
          showBaseline: true,
          className: "overflow-x-auto",
        }}
      />

      <SectionCard className="goal-card no-hover">
        <SectionCard.Body>
          <div className="relative mx-auto w-full max-w-sm rounded-2xl border border-card-hairline/60 bg-background/30 p-[var(--space-8)] backdrop-blur-xl shadow-card">
            {/* plus/minus */}
            <IconButton
              aria-label="Minus 1 minute"
              title="Minus 1 minute"
              onClick={() => adjust(-1)}
              disabled={!isCustom || running || minutes <= 0}
              className={`${ADJUST_BTN_CLASS} left-[var(--space-2)] sm:-left-[var(--space-4)]`}
            >
              <Minus />
            </IconButton>
            <IconButton
              aria-label="Plus 1 minute"
              title="Plus 1 minute"
              onClick={() => adjust(1)}
              disabled={!isCustom || running}
              className={`${ADJUST_BTN_CLASS} right-[var(--space-2)] sm:-right-[var(--space-4)]`}
            >
              <Plus />
            </IconButton>

            {/* ring + digits */}
            <div
              className="group relative mx-auto flex items-center justify-center"
              style={{ width: ringSize, height: ringSize }}
            >
              <TimerRing pct={pct} size={ringSize} />
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="text-title font-semibold tabular-nums text-foreground drop-shadow-[0_0_var(--space-2)_hsl(var(--neon-soft))] transition-transform duration-150 group-hover:translate-y-0.5 sm:text-title-lg">
                  {fmt(remaining)}
                </div>
                {isCustom && !running && (
                  <input
                    aria-label="Edit minutes and seconds"
                    value={timeEdit}
                    onChange={(e) => setTimeEdit(e.currentTarget.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => e.key === "Enter" && commitEdit()}
                    className="absolute w-full max-w-[7ch] rounded-full bg-transparent text-center text-title font-semibold tabular-nums opacity-0 focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-title-lg"
                  />
                )}
              </div>
            </div>

            {/* progress bar */}
            <div className="mt-6 w-full">
              <div className="relative h-2 w-full rounded-full bg-background/20 shadow-neo-inset">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(to_right,transparent,transparent_9%,hsl(var(--foreground)/0.15)_9%,hsl(var(--foreground)/0.15)_10%)]" />
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(var(--accent-2)))] shadow-glow transition-[width] duration-150 ease-linear"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-1 text-right text-label font-medium tracking-[0.02em] text-muted-foreground tabular-nums">
                {pct}%
              </div>
            </div>

            {/* controls */}
            <div className="mt-6 flex w-full flex-wrap justify-center gap-2 overflow-x-auto">
              {!running ? (
                <SegmentedButton
                  className="inline-flex min-w-[4.5rem] items-center gap-2 rounded-full px-4 py-2 transition-colors duration-150 ease-in-out"
                  onClick={start}
                  title="Start"
                >
                  <Play />
                  Start
                </SegmentedButton>
              ) : (
                <SegmentedButton
                  className="inline-flex min-w-[4.5rem] items-center gap-2 rounded-full px-4 py-2 transition-colors duration-150 ease-in-out"
                  onClick={pause}
                  title="Pause"
                  isActive
                >
                  <Pause />
                  Pause
                </SegmentedButton>
              )}
              <SegmentedButton
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 transition-colors duration-150 ease-in-out"
                onClick={reset}
                title="Reset"
              >
                <RotateCcw />
                Reset
              </SegmentedButton>
            </div>

            {/* Complete state */}
            {finished && (
              <div className="mt-6 grid place-items-center">
                <div className="rounded-full bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(var(--accent-2)))] px-3 py-1 text-ui font-medium text-foreground shadow-glow animate-pulse">
                  Complete
                </div>
                <div className="mt-2 text-label font-medium tracking-[0.02em] text-muted-foreground">
                  Good. Now do the review, not Twitter.
                </div>
              </div>
            )}
          </div>
        </SectionCard.Body>
      </SectionCard>
    </>
  );
}
