"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

import Spinner from "../feedback/Spinner";
import type { AnimatedSelectProps } from "./shared";
import type { UseAnimatedSelectReturn } from "./useAnimatedSelect";

type SelectStyles = Record<string, string>;

type AnimatedSelectListProps = {
  open: boolean;
  items: AnimatedSelectProps["items"];
  value?: string;
  setActiveIndex: UseAnimatedSelectReturn["setActiveIndex"];
  selectByIndex: UseAnimatedSelectReturn["selectByIndex"];
  onKeyDown: UseAnimatedSelectReturn["onListKeyDown"];
  listRef: UseAnimatedSelectReturn["listRef"];
  styles: SelectStyles;
  dropdownClassName?: string;
  triggerAria?: string;
  label?: React.ReactNode;
  labelId: string;
  listboxId: string;
  fixedStyles?: React.CSSProperties;
  placement: UseAnimatedSelectReturn["placement"];
  reduceMotion: UseAnimatedSelectReturn["reduceMotion"];
  durQuick: UseAnimatedSelectReturn["durQuick"];
  yOffset: UseAnimatedSelectReturn["yOffset"];
};

export function AnimatedSelectList({
  open,
  items,
  value,
  setActiveIndex,
  selectByIndex,
  onKeyDown,
  listRef,
  styles,
  dropdownClassName,
  triggerAria,
  label,
  labelId,
  listboxId,
  fixedStyles,
  placement,
  reduceMotion,
  durQuick,
  yOffset,
}: AnimatedSelectListProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.ul
          ref={listRef}
          key="menu"
          role="listbox"
          id={listboxId}
          tabIndex={-1}
          aria-labelledby={label ? labelId : undefined}
          aria-label={label ? undefined : triggerAria}
          initial={
            reduceMotion ? { opacity: 0 } : { opacity: 0, y: yOffset, scale: 0.98 }
          }
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={
            reduceMotion ? { opacity: 0 } : { opacity: 0, y: yOffset, scale: 0.98 }
          }
          transition={
            reduceMotion ? { duration: 0 } : { duration: durQuick, ease: "easeOut" }
          }
          style={fixedStyles}
          onKeyDown={onKeyDown}
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

          {items.map((item, index) => {
            const active = item.value === value;
            const disabledItem = !!item.disabled || item.loading;

            return (
              <li key={String(item.value)} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  data-index={index}
                  disabled={disabledItem}
                  aria-disabled={disabledItem || undefined}
                  aria-busy={item.loading || undefined}
                  onClick={() => selectByIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  className={cn(
                    "group relative w-full rounded-[var(--radius-xl)] px-[var(--space-4)] py-[var(--space-3)] text-left transition-colors duration-[var(--dur-quick)] ease-out motion-reduce:transition-none hover:bg-[--hover] active:bg-[--active] [--hover:hsl(var(--foreground)/0.05)] [--active:hsl(var(--foreground)/0.1)]",
                    disabledItem ? "cursor-not-allowed" : "cursor-pointer",
                    "disabled:opacity-[var(--disabled)] disabled:pointer-events-none",
                    active
                      ? "bg-primary/14 text-primary-foreground [--hover:hsl(var(--primary)/0.25)] [--active:hsl(var(--primary)/0.35)]"
                      : undefined,
                    "focus:[outline:none] focus-visible:[outline:none] focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-0 data-[loading=true]:opacity-[var(--loading)] data-[loading=true]:pointer-events-none",
                    item.className,
                  )}
                  data-loading={item.loading}
                >
                  <div className="flex items-center justify-between gap-[var(--space-3)]">
                    <span className={cn("text-ui leading-none", styles.glitchText)}>
                      {item.label}
                    </span>
                    {item.loading ? (
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
                          active ? "opacity-90" : "opacity-0 group-hover:opacity-30",
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
    </AnimatePresence>
  );
}
