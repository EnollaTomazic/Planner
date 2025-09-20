"use client";

import * as React from "react";
import { Clock, FileText, Brain } from "lucide-react";
import { NeonIcon as UIToggleNeonIcon } from "@/components/ui";

type Props = {
  kind: "clock" | "file" | "brain";
  on: boolean;
  size?: number | string;
  className?: string;
  title?: string;
  staticGlow?: boolean;
};

type SizeToken = "xs" | "sm" | "md" | "lg" | "xl";

const sizeTokens: Record<SizeToken, string> = {
  xs: "var(--icon-size-xs)",
  sm: "var(--icon-size-sm)",
  md: "var(--icon-size-md)",
  lg: "var(--icon-size-lg)",
  xl: "var(--icon-size-xl)",
};

function resolveSize(size: Props["size"]): Props["size"] {
  if (typeof size === "string") {
    const token = sizeTokens[size as SizeToken];
    if (token) {
      return token;
    }
  }
  return size;
}

export default function NeonIcon({
  kind,
  on,
  size: sizeProp = "1em",
  className,
  title,
  staticGlow = false,
}: Props) {
  const Icon = kind === "clock" ? Clock : kind === "brain" ? Brain : FileText;
  const colorVar =
    kind === "clock" ? "--accent" : kind === "brain" ? "--primary" : "--ring";

  return (
    <UIToggleNeonIcon
      key={staticGlow ? `${kind}-${on}` : undefined}
      icon={Icon}
      on={on}
      size={resolveSize(sizeProp)}
      colorVar={colorVar}
      className={className}
      title={title}
    />
  );
}
