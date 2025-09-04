"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ROLE_OPTIONS } from "@/components/reviews/reviewData";
import type { Role } from "@/lib/types";

type Props = {
  value: Role;
  onChange: (v: Role) => void;
  className?: string;
};

/** Allow CSS custom props on style without `any` */
type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/**
 * RoleSelector — segmented control with sliding pill animation.
 * Animation/colors are defined in reviews/style.css ('.seg' rules).
 */
export default function RoleSelector({ value, onChange, className }: Props) {
  const count = ROLE_OPTIONS.length;
  const idx = Math.max(0, ROLE_OPTIONS.findIndex((r) => r.value === value));

  const styleVars: CSSVars = {
    "--seg-count": count,
    "--seg-idx": idx,
  };

  const select = (v: Role) => v !== value && onChange(v);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      select(ROLE_OPTIONS[(idx - 1 + count) % count].value);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      select(ROLE_OPTIONS[(idx + 1) % count].value);
    } else if (e.key === "Home") {
      e.preventDefault();
      select(ROLE_OPTIONS[0].value);
    } else if (e.key === "End") {
      e.preventDefault();
      select(ROLE_OPTIONS[count - 1].value);
    }
  };

  return (
    <div
      className={cn("seg seg--roles", className)}
      role="radiogroup"
      aria-label="Select lane/role"
      tabIndex={0}
      onKeyDown={onKeyDown}
      style={styleVars}
    >
      {/* Sliding pill / rail */}
      <span aria-hidden className="seg__rail" />

      {/* Buttons */}
      <div
        className="seg__list"
        style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
      >
        {ROLE_OPTIONS.map(({ value: v, Icon, label }) => {
          const active = v === value;
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={active}
              title={label}
              className={cn("seg__btn", active ? "seg__btn--active" : "seg__btn--idle")}
              onClick={() => select(v)}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
