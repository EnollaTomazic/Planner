"use client";

import * as React from "react";
import { Clock, FileText, Brain } from "lucide-react";
import { NeonIcon as UIToggleNeonIcon } from "@/components/ui";

type Props = {
  kind: "clock" | "file" | "brain";
  on: boolean;
  size?: number;
  className?: string;
  title?: string;
  staticGlow?: boolean;
};

export default function NeonIcon({
  kind,
  on,
  size = 40,
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
      size={size}
      colorVar={colorVar}
      className={className}
      title={title}
    />
  );
}
