"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ROLE_OPTIONS } from "@/components/reviews/reviewData";
import type { Role } from "@/lib/types";
import styles from "./RoleSelector.module.css";

type Props = {
  value: Role;
  onChange: (v: Role) => void;
  className?: string;
};

/**
 * Segmented radio control for role selection.
 * Implements roving tabindex and accessible announcements.
 */
export default function RoleSelector({ value, onChange, className }: Props) {
  const count = ROLE_OPTIONS.length;
  const activeIdx = Math.max(
    0,
    ROLE_OPTIONS.findIndex((r) => r.value === value),
  );
  const [focusIdx, setFocusIdx] = React.useState(activeIdx);
  const btnRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const liveRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    setFocusIdx(activeIdx);
    const { label } = ROLE_OPTIONS[activeIdx] ?? {};
    if (label && liveRef.current) {
      liveRef.current.textContent = `${label}, selected, ${activeIdx + 1} of ${count}`;
    }
  }, [activeIdx, count]);

  const select = (idx: number) => {
    const opt = ROLE_OPTIONS[idx];
    if (opt && opt.value !== value) onChange(opt.value);
  };

  const moveFocus = (idx: number) => {
    const next = (idx + count) % count;
    setFocusIdx(next);
    btnRefs.current[next]?.focus();
  };

  const onKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number,
  ) => {
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        moveFocus(idx - 1);
        break;
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        moveFocus(idx + 1);
        break;
      case "Home":
        e.preventDefault();
        moveFocus(0);
        break;
      case "End":
        e.preventDefault();
        moveFocus(count - 1);
        break;
      case " ":
      case "Enter":
        e.preventDefault();
        select(idx);
        break;
    }
  };

  const styleVars: React.CSSProperties = {
    "--seg-count": count,
    "--seg-idx": activeIdx,
  } as React.CSSProperties;

  return (
    <div
      className={cn(styles.tray, className)}
      role="radiogroup"
      aria-label="Select lane/role"
      style={styleVars}
    >
      <span aria-live="polite" className="sr-only" ref={liveRef} />
      <span aria-hidden className={styles.highlight} />
      <div className={styles.list}>
        {ROLE_OPTIONS.map(({ value: v, Icon, label }, i) => {
          const active = i === activeIdx;
          return (
            <button
              key={v}
              ref={(el) => {
                btnRefs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={focusIdx === i ? 0 : -1}
              className={cn(styles.chip, active ? styles.active : styles.idle)}
              onClick={() => select(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <Icon className={styles.icon} />
              <span className={styles.label}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
