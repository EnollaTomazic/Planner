// src/components/ui/layout/PageHeroHeader.tsx
"use client";

import { cn } from "@/lib/utils";

import { PageHero, type PageHeroProps } from "./PageHero";
import { PageShell, type PageShellProps } from "./PageShell";

type PageHeroHeaderShellProps = Omit<
  PageShellProps<"header">,
  "as" | "children" | "grid"
>;

export interface PageHeroHeaderProps<Key extends string = string>
  extends PageHeroProps<Key> {
  /** Optional overrides for the surrounding <PageShell>. */
  shellProps?: PageHeroHeaderShellProps;
}

export function PageHeroHeader<Key extends string = string>({
  shellProps,
  className,
  ...heroProps
}: PageHeroHeaderProps<Key>) {
  const { className: shellClassName, ...restShellProps } = shellProps ?? {};

  return (
    <PageShell
      as="header"
      grid
      className={cn("py-[var(--space-6)]", shellClassName)}
      {...restShellProps}
    >
      <PageHero
        {...heroProps}
        className={className}
      />
    </PageShell>
  );
}
