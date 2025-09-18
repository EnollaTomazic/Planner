import * as React from "react";
import Fuse from "fuse.js";
import { Card, CardContent } from "@/components/ui";
import Badge from "@/components/ui/primitives/Badge";
import { SPEC_DATA, type Section, type Spec } from "./constants";

type ComponentsViewProps = {
  query: string;
  section: Section;
  onCurrentCodeChange?: (code: string | null) => void;
  onFilteredCountChange?: (count: number) => void;
};

type SpecCardProps = Spec & {
  onCodeVisibilityChange?: (
    specId: string,
    code: string | null,
    visible: boolean,
  ) => void;
};

function SpecCard({
  id,
  name,
  description,
  element,
  props,
  code,
  onCodeVisibilityChange,
}: SpecCardProps) {
  const [showCode, setShowCode] = React.useState(false);
  const handleToggleCode = React.useCallback(() => {
    setShowCode((prev) => {
      const next = !prev;
      if (code) {
        onCodeVisibilityChange?.(id, code, next);
      }
      return next;
    });
  }, [code, id, onCodeVisibilityChange]);

  return (
    <article
      tabIndex={0}
      className="relative flex flex-col gap-4 rounded-card r-card-lg border border-[var(--card-hairline)] bg-card p-6 [--card-shadow:var(--shadow)] shadow-[var(--card-shadow)] transition-[box-shadow] duration-[var(--dur-quick)] ease-out motion-safe:transition-transform motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-card motion-safe:hover:-translate-y-0.5 hover:[--card-shadow:var(--shadow-raised,var(--shadow))] active:[--card-shadow:var(--shadow-inset,var(--shadow))] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-[var(--hairline-w)] before:rounded-t-[calc(var(--radius-card)-var(--hairline-w))] before:bg-gradient-to-r before:from-transparent before:via-[hsl(var(--ring)/0.4)] before:to-transparent before:opacity-75 before:transition-opacity before:duration-[var(--dur-quick)] before:ease-out focus-visible:before:opacity-100 active:before:opacity-100 hover:before:opacity-90"
    >
      <header className="flex items-center justify-between">
        <h3 className="text-title leading-[1.3] font-semibold tracking-[-0.01em]">{name}</h3>
        {code && (
          <button
            type="button"
            onClick={handleToggleCode}
            className="inline-flex h-12 items-center justify-center rounded-full px-4 text-ui font-medium underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            {showCode ? "Hide code" : "Show code"}
          </button>
        )}
      </header>
      {description ? (
        <p className="text-ui font-medium text-muted-foreground">{description}</p>
      ) : null}
      <div className="rounded-card r-card-md bg-background p-4">{element}</div>
      {showCode && code ? (
        <pre className="rounded-card r-card-md bg-muted p-4 text-label overflow-x-auto">
          <code>{code}</code>
        </pre>
      ) : null}
      {props ? (
        <ul className="flex flex-wrap gap-3 text-label">
          {props.map((p) => (
            <li key={p.label} className="flex gap-1">
              <span className="font-medium tracking-[0.02em]">{p.label}</span>
              <span className="text-muted-foreground">{p.value}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export default function ComponentsView({
  query,
  section,
  onCurrentCodeChange,
  onFilteredCountChange,
}: ComponentsViewProps) {
  const countDescriptionId = React.useId();
  const [, setActiveSpecId] = React.useState<string | null>(null);
  const handleCodeVisibilityChange = React.useCallback(
    (specId: string, nextCode: string | null, visible: boolean) => {
      if (!onCurrentCodeChange) return;
      if (visible && nextCode) {
        setActiveSpecId(specId);
        onCurrentCodeChange(nextCode);
        return;
      }

      if (!visible) {
        setActiveSpecId((current) => {
          if (current === specId) {
            onCurrentCodeChange(null);
            return null;
          }
          return current;
        });
      }
    },
    [onCurrentCodeChange],
  );

  React.useEffect(() => {
    if (!onCurrentCodeChange) return;
    onCurrentCodeChange(null);
    setActiveSpecId(null);
  }, [query, section, onCurrentCodeChange]);

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

  const sectionLabel = React.useMemo(
    () => section.charAt(0).toUpperCase() + section.slice(1),
    [section],
  );

  const filteredCount = specs.length;

  const countLabel = React.useMemo(() => {
    const suffix = filteredCount === 1 ? "spec" : "specs";
    return `${filteredCount} ${sectionLabel.toLowerCase()} ${suffix}`;
  }, [filteredCount, sectionLabel]);

  React.useEffect(() => {
    if (!onFilteredCountChange) return;
    onFilteredCountChange(filteredCount);
  }, [filteredCount, onFilteredCountChange]);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <h2 className="text-ui font-semibold tracking-[-0.01em] text-muted-foreground">
          {sectionLabel} specs
        </h2>
        <Badge
          id={countDescriptionId}
          tone="support"
          size="sm"
          className="text-muted-foreground"
        >
          {countLabel}
        </Badge>
      </header>
      <ul
        className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-12 sm:gap-[var(--space-6)]"
        aria-describedby={countDescriptionId}
      >
        {specs.length === 0 ? (
          <li className="col-span-full">
            <Card>
              <CardContent>No results found</CardContent>
            </Card>
          </li>
        ) : (
          specs.map((spec) => (
            <li
              key={spec.id}
              className="col-span-full sm:col-span-6 lg:col-span-4 xl:col-span-3"
            >
              <SpecCard
                {...spec}
                onCodeVisibilityChange={handleCodeVisibilityChange}
              />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
