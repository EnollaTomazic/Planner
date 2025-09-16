// src/components/ui/TitleBar.tsx
"use client";

import * as React from "react";

type Props = {
  label: string;
  idText?: string; // optional right-side pill (defaults to NOXI vibe)
};

export default function TitleBar({ label, idText = "ID:0x13LG" }: Props) {
  return (
    <>
      <div className="term-mini flex items-center gap-[var(--space-2)] px-[var(--space-2)] py-[var(--space-2)] rounded-full border border-border">
        <span className="term-mini__text text-muted-foreground">{label}</span>
        <span className="pill pill--pulse ml-auto">{idText}</span>
      </div>

      {/* Scoped styles — no globals, no theme drift */}
      <style jsx>{`
        .term-mini {
          background:
            linear-gradient(
              180deg,
              hsl(var(--foreground) / 0.04),
              hsl(var(--shadow-color) / 0.05)
            ),
            hsl(var(--card));
          box-shadow:
            0 0 0 1px
              color-mix(in oklab, hsl(var(--shadow-color)) 28%, transparent),
            0 10px 20px -14px
              color-mix(in oklab, hsl(var(--shadow-color)) 55%, transparent),
            inset 0 1px 0 hsl(var(--foreground) / 0.03);
        }
        .term-mini__text {
          font-family:
            ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
          @apply text-ui font-medium tracking-[0.02em];
        }
      `}</style>
    </>
  );
}
