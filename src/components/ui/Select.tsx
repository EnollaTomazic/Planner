// src/components/ui/Select.tsx
"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import FieldShell from "./primitives/FieldShell";
import useMounted from "@/lib/useMounted";
import { useFieldIds } from "@/lib/useFieldIds";
import { cn } from "@/lib/utils";

/** Option item */
export type SelectItem = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onSelect?: () => void;
};

export type AnimatedSelectProps = {
  id?: string;
  label?: React.ReactNode;
  prefixLabel?: React.ReactNode;
  items: SelectItem[];
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

export interface NativeSelectProps
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "children" | "value" | "onChange"
  > {
  items: SelectItem[];
  value?: string;
  onChange?: (v: string) => void;
  helperText?: string;
  errorText?: string;
  success?: boolean;
  /** Optional className for the inner <select> element */
  selectClassName?: string;
}

export type SelectProps =
  | (AnimatedSelectProps & { variant?: "animated" })
  | (NativeSelectProps & { variant: "native" });

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  function NativeSelect(
    {
      className,
      selectClassName,
      helperText,
      errorText,
      success,
      disabled,
      id: idProp,
      name: nameProp,
      items,
      value,
      onChange,
      ...props
    },
    ref,
  ) {
    const ariaLabel = props["aria-label"] as string | undefined;
    const { id, name: generatedName, isInvalid } = useFieldIds(
      ariaLabel,
      idProp,
      nameProp,
    );
    const name = nameProp ?? (ariaLabel ? generatedName : id);
    const ariaInvalid = errorText ? "true" : props["aria-invalid"];
    const invalid = isInvalid(ariaInvalid);
    const successId = `${id}-success`;
    const errorId = errorText ? `${id}-error` : undefined;
    const helperId = helperText ? `${id}-helper` : undefined;
    const describedBy =
      [errorId, helperId, success ? successId : undefined]
        .filter(Boolean)
        .join(" ") || undefined;
    return (
      <div className="space-y-1">
        <FieldShell
          className={cn(
            "group jitter hover:shadow-[0_0_0_1px_hsl(var(--border)/0.2)]",
            success && "border-[--theme-ring] focus-within:ring-[--theme-ring]",
            disabled &&
              "cursor-not-allowed focus-within:ring-0 focus-within:shadow-none",
            className,
          )}
          error={invalid || !!errorText}
          disabled={disabled}
        >
          <select
            ref={ref}
            id={id}
            name={name}
            disabled={disabled}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            aria-invalid={ariaInvalid}
            aria-describedby={describedBy}
            className={cn(
              "flex-1 h-[var(--control-h)] px-[var(--space-14)] pr-[var(--space-36)] text-sm bg-transparent text-foreground placeholder:text-muted-foreground/70 caret-accent appearance-none disabled:cursor-not-allowed focus:outline-none focus-visible:outline-none",
              selectClassName,
            )}
            {...props}
          >
            {items.map((it) => (
              <option key={it.value} value={it.value} disabled={it.disabled}>
                {it.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-[var(--space-14)] h-4 w-4 text-muted-foreground group-focus-within:text-accent" />
        </FieldShell>
        {success && (
          <p
            id={successId}
            className="sr-only"
            role="status"
            aria-live="polite"
          >
            Selection saved
          </p>
        )}
        {(helperText || errorText) && (
          <p
            id={errorId || helperId}
            className={cn(
              "text-xs mt-1 line-clamp-2",
              errorText ? "text-danger" : "text-muted-foreground",
            )}
          >
            {errorText || helperText}
          </p>
        )}
      </div>
    );
  },
);

const AnimatedSelectImpl = React.forwardRef<
  HTMLButtonElement,
  AnimatedSelectProps
>(function AnimatedSelectImpl(
  {
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
  }: AnimatedSelectProps,
  ref,
) {
  // Hydration-safe portal
  const mounted = useMounted();

  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number>(() =>
    Math.max(
      0,
      items.findIndex((i) => i.value === value),
    ),
  );

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const setTriggerRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
          node;
      }
    },
    [ref],
  );
  const listRef = React.useRef<HTMLUListElement | null>(null);
  const idBase = React.useId();
  const labelId = `${idBase}-label`;

  // Positioning
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  const durQuick = React.useMemo(() => {
    if (typeof window === "undefined") return 0.14;
    const v = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--dur-quick",
      ),
    );
    return (Number.isNaN(v) ? 140 : v) / 1000;
  }, []);
  const [menuW, setMenuW] = React.useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  const current = items.find((i) => i.value === value);
  const lit = !!current; // stay lit if a value is chosen

  const measure = React.useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    setRect(r);
    if (matchTriggerWidth) setMenuW(r.width);
  }, [matchTriggerWidth]);

  const rafId = React.useRef<number>();
  const scheduleMeasure = React.useCallback(() => {
    if (rafId.current !== undefined) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      rafId.current = undefined;
      measure();
    });
  }, [measure]);

  React.useEffect(() => {
    return () => {
      if (rafId.current !== undefined) cancelAnimationFrame(rafId.current);
    };
  }, []);

  React.useLayoutEffect(() => {
    if (!open) return;
    scheduleMeasure();
  }, [open, scheduleMeasure]);

  React.useEffect(() => {
    if (!open) return;
    const handler = () => scheduleMeasure();
    window.addEventListener("resize", handler, { passive: true });
    window.addEventListener("scroll", handler, { passive: true });
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler);
    };
  }, [open, scheduleMeasure]);

  // Focus management
  React.useEffect(() => {
    if (!open) return;
    const idx = Math.max(
      0,
      items.findIndex((i) => i.value === value),
    );
    setActiveIndex(idx);
    const t = setTimeout(() => {
      listRef.current
        ?.querySelector<HTMLElement>(`[data-index="${idx}"]`)
        ?.focus();
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
      scheduleMeasure();
      setOpen(true);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      scheduleMeasure();
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
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${index}"]`)
      ?.focus();
  }

  function selectByIndex(index: number) {
    const opt = items[index];
    if (!opt || opt.disabled || opt.loading) return;
    onChange?.(opt.value);
    opt.onSelect?.();
    setOpen(false);
  }

  // Fixed position for portal menu
  const fixedStyles: React.CSSProperties | undefined = rect
    ? (() => {
        const gap = 8;
        const width = menuW ?? 0;
        let left =
          align === "right" ? rect.right - (width || rect.width) : rect.left;
        const maxLeft = Math.max(
          8,
          window.innerWidth - (width || rect.width) - 8,
        );
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
    "glitch-trigger relative flex items-center h-9 rounded-full px-3 overflow-hidden",
    "bg-muted/12 hover:bg-muted/18",
    "focus:[outline:none] focus-visible:[outline:none]",
    "transition-colors duration-[var(--dur-quick)] ease-out motion-reduce:transition-none",
    buttonClassName,
  ].join(" ");

  const caretCls = `caret ml-auto size-4 shrink-0 opacity-75 ${open ? "caret-open" : ""}`;

  return (
    <div id={id} className={["glitch-wrap", className].join(" ")}>
      {label ? (
        <div
          id={labelId}
          className={
            hideLabel ? "sr-only" : "mb-1 text-xs text-muted-foreground"
          }
        >
          {label}
        </div>
      ) : null}

      <div className="group inline-flex rounded-full border border-[--theme-ring] focus-within:ring-2 focus-within:ring-[--theme-ring] focus-within:ring-offset-0">
        <button
          ref={setTriggerRef}
          type="button"
          disabled={disabled}
          onClick={() => {
            scheduleMeasure();
            setOpen((v) => !v);
          }}
          onKeyDown={onTriggerKeyDown}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${idBase}-listbox`}
          aria-labelledby={label ? labelId : undefined}
          aria-label={label ? undefined : triggerAria}
          className={triggerCls}
          data-lit={lit ? "true" : "false"}
          data-open={open ? "true" : "false"}
        >
          {prefixLabel ? (
            <ChevronRight
              aria-hidden="true"
              className="h-4 w-4 shrink-0 opacity-70 transition-colors duration-[var(--dur-quick)] ease-out motion-reduce:transition-none"
            />
          ) : null}

          <span
            className={[
              "font-medium glitch-text",
              lit ? "text-foreground" : "text-muted-foreground",
              "group-hover:text-foreground",
            ].join(" ")}
          >
            {current ? (
              current.label
            ) : (
              <span className="opacity-70">{placeholder}</span>
            )}
          </span>

          <ChevronDown className={caretCls} aria-hidden="true" />

          {/* ── glitch border stack (no whites) ── */}
          <span aria-hidden className="gb-iris" />
          <span aria-hidden className="gb-chroma" />
          <span aria-hidden className="gb-flicker" />
          <span aria-hidden className="gb-scan" />
        </button>
      </div>

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
                aria-labelledby={label ? labelId : undefined}
                aria-label={label ? undefined : triggerAria}
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -4, scale: 0.98 }
                }
                animate={
                  reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
                }
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -4, scale: 0.98 }
                }
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: durQuick, ease: "easeOut" }
                }
                style={fixedStyles}
                onKeyDown={onListKeyDown}
                className={[
                  "relative pointer-events-auto rounded-[var(--radius-2xl)] overflow-hidden",
                  "bg-card/92 backdrop-blur-xl",
                  "shadow-[0_12px_40px_hsl(var(--shadow-color)/0.55)] ring-1 ring-ring/18",
                  "p-2",
                  "max-h-[60vh] min-w-56 overflow-y-auto scrollbar-thin",
                  "scrollbar-thumb-foreground/12 scrollbar-track-transparent",
                  dropdownClassName,
                ].join(" ")}
                data-open="true"
              >
                {/* same border stack for menu */}
                <span aria-hidden className="gb-iris" />
                <span aria-hidden className="gb-chroma" />
                <span aria-hidden className="gb-flicker" />
                <span aria-hidden className="gb-scan" />

                {items.map((it, idx) => {
                  const active = it.value === value;
                  const disabledItem = !!it.disabled || it.loading;
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
                          "group relative w-full rounded-xl px-4 py-3 text-left transition-colors duration-[var(--dur-quick)] ease-out motion-reduce:transition-none hover:bg-[--hover] active:bg-[--active] [--hover:hsl(var(--foreground)/0.05)] [--active:hsl(var(--foreground)/0.1)]",
                          disabledItem
                            ? "cursor-not-allowed"
                            : "cursor-pointer",
                          "disabled:opacity-[var(--disabled)] disabled:pointer-events-none",
                          active
                            ? "bg-primary/14 text-primary-foreground [--hover:hsl(var(--primary)/0.25)] [--active:hsl(var(--primary)/0.35)]"
                            : "",
                          "focus:[outline:none] focus-visible:[outline:none] focus:ring-2 focus:ring-[--theme-ring] focus:ring-offset-0 data-[loading=true]:opacity-[var(--loading)] data-[loading=true]:pointer-events-none",
                          it.className ?? "",
                        ].join(" ")}
                        data-loading={it.loading}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm leading-none glitch-text">
                            {it.label}
                          </span>
                          <Check
                            className={[
                              "size-4 shrink-0 transition-opacity duration-[var(--dur-quick)] ease-out motion-reduce:transition-none",
                              active
                                ? "opacity-90"
                                : "opacity-0 group-hover:opacity-30",
                            ].join(" ")}
                            aria-hidden="true"
                          />
                        </div>

                        {/* Active left rail */}
                        <span
                          aria-hidden
                          className={[
                            "pointer-events-none absolute left-0 top-1/2 h-3/4 w-0.5 -translate-y-1/2 rounded-md",
                            active ? "bg-ring" : "bg-transparent",
                          ].join(" ")}
                        />
                      </button>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>,
          document.body,
        )}

      <GlitchStyles />
    </div>
  );
});

/* ─────────────────────────────────────────────────────────
   Scoped glitch styles: chroma/iris ring, flicker, scanlines.
   Boosted when [data-lit="true"] or [data-open="true"].
   No white borders; all hues use theme tokens.
   ───────────────────────────────────────────────────────── */
function GlitchStyles() {
  return (
    <style jsx>{`
      /* caret jitter */
      .caret {
        transition:
          transform var(--dur-quick) var(--ease-out),
          filter var(--dur-quick) var(--ease-out);
      }
      .caret-open {
        transform: rotate(180deg);
      }
      .glitch-trigger:hover .caret {
        animation: caret-jitter 0.9s steps(2, end) infinite;
        filter: drop-shadow(0 0 4px hsl(var(--ring) / 0.55));
      }

      @media (prefers-reduced-motion: reduce) {
        .caret {
          transition: none;
        }
        .glitch-trigger:hover .caret {
          animation: none;
          filter: none;
        }
      }
      @keyframes caret-jitter {
        0%,
        100% {
          transform: translateX(0) rotate(var(--rot, 0deg));
        }
        50% {
          transform: translateX(0.6px) rotate(var(--rot, 0deg));
        }
      }

      /* ── border stack pieces (masked to border) ── */

      .gb-iris,
      .gb-chroma,
      .gb-flicker,
      .gb-scan {
        position: absolute;
        inset: -1px;
        border-radius: var(--radius-2xl);
        pointer-events: none;
      }

      /* Base iris sheen with subtle rotation */
      .gb-iris {
        padding: 1px;
        background: conic-gradient(
          from 180deg,
          hsl(var(--ring) / 0),
          hsl(var(--ring) / 0.55),
          hsl(var(--accent-2) / 0.55),
          hsl(var(--lav-deep) / 0.55),
          hsl(var(--ring) / 0)
        );
        -webkit-mask:
          linear-gradient(hsl(var(--foreground)) 0 0) content-box,
          linear-gradient(hsl(var(--foreground)) 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        opacity: 0.32;
        animation: iris-rotate 10s linear infinite;
      }
      @keyframes iris-rotate {
        to {
          filter: hue-rotate(360deg);
        }
      }

      /* Stronger chroma jitter (RGB split feel) */
      .gb-chroma {
        padding: 1px;
        background: conic-gradient(
          from 90deg,
          hsl(var(--ring) / 0),
          hsl(var(--ring) / 0.7),
          hsl(var(--accent-2) / 0.65),
          hsl(var(--accent) / 0.65),
          hsl(var(--ring) / 0)
        );
        -webkit-mask:
          linear-gradient(hsl(var(--foreground)) 0 0) content-box,
          linear-gradient(hsl(var(--foreground)) 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        mix-blend-mode: screen;
        opacity: 0.28;
        animation: chroma-jitter 2.1s steps(6, end) infinite;
      }
      @keyframes chroma-jitter {
        0%,
        100% {
          transform: translate(0, 0);
        }
        20% {
          transform: translate(0.25px, -0.25px);
        }
        40% {
          transform: translate(-0.25px, 0.25px);
        }
        60% {
          transform: translate(0.15px, 0.15px);
        }
        80% {
          transform: translate(-0.15px, -0.1px);
        }
      }

      /* Flickery aura hugging the border */
      .gb-flicker {
        inset: -2px;
        border-radius: var(--radius-2xl);
        background: radial-gradient(
          120% 120% at 50% 50%,
          hsl(var(--ring) / 0.18),
          transparent 60%
        );
        filter: blur(7px) saturate(1.06);
        mix-blend-mode: screen;
        opacity: 0.18;
        animation:
          border-flicker 3.2s steps(24, end) infinite,
          border-pulse 6s ease-in-out infinite alternate;
      }
      @keyframes border-flicker {
        0%,
        7%,
        9%,
        100% {
          opacity: 0.16;
        }
        8% {
          opacity: 0.46;
        }
        31% {
          opacity: 0.22;
        }
        33% {
          opacity: 0.4;
        }
        54% {
          opacity: 0.2;
        }
        55% {
          opacity: 0.46;
        }
        78% {
          opacity: 0.24;
        }
      }
      @keyframes border-pulse {
        0%,
        100% {
          filter: blur(7px) saturate(1.02);
        }
        50% {
          filter: blur(8px) saturate(1.18);
        }
      }

      /* Thin scanlines constrained to the edge */
      .gb-scan {
        padding: 1px;
        -webkit-mask:
          linear-gradient(hsl(var(--foreground)) 0 0) content-box,
          linear-gradient(hsl(var(--foreground)) 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        background: repeating-linear-gradient(
          0deg,
          hsl(var(--foreground) / 0.1) 0 1px,
          transparent 2px 4px
        );
        mix-blend-mode: soft-light;
        opacity: 0.2;
        animation: scan-move 5.2s linear infinite;
      }
      @keyframes scan-move {
        0% {
          transform: translateY(-10%);
        }
        100% {
          transform: translateY(10%);
        }
      }

      /* Light up when selected or open */
      .glitch-trigger[data-lit="true"] .gb-iris,
      .glitch-trigger[data-open="true"] .gb-iris {
        opacity: 0.45;
      }
      .glitch-trigger[data-lit="true"] .gb-chroma,
      .glitch-trigger[data-open="true"] .gb-chroma {
        opacity: 0.48;
      }
      .glitch-trigger[data-lit="true"] .gb-flicker,
      .glitch-trigger[data-open="true"] .gb-flicker {
        opacity: 0.28;
      }

      /* Menu also glows a bit stronger */
      [data-open="true"] .gb-iris {
        opacity: 0.38;
      }
      [data-open="true"] .gb-chroma {
        opacity: 0.42;
      }
      [data-open="true"] .gb-flicker {
        opacity: 0.26;
      }

      @media (prefers-reduced-motion: reduce) {
        .gb-iris,
        .gb-chroma,
        .gb-flicker,
        .gb-scan,
        .glitch-trigger:hover .caret {
          animation: none;
        }
      }

      /* subtle label RGB split on hover */
      .glitch-text:hover {
        text-shadow:
          0.6px 0 hsl(var(--accent-2) / 0.45),
          -0.6px 0 hsl(var(--lav-deep) / 0.45);
      }
    `}</style>
  );
}

type SelectRef = HTMLSelectElement | HTMLButtonElement;

const Select = React.forwardRef<SelectRef, SelectProps>(
  function Select(props, ref) {
    if (props.variant === "native") {
      const { variant, ...rest } = props as NativeSelectProps & {
        variant: "native";
      };
      void variant;
      return (
        <NativeSelect ref={ref as React.Ref<HTMLSelectElement>} {...rest} />
      );
    }
    const { variant, ...rest } = props as AnimatedSelectProps & {
      variant?: "animated";
    };
    void variant;
    return (
      <AnimatedSelectImpl ref={ref as React.Ref<HTMLButtonElement>} {...rest} />
    );
  },
);

export default Select;
