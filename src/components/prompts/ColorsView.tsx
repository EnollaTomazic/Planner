import * as React from "react";
import { SectionCard as UiSectionCard } from "@/components/ui";
import { COLOR_SECTIONS } from "./constants";

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
};

function SectionCard({ title, children }: SectionCardProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-title font-semibold tracking-[-0.01em]">{title}</h2>
      {children}
    </section>
  );
}

type SwatchProps = { token: string };

function Swatch({ token }: SwatchProps) {
  return (
    <li className="flex flex-col items-start gap-[var(--space-2)] xl:col-span-3">
      <div
        className="h-16 w-full rounded-card r-card-md border border-[var(--card-hairline)]"
        style={{ backgroundColor: `hsl(var(--${token}))` }}
      />
      <span className="w-full text-left text-label font-medium">{token}</span>
    </li>
  );
}

function GradientSwatch() {
  return (
    <li className="col-span-full xl:col-span-6 flex flex-col items-start gap-[var(--space-2)]">
      <div className="h-16 w-full rounded-card r-card-md bg-gradient-to-r from-primary via-accent to-transparent" />
      <span className="w-full text-left text-label font-medium">
        from-primary via-accent to-transparent
      </span>
    </li>
  );
}

export default function ColorsView() {
  return (
    <div className="space-y-8">
      {COLOR_SECTIONS.map((p) => (
        <SectionCard key={p.title} title={p.title}>
          <ul className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 md:grid-cols-4 md:gap-[var(--space-4)] xl:grid-cols-12 xl:gap-[var(--space-5)]">
            {p.tokens.map((t) => (
              <Swatch key={t} token={t} />
            ))}
          </ul>
        </SectionCard>
      ))}
      <SectionCard title="Gradients">
        <ul className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 md:grid-cols-4 md:gap-[var(--space-4)] xl:grid-cols-12 xl:gap-[var(--space-5)]">
          <GradientSwatch />
        </ul>
      </SectionCard>
      <SectionCard title="SectionCard Variants">
        <div className="flex flex-col gap-4">
          <UiSectionCard>
            <UiSectionCard.Header title="Neo (default)" />
            <UiSectionCard.Body>Content</UiSectionCard.Body>
          </UiSectionCard>
          <UiSectionCard variant="plain">
            <UiSectionCard.Header title="Plain" />
            <UiSectionCard.Body>Content</UiSectionCard.Body>
          </UiSectionCard>
        </div>
      </SectionCard>
    </div>
  );
}
