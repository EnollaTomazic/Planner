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
            0 0 0 var(--hairline-w)
              color-mix(in oklab, hsl(var(--shadow-color)) 28%, transparent),
            var(--shadow-neo-soft),
            var(--shadow),
            inset 0 var(--hairline-w) 0 hsl(var(--foreground) / 0.03);
        }
        .term-mini__text {
          font-family:
            ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
          font-size: var(--font-ui);
          line-height: 1.35;
          font-weight: 500;
          letter-spacing: 0.02em;
        }
      `}</style>
    </>
  );
}
