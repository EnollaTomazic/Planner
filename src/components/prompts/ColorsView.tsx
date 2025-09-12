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
      <h2 className="text-xl font-semibold tracking-[-0.01em]">{title}</h2>
      {children}
    </section>
  );
}

type SwatchProps = { token: string };

function Swatch({ token }: SwatchProps) {
  return (
    <li className="col-span-3 flex flex-col items-center gap-3">
      <div
        className="h-16 w-full rounded-card r-card-md border border-[var(--card-hairline)]"
        style={{ backgroundColor: `hsl(var(--${token}))` }}
      />
      <span className="text-xs font-medium">{token}</span>
    </li>
  );
}

function GradientSwatch() {
  return (
    <li className="col-span-12 md:col-span-6 flex flex-col items-center gap-3">
      <div className="h-16 w-full rounded-card r-card-md bg-gradient-to-r from-primary via-accent to-transparent" />
      <span className="text-xs font-medium">
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
          <ul className="grid grid-cols-12 gap-6">
            {p.tokens.map((t) => (
              <Swatch key={t} token={t} />
            ))}
          </ul>
        </SectionCard>
      ))}
      <SectionCard title="Gradients">
        <ul className="grid grid-cols-12 gap-6">
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
