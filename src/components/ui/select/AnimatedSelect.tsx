"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import useMounted from "@/lib/useMounted";
import { cn } from "@/lib/utils";

import Spinner from "../feedback/Spinner";

import defaultStyles from "./Select.module.css";
import type { AnimatedSelectProps } from "./shared";

type SelectStyles = typeof defaultStyles;

type AnimatedSelectComponentProps = AnimatedSelectProps & {
  styles?: SelectStyles;
};

type SelectSize = NonNullable<AnimatedSelectProps["size"]>;

const DEFAULT_TRIGGER_SIZE: SelectSize = "md";

const SIZE_STYLES: Record<
  SelectSize,
  {
    height: string;
    paddingX: string;
    caret: string;
    prefix: string;
  }
> = {
  sm: {
    height: "h-[var(--control-h-sm)]",
    paddingX: "px-[var(--space-3)]",
    caret: "size-[var(--space-4)]",
    prefix: "size-[var(--space-4)]",
  },
  md: {
    height: "h-[var(--control-h-md)]",
    paddingX: "px-[var(--space-3)]",
    caret: "size-[var(--space-5)]",
    prefix: "size-[var(--space-5)]",
  },
  lg: {
    height: "h-[var(--control-h-lg)]",
    paddingX: "px-[var(--space-4)]",
    caret: "size-[var(--space-6)]",
    prefix: "size-[var(--space-6)]",
  },
  xl: {
    height: "h-[var(--control-h-xl)]",
    paddingX: "px-[var(--space-4)]",
    caret: "size-[var(--space-6)]",
    prefix: "size-[var(--space-6)]",
  },
};

const AnimatedSelect = React.forwardRef<
  HTMLButtonElement,
  AnimatedSelectComponentProps
>(
  function AnimatedSelect(
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
      size = DEFAULT_TRIGGER_SIZE,
      styles: stylesOverride,
    },
    ref,
  ) {
    const styles = stylesOverride ?? defaultStyles;
    const sizeStyles = SIZE_STYLES[size] ?? SIZE_STYLES[DEFAULT_TRIGGER_SIZE];
    const mounted = useMounted();

    const [open, setOpen] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState<number>(() => {
      const selectedIndex = items.findIndex(
        (i) => i.value === value && !i.disabled && !i.loading,
      );
      if (selectedIndex !== -1) {
        return selectedIndex;
      }
      for (let i = 0; i < items.length; i += 1) {
        const candidate = items[i];
        if (candidate && !candidate.disabled && !candidate.loading) {
          return i;
        }
      }
      return -1;
    });

    const isOptionFocusable = React.useCallback(
      (index: number) => {
        const opt = items[index];
        return !!opt && !opt.disabled && !opt.loading;
      },
      [items],
    );

    const getFirstFocusableIndex = React.useCallback(() => {
      for (let i = 0; i < items.length; i += 1) {
        if (isOptionFocusable(i)) {
          return i;
        }
      }
      return -1;
    }, [items, isOptionFocusable]);

    const getLastFocusableIndex = React.useCallback(() => {
      for (let i = items.length - 1; i >= 0; i -= 1) {
        if (isOptionFocusable(i)) {
          return i;
        }
      }
      return -1;
    }, [items, isOptionFocusable]);

    const getNextFocusableIndex = React.useCallback(
      (start: number, direction: 1 | -1) => {
        if (items.length === 0) {
          return -1;
        }
        let idx = start;
        for (let i = 0; i < items.length; i += 1) {
          idx = (idx + direction + items.length) % items.length;
          if (isOptionFocusable(idx)) {
            return idx;
          }
        }
        return -1;
      },
      [items, isOptionFocusable],
    );

    const triggerRef = React.useRef<HTMLButtonElement | null>(null);
    const setTriggerRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }
      },
      [ref],
    );
    const listRef = React.useRef<HTMLUListElement | null>(null);

    const focusItem = React.useCallback(
      (index: number) => {
        if (!isOptionFocusable(index)) return;
        listRef.current
          ?.querySelector<HTMLElement>(`[data-index="${index}"]`)
          ?.focus();
      },
      [isOptionFocusable],
    );
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

    const rafId = React.useRef<number | null>(null);
    const scheduleMeasure = React.useCallback(() => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        measure();
      });
    }, [measure]);

    React.useEffect(() => {
      return () => {
        if (rafId.current !== null) cancelAnimationFrame(rafId.current);
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
      scheduleMeasure();
    }, [open, scheduleMeasure, size]);

    React.useEffect(() => {
      if (!open) return;
      const selectedIndex = items.findIndex((i) => i.value === value);
      const nextIndex =
        selectedIndex !== -1 && isOptionFocusable(selectedIndex)
          ? selectedIndex
          : getFirstFocusableIndex();
      setActiveIndex(nextIndex);
      if (nextIndex === -1) {
        return;
      }
      const t = setTimeout(() => {
        focusItem(nextIndex);
      }, 0);
      return () => clearTimeout(t);
    }, [
      open,
      items,
      value,
      focusItem,
      getFirstFocusableIndex,
      isOptionFocusable,
    ]);

    React.useEffect(() => {
      if (activeIndex === -1) return;
      if (isOptionFocusable(activeIndex)) return;
      setActiveIndex(getFirstFocusableIndex());
    }, [activeIndex, getFirstFocusableIndex, isOptionFocusable, items]);

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
        const first = getFirstFocusableIndex();
        if (first !== -1) {
          setActiveIndex(first);
          focusItem(first);
        }
        return;
      }
      if (e.key === "End") {
        e.preventDefault();
        const last = getLastFocusableIndex();
        if (last !== -1) {
          setActiveIndex(last);
          focusItem(last);
        }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = getNextFocusableIndex(activeIndex, 1);
        if (next !== -1) {
          setActiveIndex(next);
          focusItem(next);
        }
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = getNextFocusableIndex(activeIndex, -1);
        if (prev !== -1) {
          setActiveIndex(prev);
          focusItem(prev);
        }
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectByIndex(activeIndex);
      }
    }

    function selectByIndex(index: number) {
      const opt = items[index];
      if (!opt || opt.disabled || opt.loading) return;
      onChange?.(opt.value);
      opt.onSelect?.();
      setOpen(false);
    }

    const menuPosition = React.useMemo<
      { style: React.CSSProperties; placement: "top" | "bottom" } | null
    >(() => {
      if (!rect) return null;
      if (typeof window === "undefined") return null;

      const gap = 8;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const widthForClamp = menuW ?? rect.width;
      const measuredWidth = widthForClamp || rect.width;

      let left = align === "right" ? rect.right - measuredWidth : rect.left;
      const maxLeft = Math.max(8, viewportWidth - measuredWidth - 8);
      left = Math.min(Math.max(8, left), maxLeft);

      const spaceBelow = Math.max(viewportHeight - rect.bottom - gap, 0);
      const spaceAbove = Math.max(rect.top - gap, 0);
      const openDown = spaceBelow >= spaceAbove;
      const fallbackSpace = Math.max(viewportHeight - gap * 2, 0);
      const availableSpace = openDown ? spaceBelow : spaceAbove;
      const baseMaxHeight = Math.round(viewportHeight * 0.6);
      const resolvedMaxHeight = Math.max(
        0,
        Math.min(baseMaxHeight, availableSpace > 0 ? availableSpace : fallbackSpace),
      );

      const style: React.CSSProperties = {
        position: "fixed",
        left: Math.round(left),
        minWidth: matchTriggerWidth ? Math.round(rect.width) : undefined,
        zIndex: 10_000,
        transformOrigin: openDown ? "top" : "bottom",
      };

      if (resolvedMaxHeight > 0) {
        style.maxHeight = Math.round(resolvedMaxHeight);
      }

      if (openDown) {
        style.top = Math.round(rect.bottom + gap);
      } else {
        style.bottom = Math.round(viewportHeight - rect.top + gap);
      }

      return {
        style,
        placement: openDown ? "bottom" : "top",
      };
    }, [align, matchTriggerWidth, menuW, rect]);

    const fixedStyles = menuPosition?.style;
    const placement = menuPosition?.placement ?? "bottom";
    const yOffset = placement === "bottom" ? -4 : 4;

    const triggerAria =
      ariaLabel ??
      (typeof label === "string"
        ? label
        : typeof prefixLabel === "string"
          ? prefixLabel
          : "Select option");

    const triggerCls = cn(
      styles.glitchTrigger,
      "relative flex items-center rounded-[var(--control-radius)] overflow-hidden",
      sizeStyles.height,
      sizeStyles.paddingX,
      "bg-muted/12 hover:bg-muted/18",
      "focus:[outline:none] focus-visible:[outline:none]",
      "transition-colors duration-[var(--dur-quick)] ease-out motion-reduce:transition-none",
      buttonClassName,
    );

    const caretCls = cn(
      styles.caret,
      "ml-auto shrink-0 opacity-75",
      sizeStyles.caret,
      open && styles.caretOpen,
    );

    return (
      <div id={id} className={cn("glitch-wrap", className)}>
        {label ? (
          <div
            id={labelId}
            className={cn(
              hideLabel
                ? "sr-only"
                : "mb-[var(--space-1)] text-label text-muted-foreground",
            )}
          >
            {label}
          </div>
        ) : null}

        <div className="group inline-flex rounded-[var(--control-radius)] border border-[var(--focus)] focus-within:ring-2 focus-within:ring-[var(--focus)] focus-within:ring-offset-0">
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
                className={cn(
                  "shrink-0 opacity-70 transition-colors duration-[var(--dur-quick)] ease-out motion-reduce:transition-none",
                  sizeStyles.prefix,
                )}
              />
            ) : null}

            <span
              className={cn(
                "font-medium",
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
                      : { opacity: 0, y: yOffset, scale: 0.98 }
                  }
                  animate={
                    reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
                  }
                  exit={
                    reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: yOffset, scale: 0.98 }
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
                    "shadow-dropdown ring-1 ring-ring/18",
                    "p-[var(--space-2)]",
                    "max-h-[60vh] min-w-[calc(var(--space-8)*3.5)] overflow-y-auto scrollbar-thin",
                    "scrollbar-thumb-foreground/12 scrollbar-track-transparent",
                    dropdownClassName,
                  )}
                  data-open="true"
                  data-side={placement}
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
                          aria-disabled={disabledItem || undefined}
                          aria-busy={it.loading || undefined}
                          onClick={() => selectByIndex(idx)}
                          onFocus={() => setActiveIndex(idx)}
                          className={cn(
                            "group relative w-full rounded-[var(--radius-xl)] px-[var(--space-4)] py-[var(--space-3)] text-left transition-colors duration-[var(--dur-quick)] ease-out motion-reduce:transition-none hover:bg-[--hover] active:bg-[--active] [--hover:hsl(var(--foreground)/0.05)] [--active:hsl(var(--foreground)/0.1)]",
                            disabledItem
                              ? "cursor-not-allowed"
                              : "cursor-pointer",
                            "disabled:opacity-[var(--disabled)] disabled:pointer-events-none",
                            active
                              ? "bg-primary/14 text-primary-foreground [--hover:hsl(var(--primary)/0.25)] [--active:hsl(var(--primary)/0.35)]"
                              : undefined,
                            "focus:[outline:none] focus-visible:[outline:none] focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-0 data-[loading=true]:opacity-[var(--loading)] data-[loading=true]:pointer-events-none",
                            it.className,
                          )}
                          data-loading={it.loading}
                        >
                          <div className="flex items-center justify-between gap-[var(--space-3)]">
                            <span className={cn("text-ui leading-none", styles.glitchText)}>
                              {it.label}
                            </span>
                            {it.loading ? (
                              <span
                                aria-hidden="true"
                                className="flex size-[var(--space-4)] shrink-0 items-center justify-center"
                              >
                                <Spinner
                                  size="var(--space-4)"
                                  className="border-border border-t-transparent opacity-80"
                                />
                              </span>
                            ) : (
                              <Check
                                className={cn(
                                  "size-[var(--space-4)] shrink-0 transition-opacity duration-[var(--dur-quick)] ease-out motion-reduce:transition-none",
                                  active
                                    ? "opacity-90"
                                    : "opacity-0 group-hover:opacity-30",
                                )}
                                aria-hidden="true"
                              />
                            )}
                          </div>

                          <span
                            aria-hidden
                            className={cn(
                              "pointer-events-none absolute left-0 top-1/2 h-3/4 w-[calc(var(--space-1)/2)] -translate-y-1/2 rounded-[var(--radius-md)]",
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
  },
);

AnimatedSelect.displayName = "AnimatedSelect";

export default AnimatedSelect;
