// src/components/ui/TitleBar.tsx
"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./TitleBar.module.css";

type Props = {
  label: string;
  idText?: string; // optional right-side pill (defaults to NOXI vibe)
};

export function TitleBar({ label, idText = "ID:0x13LG" }: Props) {
  return (
    <div
      className={cn(
        "flex items-center gap-[var(--space-2)] px-[var(--space-2)] py-[var(--space-2)] rounded-full border border-border",
        styles.termMini,
      )}
    >
      <span className={cn(styles.termMiniText, "text-muted-foreground")}>
        {label}
      </span>
      <span className="pill pill--pulse ml-auto">{idText}</span>
    </div>
  );
}
