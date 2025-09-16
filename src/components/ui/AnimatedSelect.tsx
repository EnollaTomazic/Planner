"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, ChevronRight } from "lucide-react";

import useMounted from "@/lib/useMounted";
import { cn } from "@/lib/utils";

import styles from "./Select.module.css";
import type { AnimatedSelectProps } from "./Select.types";

const AnimatedSelect = React.forwardRef<
  HTMLButtonElement,
  AnimatedSelectProps
>(function AnimatedSelect(
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
  const lit = !!current;

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

  const triggerCls = cn(
    styles.glitchTrigger,
    "relative flex items-center h-9 rounded-[var(--radius-full)] px-3 overflow-hidden",
    "bg-muted/12 hover:bg-muted/18",
    "focus:[outline:none] focus-visible:[outline:none]",
    "transition-colors duration-[var(--dur-quick)] ease-out motion-reduce:transition-none",
    buttonClassName,
  );

  const caretCls = cn(
    styles.caret,
    "ml-auto size-4 shrink-0 opacity-75",
    open && styles.caretOpen,
  );

  return (
    <div id={id} className={cn(styles.glitchWrap, className)}>
      {label ? (
        <div
          id={labelId}
          className={
            hideLabel ? "sr-only" : "mb-1 text-label text-muted-foreground"
          }
        >
          {label}
        </div>
      ) : null}

      <div className="group inline-flex rounded-[var(--radius-full)] border border-[--theme-ring] focus-within:ring-2 focus-within:ring-[--theme-ring] focus-within:ring-offset-0">
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
            className={cn(
              "font-medium leading-none",
              styles.glitchText,
              lit ? "text-foreground" : "text-muted-foreground",
              "group-hover:text-foreground",
            )}
          >
            {current ? (
              current.label
            ) : (
              <span className="opacity-70">{placeholder}</span>
            )}
          </span>

          <ChevronDown className={caretCls} aria-hidden="true" />

          <span aria-hidden className={styles.gbIris} />
          <span aria-hidden className={styles.gbChroma} />
          <span aria-hidden className={styles.gbFlicker} />
          <span aria-hidden className={styles.gbScan} />
        </button>
      </div>

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
                className={cn(
                  "relative pointer-events-auto rounded-[var(--radius-2xl)] overflow-hidden",
                  "bg-card/92 backdrop-blur-xl",
                  "shadow-[0_12px_40px_hsl(var(--shadow-color)/0.55)] ring-1 ring-ring/18",
                  "p-2",
                  "max-h-[60vh] min-w-56 overflow-y-auto scrollbar-thin",
                  "scrollbar-thumb-foreground/12 scrollbar-track-transparent",
                  dropdownClassName,
                )}
                data-open="true"
              >
                <span aria-hidden className={styles.gbIris} />
                <span aria-hidden className={styles.gbChroma} />
                <span aria-hidden className={styles.gbFlicker} />
                <span aria-hidden className={styles.gbScan} />

                {items.map((it, idx) => {
                  const active = it.value === value;
                  const disabledItem = !!it.disabled || it.loading;
                  return (
                    <li key={String(it.value)} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        data-index={idx}
                        disabled={disabledItem}
                        onClick={() => selectByIndex(idx)}
                        onFocus={() => setActiveIndex(idx)}
                        className={cn(
                          "group relative w-full rounded-[var(--radius-xl)] px-4 py-3 text-left transition-colors duration-[var(--dur-quick)] ease-out motion-reduce:transition-none hover:bg-[--hover] active:bg-[--active] [--hover:hsl(var(--foreground)/0.05)] [--active:hsl(var(--foreground)/0.1)]",
                          disabledItem
                            ? "cursor-not-allowed"
                            : "cursor-pointer",
                          "disabled:opacity-[var(--disabled)] disabled:pointer-events-none",
                          active
                            ? "bg-primary/14 text-primary-foreground [--hover:hsl(var(--primary)/0.25)] [--active:hsl(var(--primary)/0.35)]"
                            : "",
                          "focus:[outline:none] focus-visible:[outline:none] focus:ring-2 focus:ring-[--theme-ring] focus:ring-offset-0 data-[loading=true]:opacity-[var(--loading)] data-[loading=true]:pointer-events-none",
                          it.className ?? "",
                        )}
                        data-loading={it.loading}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className={cn("text-ui leading-none", styles.glitchText)}>
                            {it.label}
                          </span>
                          <Check
                            className={cn(
                              "size-4 shrink-0 transition-opacity duration-[var(--dur-quick)] ease-out motion-reduce:transition-none",
                              active
                                ? "opacity-90"
                                : "opacity-0 group-hover:opacity-30",
                            )}
                            aria-hidden="true"
                          />
                        </div>

                        <span
                          aria-hidden
                          className={cn(
                            "pointer-events-none absolute left-0 top-1/2 h-3/4 w-0.5 -translate-y-1/2 rounded-[var(--radius-md)]",
                            active ? "bg-ring" : "bg-transparent",
                          )}
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
    </div>
  );
});

AnimatedSelect.displayName = "AnimatedSelect";

export default AnimatedSelect;
export type { AnimatedSelectProps } from "./Select.types";
