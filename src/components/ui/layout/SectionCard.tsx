// src/components/ui/SectionCard.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type RootProps = React.HTMLAttributes<HTMLDivElement>;
export type HeaderProps = {
  sticky?: boolean;
  className?: string;
  children?: React.ReactNode;       // if provided, we render this and ignore title/actions
  title?: React.ReactNode;          // optional convenience API
  actions?: React.ReactNode;        // optional convenience API
};
type BodyProps = React.HTMLAttributes<HTMLDivElement>;

function Root({ className, ...props }: RootProps) {
  return <section className={cn("section rounded-card", className)} {...props} />;
}

function Header({ sticky, className, children, title, actions }: HeaderProps) {
  return (
    <div className={cn("section-h", sticky && "sticky", className)}>
      {children ?? (
        <div className="flex items-center justify-between w-full">
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
