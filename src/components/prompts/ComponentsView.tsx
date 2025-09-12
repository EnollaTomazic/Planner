import * as React from "react";
import Fuse from "fuse.js";
import { Card, CardContent } from "@/components/ui";
import { SPEC_DATA, type Section, type Spec } from "./constants";

type ComponentsViewProps = {
  query: string;
  section: Section;
};

function SpecCard({ name, description, element, props }: Spec) {
  return (
    <div className="flex flex-col gap-4 rounded-card r-card-lg border border-[var(--card-hairline)] bg-card p-6 shadow-[0_0_0_1px_var(--neon-soft)]">
      <header className="flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-[-0.01em]">{name}</h3>
      </header>
      {description ? (
        <p className="text-sm font-medium text-muted-foreground">{description}</p>
      ) : null}
      <div className="rounded-card r-card-md bg-background p-4">{element}</div>
      {props ? (
        <ul className="flex flex-wrap gap-3 text-xs">
          {props.map((p) => (
            <li key={p.label} className="flex gap-1">
              <span className="font-medium tracking-[0.02em]">{p.label}</span>
              <span className="text-muted-foreground">{p.value}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function ComponentsView({ query, section }: ComponentsViewProps) {
  const fuse = React.useMemo(
    () =>
      new Fuse(SPEC_DATA[section], {
        keys: ["name", "tags", "props.value"],
        threshold: 0.3,
      }),
    [section],
  );

  const specs = React.useMemo(() => {
    if (!query) return SPEC_DATA[section];
    return fuse.search(query).map((r) => r.item);
  }, [query, fuse, section]);

  return (
    <div className="space-y-8">
      <ul className="grid grid-cols-12 gap-6">
        {specs.length === 0 ? (
          <li className="col-span-12">
            <Card>
              <CardContent>No results found</CardContent>
            </Card>
          </li>
        ) : (
          specs.map((spec) => (
            <li key={spec.id} className="col-span-12 md:col-span-6">
              <SpecCard {...spec} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
