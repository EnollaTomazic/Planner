import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Check, Copy, X } from "lucide-react";
import tokens from "../../../../tokens/tokens.js";

// Utility functions
function rgbToHex(rgb: string) {
  const res = rgb
    .match(/\d+/g)
    ?.slice(0, 3)
    .map((n) => Number(n).toString(16).padStart(2, "0"));
  return res ? `#${res.join("")}` : rgb;
}

function luminance(rgb: string) {
  const [r, g, b] = rgb
    .match(/\d+/g)
    ?.slice(0, 3)
    .map((n) => Number(n) / 255) ?? [0, 0, 0];
  const a = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrast(fg: string, bg: string) {
  const L1 = luminance(fg);
  const L2 = luminance(bg);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

function ColorTokens() {
  const [mode, setMode] = React.useState<"dark" | "light">("dark");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const entries = React.useMemo(
    () => Object.keys(tokens as Record<string, string>),
    [],
  );

  function copyToken(name: string) {
    navigator.clipboard?.writeText(`var(--${name})`);
  }

  return (
    <div className="space-y-[var(--space-4)]">
      <button
        className="rounded border px-[var(--space-2)] py-[var(--space-1)] text-xs"
        onClick={() => setMode(mode === "dark" ? "light" : "dark")}
      >
        {mode === "dark" ? "Light" : "Dark"} preview
      </button>
      <div
        ref={containerRef}
        className={
          mode === "dark"
            ? "bg-background text-foreground p-[var(--space-4)]"
            : "bg-background text-foreground p-[var(--space-4)]"
        }
      >
        <ul className="space-y-[var(--space-2)]">
          {entries.map((name) => (
            <TokenRow
              key={name}
              name={name}
              containerRef={containerRef}
              onCopy={copyToken}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

const meta: Meta<typeof ColorTokens> = {
  title: "Prompts/ColorTokens",
  component: ColorTokens,
};
export default meta;

type Story = StoryObj<typeof ColorTokens>;

export const Default: Story = {
  render: () => <ColorTokens />,
};

function TokenRow({
  name,
  containerRef,
  onCopy,
}: {
  name: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCopy: (name: string) => void;
}) {
  const swatchRef = React.useRef<HTMLDivElement>(null);
  const [hex, setHex] = React.useState("");
  const [ratio, setRatio] = React.useState(0);

  React.useEffect(() => {
    const swatch = swatchRef.current;
    const container = containerRef.current;
    if (!swatch || !container) return;
    const fg = getComputedStyle(swatch).backgroundColor;
    const bg = getComputedStyle(container).backgroundColor;
    setHex(rgbToHex(fg));
    setRatio(contrast(fg, bg));
  }, [containerRef]);

  const pass = ratio >= 4.5;

  return (
    <li className="flex items-center gap-[var(--space-3)] text-xs">
      <div
        ref={swatchRef}
        className="size-[var(--space-5)] rounded border"
        style={{ backgroundColor: `hsl(var(--${name}))` }}
      />
      <span className="flex-1 font-mono">{name}</span>
      <span className="font-mono">{hex}</span>
      <button
        onClick={() => onCopy(name)}
        aria-label="Copy token"
        className="p-[var(--space-1)]"
      >
        <Copy size={14} />
      </button>
      {pass ? (
        <Check size={14} style={{ color: `hsl(var(--success))` }} />
      ) : (
        <X size={14} style={{ color: `hsl(var(--danger))` }} />
      )}
    </li>
  );
}
