// src/components/ui/SectionCard.tsx
"use client";

import * as React from "react";
import clsx from "clsx";
import { cn } from "@/lib/utils";

type RootProps = React.HTMLAttributes<HTMLElement> & {
  variant?: "neo" | "plain";
};
export type SectionCardHeaderProps = {
  sticky?: boolean;
  topClassName?: string; // sticky top offset
  className?: string;
  children?: React.ReactNode; // if provided, we render this and ignore title/actions
  title?: React.ReactNode; // optional convenience API
  actions?: React.ReactNode; // optional convenience API
};
type BodyProps = React.HTMLAttributes<HTMLDivElement>;

const Root = React.forwardRef<HTMLElement, RootProps>(
  ({ variant = "neo", className, children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          "shadow-neo-strong rounded-card r-card-lg text-card-foreground",
          variant === "neo" ? "card-neo-soft" : "card-soft",
          className,
        )}
        {...props}
      >
        {children}
      </section>
    );
  },
);
Root.displayName = "SectionCard";

function Header({
  sticky,
  topClassName = "top-[var(--space-8)]",
  className,
  children,
  title,
  actions,
}: SectionCardHeaderProps) {
  return (
    <div
      className={cn(
        "section-h",
        sticky && clsx("sticky", topClassName),
        className,
      )}
    >
      {children ?? (
        <div className="flex w-full items-center justify-between">
          <div>{title}</div>
          <div>{actions}</div>
        </div>
      )}
    </div>
  );
}

function Body({ className, ...props }: BodyProps) {
  return <div className={cn("section-b", className)} {...props} />;
}

const SectionCard = Object.assign(Root, { Header, Body });
export default SectionCard;
