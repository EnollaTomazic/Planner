// src/components/ui/AnimatedSelect.tsx
"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

/** Option item */
export type DropItem = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onSelect?: () => void;
};

export type AnimatedSelectProps = {
  id?: string;
  label?: React.ReactNode;
  prefixLabel?: React.ReactNode;
  items: DropItem[];
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
  dropdownClassName?: string;
  buttonClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  ariaLabel?: string;
  align?: "left" | "right";
  matchTriggerWidth?: boolean;
};

export default function AnimatedSelect({
  id,
  label,
  prefixLabel,
  items,
  value,
  onChange,
  className = "",
  dropdownClassName = "",
  buttonClassName = "",
  placeholder = "Select…",
  disabled = false,
  hideLabel = false,
  ariaLabel,
  align = "left",
  matchTriggerWidth = true,
}: AnimatedSelectProps) {
  // Hydration-safe portal
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number>(() =>
    Math.max(0, items.findIndex((i) => i.value === value))
  );

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const listRef = React.useRef<HTMLUListElement | null>(null);
  const idBase = React.useId();

  // Positioning
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  const [menuW, setMenuW] = React.useState<number | null>(null);

  const current = items.find((i) => i.value === value);
  const lit = !!current; // stay lit if a value is chosen

  const measure = React.useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    setRect(r);
    if (matchTriggerWidth) setMenuW(r.width);
  }, [matchTriggerWidth]);

  React.useLayoutEffect(() => {
    if (!open) return;
    measure();
  }, [open, measure]);

  React.useEffect(() => {
    if (!open) return;
    const onResize = () => measure();
    const onScroll = () => measure();
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open, measure]);

  // Focus management
  React.useEffect(() => {
    if (!open) return;
    const idx = Math.max(0, items.findIndex((i) => i.value === value));
    setActiveIndex(idx);
    const t = setTimeout(() => {
      listRef.current?.querySelector<HTMLElement>(`[data-index="${idx}"]`)?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [open, items, value]);

  React.useEffect(() => {
    if (open) return;
    const t = setTimeout(() => triggerRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  // Outside click (portal-safe)
  React.useEffect(() => {
    if (!open) return;
    const onDocDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (listRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onDocDown, true);
    return () => document.removeEventListener("pointerdown", onDocDown, true);
  }, [open]);

  // Keyboard on trigger
  function onTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      measure();
      setOpen(true);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      measure();
      setOpen(true);
    }
  }

  // Keyboard on listbox
  function onListKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "Tab") {
      setOpen(false);
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
      focusItem(0);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      const last = items.length - 1;
      setActiveIndex(last);
      focusItem(last);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (activeIndex + 1) % items.length;
      setActiveIndex(next);
      focusItem(next);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (activeIndex - 1 + items.length) % items.length;
      setActiveIndex(prev);
      focusItem(prev);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectByIndex(activeIndex);
    }
  }

  function focusItem(index: number) {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.focus();
  }

  function selectByIndex(index: number) {
    const opt = items[index];
    if (!opt || opt.disabled) return;
    onChange?.(opt.value);
    opt.onSelect?.();
    setOpen(false);
  }

  // Fixed position for portal menu
  const fixedStyles: React.CSSProperties | undefined = rect
    ? (() => {
        const gap = 8;
        const width = menuW ?? 0;
        let left = align === "right" ? rect.right - (width || rect.width) : rect.left;
        const maxLeft = Math.max(8, window.innerWidth - (width || rect.width) - 8);
        left = Math.min(Math.max(8, left), maxLeft);
        return {
          position: "fixed",
          top: Math.round(rect.bottom + gap),
          left: Math.round(left),
          minWidth: matchTriggerWidth ? Math.round(rect.width) : undefined,
          zIndex: 10_000,
        } as React.CSSProperties;
      })()
    : undefined;

  const triggerAria =
    ariaLabel ??
    (typeof label === "string"
      ? label
      : typeof prefixLabel === "string"
      ? prefixLabel
      : "Select option");

  // ── Trigger (glitch chrome + stays lit on selection) ──
  const triggerCls = [
    "group glitch-trigger relative inline-flex items-center gap-2 rounded-2xl px-3 overflow-hidden",
    "bg-[hsl(var(--muted)/.12)] hover:bg-[hsl(var(--muted)/.18)]",
    "border border-[hsl(var(--ring)/.22)] data-[lit=true]:border-[hsl(var(--ring)/.38)] data-[open=true]:border-[hsl(var(--ring)/.38)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
    "transition",
    buttonClassName,
  ].join(" ");

  const caretCls = `caret ml-1 size-4 opacity-75 ${open ? "caret-open" : ""}`;

  return (
    <div id={id} className={["glitch-wrap", className].join(" ")}>
      {label ? (
        <div className={hideLabel ? "sr-only" : "mb-1 text-xs text-[hsl(var(--muted-foreground))]"}>{label}</div>
      ) : null}

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          measure();
          setOpen((v) => !v);
        }}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${idBase}-listbox`}
        aria-label={triggerAria}
        className={triggerCls}
        data-lit={lit ? "true" : "false"}
        data-open={open ? "true" : "false"}
      >
        {prefixLabel ? <span className="opacity-70">❯</span> : null}

        <span
          className={[
            "font-medium glitch-text",
            lit ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]",
            "group-hover:text-[hsl(var(--foreground))]",
          ].join(" ")}
        >
          {current ? current.label : <span className="opacity-70">{placeholder}</span>}
        </span>

        <svg viewBox="0 0 20 20" className={caretCls} aria-hidden="true">
          <path d="M5 7l5 6 5-6" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>

        {/* ── glitch border stack (no whites) ── */}
        <span aria-hidden className="gb-iris" />
        <span aria-hidden className="gb-chroma" />
        <span aria-hidden className="gb-flicker" />
        <span aria-hidden className="gb-scan" />
        <span aria-hidden className="gb-noise" />
        <span aria-hidden className="gb-sparks" />
      </button>

      {/* Dropdown */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.ul
                ref={listRef}
                key="menu"
                role="listbox"
                id={`${idBase}-listbox`}
                tabIndex={-1}
                aria-label={triggerAria}
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                style={fixedStyles}
                onKeyDown={onListKeyDown}
                className={[
                  "relative pointer-events-auto rounded-2xl overflow-hidden",
                  "bg-[hsl(var(--card))]/92 backdrop-blur-xl",
                  "shadow-[0_12px_40px_rgba(0,0,0,.55)] ring-1 ring-[hsl(var(--ring)/.18)]",
                  "p-1.5",
                  "max-h-[60vh] min-w-[220px] overflow-y-auto scrollbar-thin",
                  "scrollbar-thumb-[hsl(var(--foreground)/.12)] scrollbar-track-transparent",
                  dropdownClassName,
                ].join(" ")}
                data-open="true"
              >
                {/* same border stack for menu */}
                <span aria-hidden className="gb-iris" />
                <span aria-hidden className="gb-chroma" />
                <span aria-hidden className="gb-flicker" />
                <span aria-hidden className="gb-scan" />
                <span aria-hidden className="gb-noise" />
                <span aria-hidden className="gb-sparks" />

                {items.map((it, idx) => {
                  const active = it.value === value;
                  const disabledItem = !!it.disabled;
                  return (
                    <li key={String(it.value)}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        data-index={idx}
                        disabled={disabledItem}
                        onClick={() => selectByIndex(idx)}
                        onFocus={() => setActiveIndex(idx)}
                        className={[
                          "group relative w-full rounded-xl px-3.5 py-2.5 text-left outline-none transition",
                          disabledItem ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                          active
                            ? "bg-[hsl(var(--primary)/.14)] text-[hsl(var(--primary-foreground))]"
                            : "hover:bg-white/5",
                          "focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]/60",
                          it.className ?? "",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm leading-none glitch-text">{it.label}</span>
                          <svg
                            viewBox="0 0 20 20"
                            className={[
                              "size-4 shrink-0 transition-opacity",
                              active ? "opacity-90" : "opacity-0 group-hover:opacity-30",
                            ].join(" ")}
                            aria-hidden="true"
                          >
                            <path
                              d="M4 10.5l4 4 8-9"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>

                        {/* Active left rail */}
                        <span
                          aria-hidden
                          className={[
                            "pointer-events-none absolute left-0 top-1/2 h-[70%] w-[2px] -translate-y-1/2 rounded",
                            active ? "bg-[hsl(var(--ring))]" : "bg-transparent",
                          ].join(" ")}
                        />
                      </button>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>,
          document.body
        )}

      <GlitchStyles />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Scoped glitch styles: chroma/iris ring, flicker, scanlines,
   noise + “sparks”. Boosted when [data-lit="true"] or [data-open="true"].
   No white borders; all hues use theme tokens.
   ───────────────────────────────────────────────────────── */
function GlitchStyles() {
  return (
    <style jsx>{`
      /* caret jitter */
      .caret { transition: transform .18s var(--ease-out), filter .18s var(--ease-out); }
      .caret-open { transform: rotate(180deg); }
      .glitch-trigger:hover .caret {
        animation: caret-jitter .9s steps(2,end) infinite;
        filter: drop-shadow(0 0 4px hsl(var(--ring)/.55));
      }
      @keyframes caret-jitter {
        0%,100% { transform: translateX(0) rotate(var(--rot,0deg)); }
        50% { transform: translateX(.6px) rotate(var(--rot,0deg)); }
      }

      /* ── border stack pieces (masked to border) ── */

      .gb-iris,
      .gb-chroma,
      .gb-flicker,
      .gb-scan,
      .gb-noise,
      .gb-sparks {
        position: absolute;
        inset: -1px;
        border-radius: 1rem;
        pointer-events: none;
      }

      /* Base iris sheen with subtle rotation */
      .gb-iris {
        padding: 1px;
        background:
          conic-gradient(from 180deg,
            hsl(262 83% 58% / 0),
            hsl(262 83% 58% / .55),
            hsl(192 90% 50% / .55),
            hsl(320 85% 60% / .55),
            hsl(262 83% 58% / 0));
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor; mask-composite: exclude;
        opacity: .32;
        animation: iris-rotate 10s linear infinite;
      }
      @keyframes iris-rotate { to { filter: hue-rotate(360deg); } }

      /* Stronger chroma jitter (RGB split feel) */
      .gb-chroma {
        padding: 1px;
        background:
          conic-gradient(from 90deg,
            hsl(var(--primary) / 0),
            hsl(var(--primary) / .7),
            hsl(var(--accent-2) / .65),
            hsl(var(--accent) / .65),
            hsl(var(--primary) / 0));
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor; mask-composite: exclude;
        mix-blend-mode: screen;
        opacity: .28;
        animation: chroma-jitter 2.1s steps(6,end) infinite;
      }
      @keyframes chroma-jitter {
        0%,100% { transform: translate(0,0); }
        20% { transform: translate(.25px,-.25px); }
        40% { transform: translate(-.25px,.25px); }
        60% { transform: translate(.15px,.15px); }
        80% { transform: translate(-.15px,-.1px); }
      }

      /* Flickery aura hugging the border */
      .gb-flicker {
        inset: -2px;
        border-radius: 1rem;
        background:
          radial-gradient(120% 120% at 50% 50%, hsl(var(--ring)/.18), transparent 60%);
        filter: blur(7px) saturate(1.06);
        mix-blend-mode: screen;
        opacity: .18;
        animation: border-flicker 3.2s steps(24,end) infinite, border-pulse 6s ease-in-out infinite alternate;
      }
      @keyframes border-flicker {
        0%, 7%, 9%, 100% { opacity:.16; }
        8% { opacity:.46; }
        31% { opacity:.22; }
        33% { opacity:.4; }
        54% { opacity:.2; }
        55% { opacity:.46; }
        78% { opacity:.24; }
      }
      @keyframes border-pulse {
        0%,100% { filter: blur(7px) saturate(1.02); }
        50% { filter: blur(8px) saturate(1.18); }
      }

      /* Thin scanlines constrained to the edge */
      .gb-scan {
        padding: 1px;
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor; mask-composite: exclude;
        background:
          repeating-linear-gradient(0deg,
            rgba(255,255,255,.10) 0 1px,
            transparent 2px 4px);
        mix-blend-mode: soft-light;
        opacity: .2;
        animation: scan-move 5.2s linear infinite;
      }
      @keyframes scan-move { 0%{transform:translateY(-10%)} 100%{transform:translateY(10%)} }

      /* Static/grain hugging the edge */
      .gb-noise {
        padding: 1px;
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor; mask-composite: exclude;
        background:
          url("data:image/svg+xml;utf8,\
<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'>\
  <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='1' stitchTiles='stitch'/></filter>\
  <rect width='160' height='160' filter='url(#n)' opacity='.08'/></svg>");
        background-size: 160px 160px;
        mix-blend-mode: overlay;
        opacity: .24;
        animation: static-fizz 1.6s steps(3,end) infinite;
      }
      @keyframes static-fizz { 50% { opacity: .16; } }

      /* Little sparks running around the frame */
      .gb-sparks {
        padding: 1px;
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor; mask-composite: exclude;
        background:
          radial-gradient(8px 8px at 0% 50%, hsl(var(--accent)/.65), transparent 70%),
          radial-gradient(6px 6px at 100% 50%, hsl(var(--primary)/.6), transparent 70%),
          radial-gradient(10px 10px at 50% 0%, hsl(var(--accent-2)/.5), transparent 70%),
          radial-gradient(10px 10px at 50% 100%, hsl(var(--ring)/.55), transparent 70%);
        background-repeat: no-repeat;
        background-size: 10px 10px, 8px 8px, 10px 10px, 10px 10px;
        opacity: .22;
        animation: sparks-run 2.8s linear infinite;
      }
      @keyframes sparks-run {
        0%   { background-position: 0% 50%, 100% 50%, 50% 0%, 50% 100%; }
        25%  { background-position: 25% 50%, 75% 50%, 50% 10%, 50% 90%; }
        50%  { background-position: 50% 50%, 50% 50%, 50% 20%, 50% 80%; }
        75%  { background-position: 75% 50%, 25% 50%, 50% 10%, 50% 90%; }
        100% { background-position: 100% 50%, 0% 50%, 50% 0%, 50% 100%; }
      }

      /* Light up when selected or open */
      .glitch-trigger[data-lit="true"] .gb-iris,
      .glitch-trigger[data-open="true"] .gb-iris { opacity: .45; }
      .glitch-trigger[data-lit="true"] .gb-chroma,
      .glitch-trigger[data-open="true"] .gb-chroma { opacity: .48; }
      .glitch-trigger[data-lit="true"] .gb-flicker,
      .glitch-trigger[data-open="true"] .gb-flicker { opacity: .28; }
      .glitch-trigger[data-lit="true"] .gb-sparks,
      .glitch-trigger[data-open="true"] .gb-sparks { opacity: .3; }

      /* Menu also glows a bit stronger */
      [data-open="true"] .gb-iris { opacity: .38; }
      [data-open="true"] .gb-chroma { opacity: .42; }
      [data-open="true"] .gb-flicker { opacity: .26; }

      /* subtle label RGB split on hover */
      .glitch-text:hover {
        text-shadow:
          0.6px 0 hsl(210 100% 60% / .45),
         -0.6px 0 hsl(330 100% 60% / .45);
      }
    `}</style>
  );
}

