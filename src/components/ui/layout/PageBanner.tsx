"use client";

import * as React from "react";
import Header, { type HeaderProps } from "./Header";
import Hero, { type HeroProps } from "./Hero";

function cx(...p: Array<string | false | null | undefined>) {
  return p.filter(Boolean).join(" ");
}

export interface PageBannerProps<HK extends string = string, HK2 extends string = string> {
  header: HeaderProps<HK>;
  hero?: HeroProps<HK2>;
  className?: string;
}

export default function PageBanner<HK extends string = string, HK2 extends string = string>({
  header,
  hero,
  className,
}: PageBannerProps<HK, HK2>) {
  return (
    <div
      className={cx(
        "sticky top-0 relative overflow-hidden rounded-card r-card-lg border border-[hsl(var(--border))/0.4] px-6 md:px-7 lg:px-8 hero2-neomorph",
        className,
      )}
    >
      <span aria-hidden className="hero2-beams" />
      <span aria-hidden className="hero2-scanlines" />
      <span aria-hidden className="hero2-noise opacity-[0.03]" />

      <div className="relative z-[2] grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <Header {...header} />
        </div>
        {hero ? (
          <div className="col-span-12">
            <Hero {...hero} frame={false} topClassName={cx("top-[var(--header-stack)]", hero.topClassName)} />
          </div>
        ) : null}
      </div>

      <div
        aria-hidden
        className="absolute inset-0 rounded-card r-card-lg ring-1 ring-inset ring-border/55"
      />
    </div>
  );
}

