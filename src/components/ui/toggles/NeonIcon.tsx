// src/components/ui/NeonIcon.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import useNeonPhase from "../hooks/useNeonPhase";
import styles from "./neonKeyframes.module.css";

type NeonIconProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  on: boolean;
  size?: number;
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
  size = 40,
  colorVar = "--accent",
  title,
  className,
  scanlines = true,
  aura = true,
}: NeonIconProps) {
  const { phase, lit } = useNeonPhase(on);

  const styleVars: NeonVars = {
    "--ni-size": `${size}px`,
    "--ni-k": `${Math.round(size * 0.56)}px`,
    "--ni-color": `hsl(var(${colorVar}))`,
  };

  return (
    <span
      className={cn(
        "ni-root relative inline-grid place-items-center overflow-visible rounded-full border",
        "border-[hsl(var(--border))] bg-[hsl(var(--card)/.35)]",
        styles.root,
        className,
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
          strokeWidth: 2,
          color: "var(--ni-color)",
          opacity: lit ? 1 : 0.38,
          transition: "opacity 220ms var(--ease-out), transform 220ms var(--ease-out)",
          transform:
            phase === "ignite" ? "scale(1.02)" : phase === "powerdown" ? "scale(0.985)" : "scale(1)",
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
          filter: "blur(2.5px) drop-shadow(0 0 12px var(--ni-color))",
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
            filter: "blur(7px) drop-shadow(0 0 22px var(--ni-color))",
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
            "repeating-linear-gradient(0deg, hsl(var(--foreground)/0.07) 0 1px, transparent 1px 3px)",
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
        .ni-root { width: var(--ni-size); height: var(--ni-size); }

        @keyframes niCore {
          0% { opacity: .66; transform: scale(1) }
          50%{ opacity: .88; transform: scale(1.012) }
          100%{ opacity: .66; transform: scale(1) }
        }
        @keyframes niAura {
          0% { opacity: .32 }
          50%{ opacity: .52 }
          100%{ opacity: .32 }
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
          "pointer-events-none absolute inset-0 rounded-2xl",
          lit ? "opacity-60" : "opacity-0"
        )}
        style={{
          filter: "blur(10px)",
          background:
            "radial-gradient(60% 60% at 50% 50%, hsl(var(--accent)/.45), transparent 70%)",
          transition: "opacity 220ms var(--ease-out)",
        }}
        aria-hidden
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl",
          lit ? "opacity-40 animate-[niAura_3.6s_ease-in-out_infinite]" : "opacity-0"
        )}
        style={{
          filter: "blur(14px)",
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
