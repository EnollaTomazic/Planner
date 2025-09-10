// src/components/goals/TimerTab.tsx
"use client";

/**
 * TimerTab — Lavender-Glitch timer with a glitchy progress bar
 * - Top tabs use TabBar (borderless neon) for profiles
 * - Right slot shows Quick presets + custom time when profile = Personal
 * - Digits centered; minus/plus on the sides
 * - Loader: neon gradient + scanlines + RGB split + pixel slices + jitter
 */

import * as React from "react";
import SectionCard from "@/components/ui/layout/SectionCard";
import IconButton from "@/components/ui/primitives/IconButton";
import TabBar from "@/components/ui/layout/TabBar";
import Hero from "@/components/ui/layout/Hero";
import SegmentedButton from "@/components/ui/primitives/SegmentedButton";
import {
  Play, Pause, RotateCcw, Plus, Minus,
  BookOpen, Brush, Code2, User,
} from "lucide-react";
import { usePersistentState } from "@/lib/db";
import DurationSelector from "./DurationSelector";

/* profiles */
type ProfileKey = "study" | "clean" | "code" | "personal";
type Profile = { key: ProfileKey; label: string; icon: React.ReactNode; defaultMin: number };
const PROFILES: Profile[] = [
  { key: "study",    label: "Studying", icon: <BookOpen className="mr-1" />, defaultMin: 45 },
  { key: "clean",    label: "Cleaning", icon: <Brush className="mr-1" />,    defaultMin: 30 },
  { key: "code",     label: "Coding",   icon: <Code2 className="mr-1" />,    defaultMin: 60 },
  { key: "personal", label: "Personal", icon: <User className="mr-1" />,     defaultMin: 25 },
];


/* helpers */
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const fmt = (ms: number) => {
  const m = Math.floor(ms / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${pad(m)}:${pad(s)}`;
};
const parseMmSs = (v: string) => {
  const m = v.trim().match(/^(\d{1,3})\s*:\s*([0-5]?\d)$/);
  if (!m) return null;
  const mm = Number(m[1]), ss = Number(m[2]);
  return mm * 60_000 + ss * 1000;
};

export default function TimerTab() {
  const [profile, setProfile] = usePersistentState<ProfileKey>(
    "goals.timer.profile.v1",
    "study",
  );
  const [personalMinutes, setPersonalMinutes] = usePersistentState<number>(
    "goals.timer.personalMin.v1",
    25,
  );

  const profileDef = React.useMemo(() => PROFILES.find(p => p.key === profile)!, [profile]);
  const isPersonal = profile === "personal";
  const minutes = isPersonal ? personalMinutes : profileDef.defaultMin;

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
  // Reset timer when switching profiles (studying, cleaning, coding)
  React.useEffect(() => {
    if (prevProfile.current !== profile) {
      setRunning(false);
      setRemaining(
        (profile === "personal" ? personalMinutes : profileDef.defaultMin) * 60_000,
      );
      prevProfile.current = profile;
    }
  }, [profile, personalMinutes, profileDef.defaultMin, setRunning, setRemaining]);

  // edit mode for mm:ss
  const [timeEdit, setTimeEdit] = React.useState(fmt(remaining));
  React.useEffect(() => { setTimeEdit(fmt(remaining)); }, [remaining]);

  // tick loop
  React.useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining(r => Math.max(0, r - 250));
    }, 250);
    return () => window.clearInterval(id);
  }, [running, setRemaining]);

  // adjust minutes for personal
  function adjust(delta: number) {
    if (!isPersonal) return;
    if (running) return;
    const ms = remaining;
    const secs = Math.floor((ms % 60_000) / 1000);
    const next = clamp(minutes + delta, 0, 180);
    setPersonalMinutes(next);
    setRemaining(next * 60_000 + secs * 1000);
  }

  function start() { if (remaining <= 0) setRemaining(minutes * 60_000); setRunning(true); }
  function pause() { setRunning(false); }
  function reset() { setRunning(false); setRemaining(minutes * 60_000); }
  function commitEdit() {
    if (!isPersonal || running) return;
    const ms = parseMmSs(timeEdit);
    if (ms == null) { setTimeEdit(fmt(remaining)); return; }
    const mm = Math.floor(ms / 60_000), ss = Math.floor((ms % 60_000) / 1000);
    setPersonalMinutes(mm);
    setRemaining(mm * 60_000 + ss * 1000);
  }

  const totalMs = minutes * 60_000;
  const progress = Math.max(0, Math.min(1, 1 - remaining / Math.max(1, totalMs)));
  const finished = remaining <= 0;

  // Typed CSS var style for glitch bar width
  type PctStyle = React.CSSProperties & { ["--pct"]: string };
  const pctStyle: PctStyle = React.useMemo(
    () => ({ ["--pct"]: `${Math.round(progress * 100)}%` }),
    [progress]
  );

  // Tab items map
  const tabItems = React.useMemo(
    () =>
      PROFILES.map(p => ({
        key: p.key,
        label: (
          <span className="inline-flex items-center">
            {p.icon}
            {p.label}
          </span>
        ),
      })),
    []
  );

  // Right slot content for Personal: quick duration chips + custom time field
  const rightSlot = isPersonal ? (
    <div className="flex items-center flex-wrap gap-2">
      <DurationSelector
        value={minutes}
        onChange={(m) => {
          if (running) return;
          setPersonalMinutes(m);
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
        className="btn-like-segmented btn-glitch w-[5ch] text-center"
        type="text"
      />
    </div>
  ) : null;

  return (
    <div className="grid gap-4">
      <Hero
        eyebrow="Focus"
        heading="Timer"
        subtitle="Pick a duration and focus."
        right={
          <TabBar
            items={tabItems}
            value={profile}
            onValueChange={(k) => setProfile(k as ProfileKey)}
            size="md"
            align="between"
            ariaLabel="Timer profiles"
            right={rightSlot}
            showBaseline
          />
        }
      />

      <SectionCard className="goal-card no-hover">
        <SectionCard.Body>
          {/* Stage row with side buttons and centered digits */}
          <div className="goal-card p-5 sm:p-6 overflow-hidden">
          <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
            {/* minus */}
            <IconButton
              title="Minus 1 minute"
              aria-label="Minus 1 minute"
              onClick={() => adjust(-1)}
              disabled={!isPersonal || running || minutes <= 0}
              className="shrink-0"
            >
              <Minus />
            </IconButton>

            {/* digits */}
            <div className="relative grid place-items-center py-6">
              <div className="relative">
                <div className="text-6xl sm:text-7xl font-bold tabular-nums select-none title-glow">
                  {fmt(remaining)}
                </div>
                {isPersonal && !running && (
                  <div className="absolute inset-0 grid place-items-center pointer-events-none">
                    <input
                      aria-label="Edit minutes and seconds"
                      value={timeEdit}
                      onChange={(e) => setTimeEdit(e.currentTarget.value)}
                      onBlur={commitEdit}
                      onKeyDown={(e) => e.key === "Enter" && commitEdit()}
                      className="bg-transparent text-center opacity-0 focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-6xl sm:text-7xl font-bold tabular-nums"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* plus */}
            <IconButton
              title="Plus 1 minute"
              aria-label="Plus 1 minute"
              onClick={() => adjust(+1)}
              disabled={!isPersonal || running}
              className="shrink-0"
            >
              <Plus />
            </IconButton>
          </div>

          {/* GLITCH loader */}
          <div className="mt-6">
            <div className="lg-loader bg-gradient-to-r from-muted/25 to-muted/15">
              {/* track texture */}
              <div className="lg-noise" aria-hidden />
              {/* progress core */}
              <div className="lg-progress" style={pctStyle} aria-hidden />
              {/* rgb ghost trails */}
              <div
                className="lg-progress rgb r bg-gradient-to-r from-auroraG to-auroraGLight"
                style={pctStyle}
                aria-hidden
              />
              <div
                className="lg-progress rgb b bg-gradient-to-r from-auroraP to-auroraPLight"
                style={pctStyle}
                aria-hidden
              />
              {/* scanline sweep */}
              <div className="lg-scan" aria-hidden />
            </div>

            <div className="mt-2 text-xs text-muted-foreground tabular-nums">
              {Math.round(progress * 100)}%
            </div>
          </div>
        </div>

        {/* Controls row */}
        <div className="mt-4 flex items-center justify-center gap-2">
            {!running ? (
              <SegmentedButton
                className="inline-flex items-center gap-2 px-4 py-2"
                onClick={start}
                title="Start"
              >
                <Play />
                Start
              </SegmentedButton>
            ) : (
              <SegmentedButton
                className="inline-flex items-center gap-2 px-4 py-2"
                onClick={pause}
                title="Pause"
                isActive
              >
                <Pause />
                Pause
              </SegmentedButton>
            )}
            <SegmentedButton
              className="inline-flex items-center gap-2 px-4 py-2"
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
            <div className="complete text-sm px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground">Complete</div>
            <div className="mt-2 text-xs text-muted-foreground complete-text">Good. Now do the review, not Twitter.</div>
          </div>
        )}
      </SectionCard.Body>

      {/* Local styles for neon pills, glitch loader, and complete state */}
      <style jsx>{`
        /* Disable card hover bloom */
        .no-hover.goal-card:hover {
          box-shadow: 0 0 0 var(--hairline-w) hsl(var(--card-hairline)) inset,
            inset 0 1px 0 hsl(var(--foreground) / 0.05),
            0 30px 60px hsl(250 30% 2% / 0.35);
        }
        .no-hover.goal-card:hover::before { opacity: 0.45; }
        .no-hover.goal-card:hover::after { opacity: 0; }

        /* Emphasize active tab text glow (works with TabBar) */
        [role="tab"][data-active="true"] { text-shadow: 0 0 10px hsl(var(--ring)); }

        /* === GLITCH BAR === */
        .lg-loader {
          position: relative;
          height: 12px;
          border-radius: 9999px;
          overflow: hidden;
          box-shadow: inset 0 0 0 1px hsl(var(--card-hairline));
          isolation: isolate;
        }

        .lg-noise {
          position: absolute; inset: 0;
          background:
            repeating-linear-gradient(90deg, transparent 0 8px, hsl(var(--foreground) / .03) 8px 9px),
            repeating-linear-gradient(180deg, hsl(var(--foreground) / .02) 0 1px, transparent 1px 3px);
          mix-blend-mode: overlay;
          pointer-events: none;
          opacity: .8;
          animation: glitchNoise 1600ms steps(16) infinite;
        }

        .lg-progress {
          position: absolute; inset: 0;
          width: var(--pct);
          background:
            linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);
          box-shadow:
            inset 0 0 10px hsl(var(--primary) / .7),
            inset 0 0 16px hsl(var(--accent) / .6);
          border-right: 0 solid transparent;
          -webkit-mask-image:
            repeating-linear-gradient(180deg, hsl(var(--foreground)) 0 3px, transparent 3px 5px);
          mask-image:
            repeating-linear-gradient(180deg, hsl(var(--foreground)) 0 3px, transparent 3px 5px);
          animation:
            widthEase 220ms ease,
            jitter 900ms steps(12) infinite;
        }

        .lg-progress.rgb {
          mix-blend-mode: screen;
          opacity: .5;
          filter: blur(1px);
        }
        .lg-progress.rgb.r {
          transform: translateX(-1px);
          animation:
            widthEase 220ms ease,
            jitterX 900ms steps(12) infinite reverse;
        }
        .lg-progress.rgb.b {
          transform: translateX(1px);
          animation:
            widthEase 220ms ease,
            jitterX 900ms steps(12) infinite;
        }

        .lg-scan {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, hsl(var(--ring) / .22), transparent);
          mix-blend-mode: screen;
          pointer-events: none;
          animation: scan 2.2s linear infinite;
        }

        @keyframes widthEase { from { width: calc(var(--pct) * .985); } to { width: var(--pct); } }
        @keyframes scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes jitter {
          0%{ transform: translateY(0) }
          50%{ transform: translateY(-0.5px) }
          100%{ transform: translateY(0) }
        }
        @keyframes jitterX {
          0%{ transform: translateX(0) }
          50%{ transform: translateX(1px) }
          100%{ transform: translateX(0) }
        }
        @keyframes glitchNoise {
          0%{ background-position: 0 0, 0 0 }
          100%{ background-position: 16px 0, 0 8px }
        }

        .complete {
          box-shadow: 0 0 12px hsl(var(--ring)/.25);
          animation: softPulse 2.4s ease-in-out infinite;
        }
        .complete-text {
          text-shadow: 0 0 8px hsl(var(--ring)/.25);
          animation: flicker .2s steps(2) 12, glow 2.4s ease-in-out infinite 2.4s;
        }
        @keyframes softPulse { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes flicker { 0%{opacity:.2} 50%{opacity:1} 100%{opacity:.4} }
        @keyframes glow {
          0%,100%{ text-shadow: 0 0 12px hsla(var(--primary), .35) }
          50%{ text-shadow: 0 0 24px hsla(var(--accent), .65) }
        }
      `}</style>
    </SectionCard>
  </div>
  );
}
