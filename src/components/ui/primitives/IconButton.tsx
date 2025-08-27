"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Circle = "sm" | "md" | "lg";
type Icon = "xs" | "sm" | "md" | "lg";
type Tone = "primary" | "accent" | "info" | "danger";
type Variant = "ring" | "glow"; // ring = flat outline w/ neon on hover, glow = original FX

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  circleSize?: Circle;
  iconSize?: Icon;
  tone?: Tone;
  active?: boolean;
  fx?: boolean;      // kept for backwards-compat in "glow" mode
  variant?: Variant; // "ring" (default) | "glow"
};

const circleMap: Record<Circle, string> = {
  sm: "h-9 w-9",
  md: "h-10 w-10",
  lg: "h-11 w-11",
};

const iconMap: Record<Icon, string> = {
  xs: "[&_.ib-glyph]:h-3.5 [&_.ib-glyph]:w-3.5",
  sm: "[&_.ib-glyph]:h-4 [&_.ib-glyph]:w-4",
  md: "[&_.ib-glyph]:h-5 [&_.ib-glyph]:w-5",
  lg: "[&_.ib-glyph]:h-6 [&_.ib-glyph]:w-6",
};

function toneVars(tone: Tone) {
  switch (tone) {
    case "accent":
      return { g1: "hsl(var(--accent))", g2: "hsl(var(--ring))" };
    case "info":
      return { g1: "hsl(198 100% 62%)", g2: "hsl(257 90% 70%)" };
    case "danger":
      return { g1: "hsl(350 95% 60%)", g2: "hsl(12 90% 60%)" };
    default:
      return { g1: "hsl(var(--primary))", g2: "hsl(var(--accent))" };
  }
}

// Attach shared class and force currentColor for lucide SVGs
function withIcon(node: React.ReactNode) {
  if (!node || !React.isValidElement(node)) return node ?? null;
  type Iconish = React.AriaAttributes & { className?: string; stroke?: string; fill?: string };
  const el = node as React.ReactElement<Iconish>;
  return React.cloneElement(el, {
    className: cn("ib-glyph", el.props.className),
    stroke: "currentColor",
    fill: "none",
    "aria-hidden": true,
  });
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      circleSize = "md",
      iconSize = "md",
      tone = "primary",
      active = false,
      fx = true,
      variant = "ring", // default: flat ring look
      className,
      children,
      ...rest
    },
    ref
  ) => {
    const { g1, g2 } = toneVars(tone);

    const styleVars: React.CSSProperties & {
      "--ib-g1"?: string;
      "--ib-g2"?: string;
      "--ib-ring"?: string;
      "--ib-ring-hover"?: string;
      "--ib-ring-active"?: string;
    } = {
      "--ib-g1": g1,
      "--ib-g2": g2,
      "--ib-ring": "hsl(var(--foreground) / 0.18)",   // default gray ring
      "--ib-ring-hover": "hsl(var(--foreground) / 0.28)",
      "--ib-ring-active": "hsl(var(--foreground) / 0.36)",
    };

    // ─────────────────────────────────────────────────────────────
    // VARIANT: FLAT RING with NEON that COVERS the gray border on hover
    // ─────────────────────────────────────────────────────────────
    if (variant === "ring") {
      return (
        <>
          <button
            ref={ref}
            type="button"
            data-active={active ? "true" : undefined}
            aria-pressed={active || undefined}
            className={cn(
              "group ib2-root ib2--ring relative inline-flex items-center justify-center select-none",
              "rounded-full border-2 bg-transparent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
              "disabled:opacity-50 disabled:pointer-events-none",
              circleMap[circleSize],
              iconMap[iconSize],
              className
            )}
            style={styleVars}
            {...rest}
          >
            {/* Gradient rim overlay that extends over the border area.
               It’s invisible at rest; on hover it sits ABOVE the border and
               visually replaces the gray with the neon gradient. */}
            <span
              aria-hidden
              className="ib2-rim pointer-events-none absolute -inset-0.5 z-10 rounded-[inherit] p-[2px] opacity-0"
              style={{
                background:
                  "linear-gradient(90deg, var(--ib-g1), var(--ib-g2), var(--ib-g1))",
                backgroundSize: "200% 100%",
                WebkitMask:
                  "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              } as React.CSSProperties}
            />
            {/* Subtle scan shimmer inside the disk */}
            <span
              aria-hidden
              className="ib2-scan pointer-events-none absolute inset-[3px] rounded-[inherit] opacity-0"
            />

            {withIcon(children)}
          </button>

          <style jsx>{`
            .ib2-root.ib2--ring {
              border-color: var(--ib-ring);
              transition: border-color 150ms ease;
            }
            /* Let the neon take over the border area */
            .ib2-root.ib2--ring:hover,
            .ib2-root.ib2--ring[aria-pressed="true"] {
              border-color: transparent;
            }

            /* Icon: neutral by default, neon + glow on hover/active */
            .ib2-root.ib2--ring .ib-glyph {
              color: hsl(var(--muted-foreground));
              opacity: 1;
              transform: none;
              transition: color 160ms ease, filter 160ms ease;
            }
            .ib2-root.ib2--ring:hover .ib-glyph,
            .ib2-root.ib2--ring[aria-pressed="true"] .ib-glyph {
              color: var(--ib-g1);
              filter:
                drop-shadow(0 0 6px color-mix(in oklab, var(--ib-g1), transparent 75%))
                drop-shadow(0 0 14px color-mix(in oklab, var(--ib-g2), transparent 80%));
              animation:
                ib2-ico-flicker 1.8s steps(1, end) infinite,
                ib2-ico-breathe 2.6s ease-in-out infinite alternate;
            }

            /* Rim animations (gradient shift + flicker) */
            .ib2-root.ib2--ring:hover .ib2-rim,
            .ib2-root.ib2--ring[aria-pressed="true"] .ib2-rim {
              opacity: 1;
              animation:
                ib2-shift 3s linear infinite,
                ib2-flicker 1200ms steps(1, end) infinite;
            }

            .ib2-root.ib2--ring:hover .ib2-scan,
            .ib2-root.ib2--ring[aria-pressed="true"] .ib2-scan {
              opacity: 1;
              background-image: repeating-linear-gradient(
                to bottom,
                rgba(255, 255, 255, 0.06) 0 1px,
                transparent 1px 3px
              );
              mix-blend-mode: overlay;
              animation: ib2-scan 2.1s linear infinite;
            }

            @keyframes ib2-shift {
              0% { background-position: 0% 50%; }
              100% { background-position: 200% 50%; }
            }
            @keyframes ib2-flicker {
              0%, 2%, 35%, 37%, 100% { opacity: 1; }
              1% { opacity: 0.86; }
              36% { opacity: 0.92; }
              60% { opacity: 0.88; }
              61% { opacity: 1; }
            }
            @keyframes ib2-scan {
              0% { background-position-y: 0%; }
              100% { background-position-y: 100%; }
            }
            @keyframes ib2-ico-breathe {
              0% {
                filter:
                  drop-shadow(0 0 6px color-mix(in oklab, var(--ib-g1), transparent 75%))
                  drop-shadow(0 0 12px color-mix(in oklab, var(--ib-g2), transparent 82%));
              }
              100% {
                filter:
                  drop-shadow(0 0 10px color-mix(in oklab, var(--ib-g1), transparent 65%))
                  drop-shadow(0 0 18px color-mix(in oklab, var(--ib-g2), transparent 74%));
              }
            }
            @keyframes ib2-ico-flicker {
              0%, 89%, 100% { color: var(--ib-g1); }
              90% { color: var(--ib-g2); }
              95% { color: var(--ib-g1); }
            }
          `}</style>
        </>
      );
    }

    // ─────────────────────────────────────────────────────────────
    // VARIANT: GLOW (original neon/glass stack)
    // ─────────────────────────────────────────────────────────────
    return (
      <>
        <button
          ref={ref}
          type="button"
          data-active={active ? "true" : undefined}
          aria-pressed={active || undefined}
          className={cn(
            "group ib-root relative inline-flex items-center justify-center select-none",
            "overflow-hidden rounded-full border border-[hsl(var(--border))]",
            "bg-[hsl(var(--card)/.60)] backdrop-blur-md",
            "transition-transform duration-150 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
            "hover:scale-[1.03] active:scale-[0.98]",
            "disabled:opacity-50 disabled:pointer-events-none",
            circleMap[circleSize],
            iconMap[iconSize],
            className
          )}
          style={styleVars}
          {...rest}
        >
          {fx && (
            <>
              {/* Neon gradient rim using mask to simulate a 1.5px border */}
              <span
                aria-hidden
                className={cn(
                  "ib-rim pointer-events-none absolute inset-0 rounded-[inherit] p-[1.5px]",
                  "opacity-60 group-hover:opacity-100 group-data-[active=true]:opacity-100",
                  "transition-opacity"
                )}
                style={{
                  background: "linear-gradient(90deg, var(--ib-g1), var(--ib-g2))",
                  WebkitMask:
                    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                } as React.CSSProperties}
              />

              {/* Inner hairline for definition */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-black/10"
              />

              {/* Soft top sheen */}
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 rounded-[inherit]",
                  "opacity-0 group-hover:opacity-100 group-data-[active=true]:opacity-100",
                  "transition-opacity duration-150"
                )}
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,.18), transparent 42%)",
                  maskImage:
                    "radial-gradient(120% 60% at 50% 0%, #000 40%, transparent 62%)",
                  WebkitMaskImage:
                    "radial-gradient(120% 60% at 50% 0%, #000 40%, transparent 62%)",
                } as React.CSSProperties}
              />

              {/* Outer glow bloom */}
              <span
                aria-hidden
                className={cn(
                  "ib-bloom pointer-events-none absolute -inset-2 rounded-[inherit] blur-[10px]",
                  "opacity-0 group-hover:opacity-100 group-data-[active=true]:opacity-100",
                  "transition-opacity"
                )}
                style={{
                  background:
                    "radial-gradient(50% 60% at 50% 50%, color-mix(in oklab, var(--ib-g1), transparent 70%), transparent 70%), radial-gradient(60% 70% at 50% 50%, color-mix(in oklab, var(--ib-g2), transparent 78%), transparent 78%)",
                }}
              />
            </>
          )}

          {withIcon(children)}
        </button>

        {fx && (
          <style jsx>{`
            .ib-root:hover .ib-bloom,
            .ib-root[data-active="true"] .ib-bloom {
              animation: ib-flicker-in 260ms ease-out both,
                ib-breathe 2200ms ease-in-out 260ms infinite alternate;
            }
            .ib-root:hover .ib-rim,
            .ib-root[data-active="true"] .ib-rim {
              animation: ib-flicker-in 260ms ease-out both,
                ib-breathe 2200ms ease-in-out 260ms infinite alternate;
              opacity: 1 !important;
            }
            .ib-root .ib-glyph {
              transition: transform 140ms ease, color 160ms ease, opacity 160ms ease, filter 160ms ease;
              color: var(--ib-g1);
              opacity: 0.85;
            }
            .ib-root:hover .ib-glyph,
            .ib-root[data-active="true"] .ib-glyph {
              color: var(--ib-g2);
              opacity: 1;
              transform: scale(1.02);
              filter:
                drop-shadow(0 0 6px color-mix(in oklab, var(--ib-g2), transparent 75%))
                drop-shadow(0 0 14px color-mix(in oklab, var(--ib-g1), transparent 80%));
            }
            @keyframes ib-flicker-in {
              0% { opacity: 0; filter: blur(2px) saturate(1.1); }
              8% { opacity: .6; }
              14% { opacity: .2; }
              22% { opacity: .85; }
              28% { opacity: .4; }
              36% { opacity: .95; }
              100% { opacity: 1; filter: blur(0) saturate(1); }
            }
            @keyframes ib-breathe {
              0% { opacity: .95; transform: scale(1); }
              100% { opacity: 1; transform: scale(1.02); }
            }
          `}</style>
        )}
      </>
    );
  }
);

IconButton.displayName = "IconButton";
export default IconButton;
