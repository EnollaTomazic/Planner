import * as React from "react";
import { cn } from "@/lib/utils";

type AlertTone = "neutral" | "info" | "success" | "warning" | "danger";
type AlertVariant = "plain" | "subtle";
type AlertLiveRegion = "off" | "polite" | "assertive";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  heading?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  tone?: AlertTone;
  variant?: AlertVariant;
  liveRegion?: AlertLiveRegion;
}

const BASE_CLASSNAME =
  "relative isolate flex min-w-0 items-start gap-[var(--space-3)] overflow-hidden rounded-card border border-[var(--alert-border)] bg-[var(--alert-surface)] px-[var(--space-4)] py-[var(--space-3)] text-[length:var(--font-body)] leading-relaxed text-[color:var(--alert-foreground)] shadow-neo-soft";

const toneClassNames: Record<AlertTone, string> = {
  neutral:
    "[--alert-accent:var(--accent-2)] [--alert-border:hsl(var(--card-hairline)/0.55)] [--alert-surface:hsl(var(--surface)/0.95)] [--alert-foreground:hsl(var(--muted-foreground))]",
  info:
    "[--alert-accent:var(--status-info,var(--accent-2))] [--alert-border:hsl(var(--card-hairline)/0.45)] [--alert-surface:hsl(var(--surface)/0.94)] [--alert-foreground:hsl(var(--muted-foreground))]",
  success:
    "[--alert-accent:var(--success)] [--alert-border:hsl(var(--card-hairline)/0.45)] [--alert-surface:hsl(var(--surface)/0.94)] [--alert-foreground:hsl(var(--muted-foreground))]",
  warning:
    "[--alert-accent:var(--warning)] [--alert-border:hsl(var(--card-hairline)/0.45)] [--alert-surface:hsl(var(--surface)/0.94)] [--alert-foreground:hsl(var(--muted-foreground))]",
  danger:
    "[--alert-accent:var(--danger)] [--alert-border:hsl(var(--card-hairline)/0.45)] [--alert-surface:hsl(var(--surface)/0.94)] [--alert-foreground:hsl(var(--muted-foreground))]",
};

const variantClassNames: Record<AlertVariant, string> = {
  plain: "",
  subtle:
    "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-[radial-gradient(120%_160%_at_82%_-10%,hsl(var(--alert-accent)/0.26),hsl(var(--alert-accent)/0.08)_55%,transparent_88%)] before:content-[''] [--alert-border:hsl(var(--alert-accent)/0.32)]",
};

type LiveRegionProps = {
  role: React.AriaRole;
  "aria-live": React.AriaAttributes["aria-live"];
};

const liveRegionAttributes: Record<AlertLiveRegion, LiveRegionProps | undefined> = {
  off: undefined,
  polite: { role: "status", "aria-live": "polite" },
  assertive: { role: "alert", "aria-live": "assertive" },
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    icon,
    heading,
    description,
    actions,
    tone = "info",
    variant = "subtle",
    liveRegion = "off",
    className,
    children,
    role,
    ["aria-live"]: ariaLive,
    ...rest
  },
  ref,
) {
  const regionProps = liveRegionAttributes[liveRegion] ?? undefined;
  const body = description ?? children;
  const resolvedRole = role ?? regionProps?.role;
  const resolvedAriaLive = ariaLive ?? regionProps?.["aria-live"];

  return (
    <div
      role={resolvedRole}
      aria-live={resolvedAriaLive}
      ref={ref}
      className={cn(
        BASE_CLASSNAME,
        toneClassNames[tone],
        variantClassNames[variant],
        "[--alert-foreground:hsl(var(--muted-foreground))]",
        className,
      )}
      {...rest}
    >
      {icon ? (
        <span
          aria-hidden
          className="mt-[0.1rem] flex size-[var(--space-4)] flex-none items-center justify-center text-[color:hsl(var(--alert-accent))]"
        >
          {icon}
        </span>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-1)]">
        {heading ? (
          <p className="text-label font-medium uppercase tracking-[0.12em] text-[color:hsl(var(--alert-heading,var(--foreground)))]">
            {heading}
          </p>
        ) : null}
        {body ? (
          <div className="text-pretty text-[color:var(--alert-foreground)]">{body}</div>
        ) : null}
        {actions ? (
          <div className="flex flex-wrap gap-[var(--space-2)] pt-[var(--space-2)]">{actions}</div>
        ) : null}
      </div>
    </div>
  );
});

Alert.displayName = "Alert";
