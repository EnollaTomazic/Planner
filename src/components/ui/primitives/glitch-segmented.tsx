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
        "inline-flex rounded-full p-0.5 backdrop-blur-sm",
        "bg-[hsl(var(--surface-2)/0.1)]",
        "ring-1 ring-[hsl(var(--accent)/0.4)]",
        "shadow-[0_0_8px_hsl(var(--accent)/0.15)]",
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
        "relative flex-1 h-9 select-none whitespace-nowrap px-3 inline-flex items-center justify-center gap-2 text-sm font-medium",
        "rounded-full first:rounded-l-full last:rounded-r-full",
        "bg-[hsl(var(--surface-2)/0.15)] backdrop-blur-sm text-[hsl(var(--muted))]",
        "ring-1 ring-[hsl(var(--accent)/0.4)]",
        "shadow-[inset_0_1px_rgba(255,255,255,0.15)]",
        "motion-safe:transition-[background-color,color,box-shadow,transform] motion-safe:ease-[cubic-bezier(.2,.8,.2,1)] motion-safe:duration-[160ms]",
        "hover:-translate-y-px hover:shadow-[0_0_6px_hsl(var(--accent)/0.3)]",
        "active:scale-[0.98] motion-safe:active:duration-[80ms] active:shadow-[0_0_6px_hsl(var(--accent)/0.5)]",
        "data-[selected=true]:bg-[hsl(var(--surface-2)/0.25)] data-[selected=true]:text-[hsl(var(--foreground))]",
        "data-[selected=true]:ring-[hsl(var(--accent))] data-[selected=true]:shadow-[0_0_8px_hsl(var(--accent)/0.6)]",
        "disabled:opacity-40 disabled:shadow-none",
        "data-[selected=true]:focus-visible:ring-2 data-[selected=true]:focus-visible:ring-[hsl(var(--ring))] data-[selected=true]:focus-visible:ring-offset-2 data-[selected=true]:focus-visible:ring-offset-[hsl(var(--surface-2)/0.25)]",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
        className
      )}
      {...rest}
    >
      {icon ? (
        <span className="inline-flex h-4 w-4 items-center justify-center">
          {icon}
        </span>
      ) : null}
      <span className="seg-label truncate">{children}</span>
      <span aria-hidden className="glitch-scanline" />
      <style jsx>{`
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
          background: hsl(var(--accent));
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
        .glitch-scanline {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, transparent 0%, hsl(var(--accent)) 50%, transparent 100%);
          opacity: 0;
          transform: translateX(-100%);
          pointer-events: none;
        }
        button[data-glitch="true"] .glitch-scanline {
          opacity: 0.08;
          animation: scanline 140ms linear;
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
        @keyframes scanline {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          button[data-glitch="true"] .seg-label {
            animation: none;
          }
          .glitch-scanline {
            animation: none;
            transform: none;
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
});
GlitchSegmentedButton.displayName = "GlitchSegmentedButton";

export default GlitchSegmentedGroup;
