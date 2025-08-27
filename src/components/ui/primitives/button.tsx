"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Button — Lavender-Glitch button that matches the icon button vibe:
 * flat by default, neon on hover/active, and no plastic 3D.
 * Borders removed from secondary/destructive to avoid white rims inside Hero.
 */
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  vibe?: "glitch" | "lift" | "none";
  loading?: boolean;
  block?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  pill?: boolean;
};

const sizeMap: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

const gapMap: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "gap-1.5",
  md: "gap-2",
  lg: "gap-2.5",
};

const iconSizeMap: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "[&_.btn-icon]:h-4 [&_.btn-icon]:w-4",
  md: "[&_.btn-icon]:h-5 [&_.btn-icon]:w-5",
  lg: "[&_.btn-icon]:h-5 [&_.btn-icon]:w-5",
};

/** Visual bases */
const baseByVariant: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: cn(
    "text-[hsl(var(--primary-foreground))]",
    "bg-[var(--seg-active-grad)]",
    "shadow-[0_0_0_1px_hsl(var(--ring)/.22),0_12px_28px_hsl(var(--shadow-color)/.28)]",
    "hover:brightness-[1.05]"
  ),
  secondary: cn(
    "text-[hsl(var(--foreground))]",
    "bg-[hsl(var(--card))]" // no border
  ),
  ghost: cn(
    "text-[hsl(var(--foreground))]",
    "bg-transparent",
    "hover:bg-[hsl(var(--primary-soft)/.25)]"
  ),
  destructive: cn(
    "text-white",
    "bg-[linear-gradient(135deg,hsl(350_95%_55%/.95),hsl(320_85%_60%/.8))]",
    "shadow-[0_0_0_1px_hsl(350_95%_60%/.35),0_12px_28px_hsl(350_95%_60%/.25)]",
    "hover:brightness-[1.06]"
  ),
};

const vibeMap: Record<NonNullable<ButtonProps["vibe"]>, string> = {
  glitch:
    "shadow-[0_0_25px_hsl(291_89%_61%/.35),0_0_40px_hsl(192_91%_46%/.25)]",
  lift:
    "bg-[hsl(var(--card))] border border-[hsl(var(--border))] " +
    "shadow-[0_6px_18px_hsl(var(--shadow-color)/.18)] " +
    "hover:shadow-[0_10px_24px_hsl(var(--shadow-color)/.25)]",
  none: "",
};

function withIcon(node: React.ReactNode) {
  if (node == null) return null;
  if (typeof node === "string" || typeof node === "number") {
    return (
      <span aria-hidden className="btn-icon inline-block align-middle">
        {node}
      </span>
    );
  }
  if (!React.isValidElement(node)) return node;
  const el = node as React.ReactElement<{ className?: string }>;
  const cloned = React.cloneElement(el, {
    className: cn("btn-icon", el.props.className),
  });
  return <span aria-hidden className="contents">{cloned}</span>;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      vibe = "none",
      loading = false,
      block = false,
      disabled,
      children,
      type = "button",
      leftIcon,
      rightIcon,
      pill = true,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      onPointerDown,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const [hovered, setHovered] = React.useState(false);
    const [focused, setFocused] = React.useState(false);
    const wantsOn = hovered || focused || variant === "primary";

    const prev = React.useRef(wantsOn);
    const [phase, setPhase] = React.useState<
      "off" | "ignite" | "steady-on" | "powerdown"
    >(wantsOn ? "steady-on" : "off");

    React.useEffect(() => {
      if (wantsOn !== prev.current) {
        if (wantsOn) {
          setPhase("ignite");
          const t = setTimeout(() => setPhase("steady-on"), 620);
          prev.current = wantsOn;
          return () => clearTimeout(t);
        } else {
          setPhase("powerdown");
          const t = setTimeout(() => setPhase("off"), 360);
          prev.current = wantsOn;
          return () => clearTimeout(t);
        }
      }
      prev.current = wantsOn;
    }, [wantsOn]);

    function retriggerIgnite() {
      setPhase("ignite");
      window.setTimeout(
        () => setPhase(wantsOn ? "steady-on" : "off"),
        620
      );
    }

    const lit = phase === "ignite" || phase === "steady-on";
    const isRingy = variant === "secondary" || variant === "ghost";
    const rounded = pill ? "rounded-full" : "rounded-2xl";

    return (
      <>
        <button
          ref={ref}
          type={type}
          disabled={isDisabled}
          aria-busy={loading || undefined}
          data-loading={loading ? "true" : undefined}
          className={cn(
            "relative inline-flex items-center justify-center whitespace-nowrap font-medium select-none",
            "transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
            "disabled:opacity-50 disabled:pointer-events-none",
            sizeMap[size],
            iconSizeMap[size],
            rounded,
            baseByVariant[variant],
            vibeMap[vibe],
            "overflow-hidden active:scale-[.995]",
            block && "w-full",
            className
          )}
          onMouseEnter={(e) => {
            setHovered(true);
            onMouseEnter?.(e);
          }}
          onMouseLeave={(e) => {
            setHovered(false);
            onMouseLeave?.(e);
          }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onPointerDown={(e) => {
            retriggerIgnite();
            onPointerDown?.(e);
          }}
          {...props}
        >
          {isRingy && (
            <>
              <span
                aria-hidden
                className={cn(
                  "absolute inset-0 p-[2px] pointer-events-none",
                  rounded,
                  lit ? "opacity-100" : "opacity-0",
                  "transition-opacity"
                )}
                style={{
                  background:
                    "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--ring)), hsl(var(--primary)))",
                  backgroundSize: "200% 100%",
                  WebkitMask:
                    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                  animation: lit
                    ? "btnShift 3s linear infinite, btnFlicker 1.2s steps(1,end) infinite"
                    : undefined,
                }}
              />
              <span
                aria-hidden
                className={cn(
                  "absolute inset-[2px] pointer-events-none",
                  rounded,
                  lit ? "opacity-100" : "opacity-0",
                  "transition-opacity"
                )}
                style={{
                  background:
                    "repeating-linear-gradient(0deg, rgba(255,255,255,.06) 0 1px, transparent 1px 3px)",
                  mixBlendMode: "overlay",
                  animation: lit ? "btnScan 2.1s linear infinite" : undefined,
                }}
              />
              <span
                aria-hidden
                className={cn(
                  "absolute inset-0 pointer-events-none",
                  rounded,
                  lit ? "opacity-0" : "opacity-100",
                  "transition-opacity"
                )}
                style={{ boxShadow: "inset 0 0 0 1px hsl(var(--border))" }}
              />
            </>
          )}

          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0",
              rounded,
              phase === "ignite" ? "opacity-90" : "opacity-0"
            )}
            style={{
              background:
                "radial-gradient(80% 80% at 50% 50%, rgba(255,255,255,.22), transparent 60%)",
              mixBlendMode: "screen",
              animation:
                phase === "ignite"
                  ? "igniteFlicker .62s steps(18,end) 1"
                  : undefined,
            }}
          />
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0",
              rounded,
              phase === "powerdown" ? "opacity-60" : "opacity-0"
            )}
            style={{
              background:
                "radial-gradient(120% 120% at 50% 50%, rgba(255,255,255,.14), transparent 60%)",
              mixBlendMode: "screen",
              animation:
                phase === "powerdown"
                  ? "powerDown .36s linear 1"
                  : undefined,
            }}
          />

          <span
            className={cn(
              "inline-flex items-center whitespace-nowrap",
              gapMap[size],
              loading && "opacity-0"
            )}
          >
            {leftIcon ? (
              <span className="inline-grid place-items-center shrink-0 [&_.btn-icon]:-translate-y-px">
                {withIcon(leftIcon)}
              </span>
            ) : null}
            <span className="leading-[1] tracking-[-0.01em]">{children}</span>
            {rightIcon ? (
              <span className="inline-grid place-items-center shrink-0 [&_.btn-icon]:-translate-y-px">
                {withIcon(rightIcon)}
              </span>
            ) : null}
          </span>
        </button>

        {/* Animations live in globals.css now */}
      </>
    );
  }
);

Button.displayName = "Button";
export default Button;
