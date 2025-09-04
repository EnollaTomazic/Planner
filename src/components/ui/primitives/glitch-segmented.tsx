"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlitchSegmentedGroupProps {
  value: string;
  onChange: (v: string) => void;
  ariaLabel?: string;
  intensity?: "calm" | "default" | "feral";
  children: React.ReactNode;
  className?: string;
}

export interface GlitchSegmentedButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  value: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  intensity?: "calm" | "default" | "feral";
}

export const GlitchSegmentedGroup = ({
  value,
  onChange,
  ariaLabel,
  children,
  className,
  intensity = "default",
}: GlitchSegmentedGroupProps) => {
  const btnRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const setBtnRef = (index: number) => (el: HTMLButtonElement | null) => {
    btnRefs.current[index] = el;
  };

  const values = React.Children.toArray(children).map((child) =>
    React.isValidElement(child) ? (child.props as GlitchSegmentedButtonProps).value : ""
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    const idx = values.findIndex((v) => v === value);
    if (idx < 0) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      const next = (idx + 1) % values.length;
      onChange(values[next]);
      btnRefs.current[next]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      const prev = (idx - 1 + values.length) % values.length;
      onChange(values[prev]);
      btnRefs.current[prev]?.focus();
      e.preventDefault();
    } else if (e.key === "Home") {
      onChange(values[0]);
      btnRefs.current[0]?.focus();
      e.preventDefault();
    } else if (e.key === "End") {
      const last = values.length - 1;
      onChange(values[last]);
      btnRefs.current[last]?.focus();
      e.preventDefault();
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex gap-1 rounded-full p-1 backdrop-blur-sm",
        "bg-[hsl(var(--surface-2)/0.1)]",
        "ring-1 ring-[var(--ring-contrast)]",
        "shadow-[0_0_8px_var(--glow-active)]",
        className
      )}
      onKeyDown={onKeyDown}
    >
      {React.Children.map(children, (child, i) => {
        if (!React.isValidElement<GlitchSegmentedButtonProps>(child)) return child;
        const selected = child.props.value === value;
        const buttonChild = child as React.ReactElement<GlitchSegmentedButtonProps>;
        return React.cloneElement(
          buttonChild,
          {
            ref: setBtnRef(i),
            tabIndex: selected ? 0 : -1,
            selected,
            intensity,
            onSelect: () => onChange(child.props.value),
            id: child.props.id ?? `${child.props.value}-tab`,
            "aria-controls":
              child.props["aria-controls"] ?? `${child.props.value}-panel`,
          } as Partial<GlitchSegmentedButtonProps> &
            React.RefAttributes<HTMLButtonElement>
        );
      })}
    </div>
  );
};

export const GlitchSegmentedButton = React.forwardRef<
  HTMLButtonElement,
  GlitchSegmentedButtonProps
>(({ icon, children, className, selected, onSelect, intensity = "default", ...rest }, ref) => {
  const [glitch, setGlitch] = React.useState(false);
  const lastRef = React.useRef(0);
  const trigger = () => {
    const now = Date.now();
    if (now - lastRef.current < 300) return;
    lastRef.current = now;
    setGlitch(true);
    window.setTimeout(() => setGlitch(false), 160);
  };
  React.useEffect(() => {
    if (selected) trigger();
  }, [selected]);

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={selected}
      data-selected={selected ? "true" : undefined}
      data-glitch={glitch ? "true" : undefined}
      data-intensity={intensity}
      onClick={onSelect}
      onMouseEnter={trigger}
      className={cn(
        "seg-btn relative flex-1 h-9 select-none whitespace-nowrap px-4 inline-flex items-center justify-center gap-2 text-sm font-medium rounded-full",
        className
      )}
      {...rest}
    >
      {icon ? (
        <span className="inline-flex h-4 w-4 items-center justify-center">
          {icon}
        </span>
      ) : null}
      <span className="seg-label truncate text-center">{children}</span>
      <style jsx>{`
        .seg-btn {
          overflow: hidden;
          color: hsl(var(--muted));
          background: hsl(var(--surface-2)/0.1);
          border: 1px solid hsl(var(--ring-contrast));
          box-shadow: 0 0 4px hsl(var(--ring-contrast)/0.4);
          transition: color 180ms ease-in-out, background 180ms ease-in-out, box-shadow 180ms ease-in-out;
        }
        .seg-btn:hover {
          color: hsl(var(--foreground));
          box-shadow: 0 0 6px hsl(var(--ring-contrast));
        }
        .seg-btn::before {
          content: "";
          position: absolute;
          top: -24px;
          left: 50%;
          width: 70%;
          height: 24px;
          transform: translateX(-50%);
          background: radial-gradient(ellipse at bottom, var(--accent-overlay), transparent 70%);
          opacity: 0;
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          transition: opacity 180ms ease-in-out;
          pointer-events: none;
        }
        .seg-btn[data-selected="true"] {
          color: var(--text-on-accent);
          background: color-mix(in oklab, hsl(var(--accent)) 25%, transparent);
          box-shadow: inset 0 0 8px var(--accent-overlay), 0 0 8px var(--glow-active), 0 0 6px var(--ring-contrast);
        }
        .seg-btn[data-selected="true"]::before {
          opacity: 1;
        }
        button[data-glitch="true"] .seg-label {
          animation: seg-jitter 150ms steps(2, end);
        }
        button[data-glitch="true"] .seg-label::before,
        button[data-glitch="true"] .seg-label::after {
          opacity: 0.12;
        }
        .seg-label {
          position: relative;
        }
        .seg-label::before,
        .seg-label::after {
          content: "";
          position: absolute;
          inset: 0;
          background: var(--accent-overlay);
          mix-blend-mode: screen;
          opacity: 0;
          pointer-events: none;
          transition: opacity 160ms;
        }
        button[data-glitch="true"] .seg-label::before {
          transform: translate(calc(1px * var(--gi)), 0);
        }
        button[data-glitch="true"] .seg-label::after {
          transform: translate(calc(-1px * var(--gi)), 0);
        }
        button[data-intensity="calm"] {
          --gi: 0.5;
        }
        button[data-intensity="default"] {
          --gi: 1;
        }
        button[data-intensity="feral"] {
          --gi: 1.5;
        }
        @keyframes seg-jitter {
          0% { transform: translate(0,0); }
          25% { transform: translate(calc(1px * var(--gi)), 0); }
          50% { transform: translate(calc(-1px * var(--gi)), 0); }
          75% { transform: translate(calc(1px * var(--gi)), 0); }
          100% { transform: translate(0,0); }
        }
        @media (prefers-reduced-motion: reduce) {
          button[data-glitch="true"] .seg-label {
            animation: none;
          }
        }
      `}</style>
    </button>
  );
});
GlitchSegmentedButton.displayName = "GlitchSegmentedButton";

export default GlitchSegmentedGroup;
