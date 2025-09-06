// src/components/ui/TitleBar.tsx
"use client";

type Props = {
  label: string;
  idText?: string; // optional right-side pill (defaults to NOXI vibe)
};

export default function TitleBar({ label, idText = "ID:0x13LG" }: Props) {
  return (
    <>
      <div className="term-mini">
        <span className="term-mini__text">{label}</span>
        <span className="pill pill--pulse ml-auto">{idText}</span>
      </div>

      {/* Scoped styles — no globals, no theme drift */}
      <style jsx>{`
        .term-mini {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.6rem;
          border: 1px solid hsl(var(--border));
          border-radius: 9999px;
          background:
            linear-gradient(
              180deg,
              hsl(var(--foreground) / 0.04),
              hsl(var(--shadow-color) / 0.05)
            ),
            hsl(var(--card));
          box-shadow:
            0 0 0 1px color-mix(in oklab, hsl(var(--shadow-color)) 28%, transparent),
            0 10px 20px -14px color-mix(in oklab, hsl(var(--shadow-color)) 55%, transparent),
            inset 0 1px 0 hsl(var(--foreground) / 0.03);
        }
        .term-mini__text {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
          font-size: 0.95rem;
          letter-spacing: 0.3px;
          color: hsl(var(--muted-foreground));
        }
      `}</style>
    </>
  );
}
