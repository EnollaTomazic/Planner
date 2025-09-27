// src/components/ui/NeonIcon.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Phase = "steady-on" | "ignite" | "off" | "powerdown";

type NeonIconProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  on: boolean;
  size?: number | string;
  /** CSS variable name like "--accent", "--primary", "--ring" */
  colorVar?: string;
  title?: string;
  className?: string;
  /** toggle CRT scanlines layer */
  scanlines?: boolean;
  /** toggle wide aura layer */
  aura?: boolean;
};

type NeonVars = React.CSSProperties & {
  ["--ni-size"]?: string;
  ["--ni-k"]?: string;
  ["--ni-color"]?: string;
};

export function NeonIcon({
  icon: Icon,
  on,
  size = "1em",
  colorVar = "--accent",
  title,
  className,
  scanlines = true,
  aura = true,
}: NeonIconProps) {
  const prev = React.useRef(on);
  const [phase, setPhase] = React.useState<Phase>(on ? "steady-on" : "off");

  React.useEffect(() => {
    if (on !== prev.current) {
      if (on) {
        setPhase("ignite");
        const t = setTimeout(() => setPhase("steady-on"), 620);
        prev.current = on;
        return () => clearTimeout(t);
      } else {
        setPhase("powerdown");
        const t = setTimeout(() => setPhase("off"), 360);
        prev.current = on;
        return () => clearTimeout(t);
      }
    }
    prev.current = on;
  }, [on]);

  const lit = phase === "ignite" || phase === "steady-on";

  const sizeValue = typeof size === "number" ? `${size}px` : size;
  const kValue =
    typeof size === "number"
      ? `${Math.round(size * 0.56)}px`
      : `calc(${sizeValue} * 0.56)`;
  const styleVars: NeonVars = {
    "--ni-size": sizeValue,
    "--ni-k": kValue,
    "--ni-color": `hsl(var(${colorVar}))`,
  };

  return (
    <span
      className={cn(
        "ni-root relative inline-grid place-items-center overflow-visible rounded-full border",
        "border-border bg-card/35",
        className
      )}
      style={styleVars}
      data-phase={phase}
      aria-hidden
      title={title}
    >
      {/* Base glyph */}
      <Icon
        className="relative z-10"
        style={{
          width: "var(--ni-k)",
          height: "var(--ni-k)",
          strokeWidth: "var(--icon-stroke-100, 2)",
          color: "var(--ni-color)",
          opacity: lit ? 1 : 0.38,
          transition: "opacity 220ms var(--ease-out), transform 220ms var(--ease-out)",
          transform:
            phase === "ignite"
              ? "scale(1.02)"
              : phase === "powerdown"
                ? "scale(var(--ni-powerdown-scale-end))"
                : "scale(1)",
        }}
      />

      {/* Tight glow */}
      <Icon
        className={cn("absolute", lit && "animate-[niCore_2.8s_ease-in-out_infinite]")}
        style={{
          width: "var(--ni-k)",
          height: "var(--ni-k)",
          color: "var(--ni-color)",
          opacity: lit ? 0.78 : 0.06,
          filter:
            "blur(var(--ni-core-blur)) drop-shadow(0 0 var(--ni-core-shadow) var(--ni-color))",
          transition: "opacity 220ms var(--ease-out)",
        }}
        aria-hidden
      />

      {/* Wide aura (optional) */}
      {aura && (
        <Icon
          className={cn("absolute", lit && "animate-[niAura_3.6s_ease-in-out_infinite]")}
          style={{
            width: "var(--ni-k)",
            height: "var(--ni-k)",
            color: "var(--ni-color)",
            opacity: lit ? 0.42 : 0.04,
            filter:
              "blur(var(--ni-aura-blur)) drop-shadow(0 0 var(--ni-aura-shadow) var(--ni-color))",
            transition: "opacity 220ms var(--ease-out)",
          }}
          aria-hidden
        />
      )}

      {/* CRT scanlines (optional) */}
      {scanlines && (
        <span
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full mix-blend-overlay",
            lit ? "opacity-35 animate-[niScan_2.1s_linear_infinite]" : "opacity-0"
          )}
          style={{
            background:
              "repeating-linear-gradient(0deg, hsl(var(--foreground)/0.07) 0 var(--hairline-w), transparent var(--hairline-w) calc(var(--hairline-w)*3))",
            transition: "opacity 220ms var(--ease-out)",
          }}
          aria-hidden
        />
      )}

      {/* One-shot overlays */}
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full",
          phase === "ignite" && "animate-[niIgnite_.62s_steps(18,end)_1]"
        )}
        style={{
            background:
              "radial-gradient(80% 80% at 50% 50%, hsl(var(--foreground)/0.25), transparent 60%)",
          mixBlendMode: "screen",
          opacity: phase === "ignite" ? 0.85 : 0,
        }}
        aria-hidden
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full",
          phase === "powerdown" && "animate-[niPowerDown_.36s_linear_1]"
        )}
        style={{
            background:
              "radial-gradient(120% 120% at 50% 50%, hsl(var(--foreground)/0.16), transparent 60%)",
          mixBlendMode: "screen",
          opacity: phase === "powerdown" ? 0.6 : 0,
        }}
        aria-hidden
      />

      {/* Scoped keyframes */}
      <style jsx>{`
        .ni-root {
          width: var(--ni-size);
          height: var(--ni-size);
          --ni-core-blur: calc(var(--hairline-w) * 2.5);
          --ni-core-shadow: var(--space-3);
          --ni-aura-blur: calc(var(--space-2) - var(--hairline-w));
          --ni-aura-shadow: calc(var(--space-5) - var(--hairline-w) * 2);
          --ni-core-opacity-min: 0.66;
          --ni-core-opacity-max: 0.88;
          --ni-core-scale: 1.012;
          --ni-aura-opacity-min: 0.32;
          --ni-aura-opacity-max: 0.52;
          --ni-scan-shift: 28%;
          --ni-ignite-blur-strong: calc(var(--hairline-w) * 0.6);
          --ni-ignite-blur-soft: calc(var(--hairline-w) * 0.2);
          --ni-ignite-opacity-low: 0.1;
          --ni-ignite-opacity-mid: 0.25;
          --ni-ignite-opacity-waver: 0.35;
          --ni-ignite-opacity-flicker: 0.45;
          --ni-powerdown-opacity-start: 0.8;
          --ni-powerdown-opacity-mid: 0.35;
          --ni-powerdown-opacity-low: 0.12;
          --ni-powerdown-scale-mid: 0.992;
          --ni-powerdown-scale-end: 0.985;
          --ni-powerdown-translate: calc(var(--hairline-w) / 5);
        }

        @keyframes niCore {
          0% { opacity: var(--ni-core-opacity-min); transform: scale(1); }
          50%{ opacity: var(--ni-core-opacity-max); transform: scale(var(--ni-core-scale)); }
          100%{ opacity: var(--ni-core-opacity-min); transform: scale(1); }
        }
        @keyframes niAura {
          0% { opacity: var(--ni-aura-opacity-min); }
          50%{ opacity: var(--ni-aura-opacity-max); }
          100%{ opacity: var(--ni-aura-opacity-min); }
        }
        @keyframes niScan {
          0% { transform: translateY(calc(var(--ni-scan-shift) * -1)); }
          100%{ transform: translateY(var(--ni-scan-shift)); }
        }
        @keyframes niIgnite {
          0%{ opacity: var(--ni-ignite-opacity-low); filter: blur(var(--ni-ignite-blur-strong)); }
          8%{ opacity: 1; }
          12%{ opacity: var(--ni-ignite-opacity-mid); }
          20%{ opacity: 1; }
          28%{ opacity: var(--ni-ignite-opacity-waver); }
          40%{ opacity: 1; }
          55%{ opacity: var(--ni-ignite-opacity-flicker); filter: blur(var(--ni-ignite-blur-soft)); }
          70%{ opacity: 1; }
          100%{ opacity: 0; }
        }
        @keyframes niPowerDown {
          0%{ opacity: var(--ni-powerdown-opacity-start); transform: scale(1); }
          30%{
            opacity: var(--ni-powerdown-opacity-mid);
            transform: scale(var(--ni-powerdown-scale-mid)) translateY(var(--ni-powerdown-translate));
          }
          60%{
            opacity: var(--ni-powerdown-opacity-low);
            transform: scale(var(--ni-powerdown-scale-end))
              translateY(calc(var(--ni-powerdown-translate) * -1));
          }
          100%{ opacity: 0; transform: scale(var(--ni-powerdown-scale-end)); }
        }
      `}</style>
    </span>
  );
}

export function NeonGlowWrap({ lit, children }: { lit: boolean; children: React.ReactNode }) {
  return (
    <span className="relative inline-flex">
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[var(--radius-2xl)]",
          lit ? "opacity-60" : "opacity-0"
        )}
        style={{
          filter: "blur(calc(var(--space-3) - var(--hairline-w) * 2))",
          background:
            "radial-gradient(60% 60% at 50% 50%, hsl(var(--accent)/.45), transparent 70%)",
          transition: "opacity 220ms var(--ease-out)",
        }}
        aria-hidden
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[var(--radius-2xl)]",
          lit ? "opacity-40 animate-[niAura_3.6s_ease-in-out_infinite]" : "opacity-0"
        )}
        style={{
          filter: "blur(calc(var(--space-4) - var(--hairline-w) * 2))",
          background:
            "radial-gradient(80% 80% at 50% 50%, hsl(var(--primary)/.35), transparent 75%)",
          transition: "opacity 220ms var(--ease-out)",
        }}
        aria-hidden
      />
      <span className="relative z-10">{children}</span>
    </span>
  );
}
