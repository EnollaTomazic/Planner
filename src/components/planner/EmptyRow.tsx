import * as React from "react";
import { cn } from "@/lib/utils";

const DEFAULT_DESCRIPTOR = {
  id: "static",
  text: "Nothing queued yet.",
} as const;

const ROTATING_DESCRIPTORS = [
  { id: "echo", text: "Awaiting planner echo…" },
  { id: "buffer", text: "Buffering next step…" },
  { id: "ghost", text: "Ghost row awaiting sync…" },
] as const;

type EmptyRowTone = "default" | "muted";
type EmptyRowVariant = "default" | "rotate";

type EmptyRowProps = {
  text?: string;
  tone?: EmptyRowTone;
  variant?: EmptyRowVariant;
};

export function EmptyRow({
  text,
  tone = "default",
  variant = "default",
}: EmptyRowProps) {
  const componentId = React.useId();

  const descriptor = React.useMemo(() => {
    if (text) {
      return { id: "custom", text } as const;
    }

    if (variant === "rotate") {
      const seed = Array.from(componentId).reduce(
        (total, char) => total + char.charCodeAt(0),
        0,
      );
      const rotating = ROTATING_DESCRIPTORS[seed % ROTATING_DESCRIPTORS.length];
      return rotating;
    }

    return DEFAULT_DESCRIPTOR;
  }, [componentId, text, variant]);

  const secondaryText = React.useMemo(() => {
    if (variant !== "rotate") return undefined;
    const seed = Array.from(componentId).reduce(
      (total, char) => total + char.charCodeAt(0) * 7,
      0,
    );
    return ROTATING_DESCRIPTORS[(seed + 1) % ROTATING_DESCRIPTORS.length];
  }, [componentId, variant]);

  const isRotating = variant === "rotate";
  const toneClassName = tone === "muted" ? "text-muted-foreground" : undefined;
  const primaryClassName = cn(
    "font-medium",
    tone === "muted" ? "text-muted-foreground" : "text-foreground",
  );

  return (
    <div
      className={cn("tasks-placeholder text-label", toneClassName)}
      data-placeholder-tone={tone}
      data-placeholder-variant={variant}
      data-placeholder-layer={descriptor.id}
      data-placeholder-size={isRotating ? "compact" : undefined}
    >
      <span className={primaryClassName} data-placeholder-primary>
        {descriptor.text}
      </span>
      {isRotating && secondaryText ? (
        <span
          aria-hidden="true"
          className="text-ui text-muted-foreground"
          data-placeholder-descriptor
          data-placeholder-layer-secondary={secondaryText.id}
        >
          {secondaryText.text}
        </span>
      ) : null}
    </div>
  );
}
