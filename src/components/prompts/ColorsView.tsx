"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import {
  Badge,
  SearchBar,
  SectionCard as UiSectionCard,
  IconButton,
} from "@/components/ui";
import type { DesignTokenGroup } from "@/components/gallery/types";
import { copyText } from "@/lib/clipboard";

const CHECKERBOARD_STYLE: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg, hsl(var(--surface)) 25%, hsl(var(--surface-2)) 25%, hsl(var(--surface-2)) 50%, hsl(var(--surface)) 50%, hsl(var(--surface)) 75%, hsl(var(--surface-2)) 75%, hsl(var(--surface-2)) 100%), linear-gradient(45deg, hsl(var(--surface-2)) 25%, hsl(var(--surface)) 25%, hsl(var(--surface)) 50%, hsl(var(--surface-2)) 50%, hsl(var(--surface-2)) 75%, hsl(var(--surface)) 75%, hsl(var(--surface)) 100%)",
  backgroundPosition: "0 0, var(--space-2) var(--space-2)",
  backgroundSize: "calc(var(--space-2) * 2) calc(var(--space-2) * 2)",
};

const TOKEN_GRID_CLASSNAME =
  "grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 sm:gap-[var(--space-4)] xl:grid-cols-3";

const TOKEN_CARD_CLASSNAME =
  "flex h-full flex-col gap-[var(--space-3)] rounded-card r-card-md border border-[var(--card-hairline)] bg-panel/60 p-[var(--space-3)] md:p-[var(--space-4)]";

const CATEGORY_DESCRIPTIONS: Partial<Record<DesignTokenGroup["id"], string>> = {
  color: "Swatches, overlays, gradients, and semantic colors shared across Planner.",
  spacing: "Spacing scale, gutters, and control dimensions for layout rhythm.",
  radius: "Corner radii applied to cards, surfaces, and interactive controls.",
  typography: "Font sizes and weight tokens that shape headings and UI text.",
  shadow: "Elevation, outline, and glow shadows for surfaces and interactions.",
  motion: "Durations and easing curves for animated transitions.",
  z: "Layer stacks that keep headers and overlays above core content.",
};

type ColorsViewProps = {
  readonly groups: readonly DesignTokenGroup[];
};

type TokenMeta = DesignTokenGroup["tokens"][number];

interface TokenCardProps {
  readonly token: TokenMeta;
  readonly copied: boolean;
  readonly onCopy: (token: TokenMeta) => void;
}

export default function ColorsView({ groups }: ColorsViewProps) {
  const [query, setQuery] = React.useState("");
  const [copiedToken, setCopiedToken] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState<string>("");
  const copyTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyCountRef = React.useRef(0);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredGroups = React.useMemo(() => {
    if (!normalizedQuery) {
      return groups;
    }

    const next: DesignTokenGroup[] = [];

    for (const group of groups) {
      const filteredTokens = group.tokens.filter((token) =>
        token.search.includes(normalizedQuery),
      );

      if (filteredTokens.length > 0) {
        next.push({
          id: group.id,
          label: group.label,
          tokens: Object.freeze([...filteredTokens]) as readonly TokenMeta[],
        });
      }
    }

    return next;
  }, [groups, normalizedQuery]);

  const totalTokens = React.useMemo(
    () => groups.reduce((acc, group) => acc + group.tokens.length, 0),
    [groups],
  );

  const visibleTokens = React.useMemo(
    () => filteredGroups.reduce((acc, group) => acc + group.tokens.length, 0),
    [filteredGroups],
  );

  const countLabel = React.useMemo(() => {
    if (visibleTokens === totalTokens) {
      const suffix = visibleTokens === 1 ? "token" : "tokens";
      return `${visibleTokens} ${suffix}`;
    }
    const suffix = visibleTokens === 1 ? "token" : "tokens";
    return `Showing ${visibleTokens} of ${totalTokens} ${suffix}`;
  }, [totalTokens, visibleTokens]);

  const handleCopy = React.useCallback(
    async (token: TokenMeta) => {
      const target = `var(${token.cssVar})`;

      try {
        await copyText(target);
      } catch {
        // Ignore clipboard errors and still surface feedback.
      }

      copyCountRef.current += 1;
      setCopiedToken(token.name);
      setAnnouncement(`Copied ${target} to clipboard. ${copyCountRef.current}`);

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopiedToken(null);
      }, 2000);
    },
    [],
  );

  React.useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-[var(--space-6)]">
      <header className="space-y-[var(--space-3)]">
        <div className="flex flex-col gap-[var(--space-3)] md:flex-row md:items-end md:justify-between">
          <div className="space-y-[var(--space-2)]">
            <h2 className="text-title font-semibold tracking-[-0.01em] text-foreground">
              Design token explorer
            </h2>
            <p className="max-w-[min(100%,calc(var(--space-8)*8))] text-label text-muted-foreground">
              Search Planner&apos;s color, spacing, radius, typography, shadow, motion,
              and z-index tokens. Copy any token for quick use in new surfaces.
            </p>
          </div>
          <div className="w-full max-w-[calc(var(--space-8)*7)]">
            <SearchBar
              value={query}
              onValueChange={setQuery}
              debounceMs={0}
              height="sm"
              label="Search tokens"
              placeholder="Search tokens…"
            />
          </div>
        </div>
        <Badge size="sm" tone="support">
          {countLabel}
        </Badge>
      </header>

      {filteredGroups.length === 0 ? (
        <UiSectionCard variant="plain">
          <UiSectionCard.Body className="text-label text-muted-foreground">
            No tokens match that search. Try a different name, value, or category.
          </UiSectionCard.Body>
        </UiSectionCard>
      ) : (
        filteredGroups.map((group) => {
          const description = CATEGORY_DESCRIPTIONS[group.id];
          const tokenCount = group.tokens.length;
          const tokenSuffix = tokenCount === 1 ? "token" : "tokens";

          return (
            <UiSectionCard key={group.id}>
              <UiSectionCard.Header
                title={group.label}
                actions={
                  <Badge size="sm" tone="support">
                    {tokenCount} {tokenSuffix}
                  </Badge>
                }
              />
              <UiSectionCard.Body className="space-y-[var(--space-3)]">
                {description ? (
                  <p className="text-label text-muted-foreground">{description}</p>
                ) : null}
                <ul className={TOKEN_GRID_CLASSNAME} role="list">
                  {group.tokens.map((token) => (
                    <TokenCard
                      key={token.name}
                      token={token}
                      copied={copiedToken === token.name}
                      onCopy={handleCopy}
                    />
                  ))}
                </ul>
              </UiSectionCard.Body>
            </UiSectionCard>
          );
        })
      )}

      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}

function TokenCard({ token, copied, onCopy }: TokenCardProps) {
  const preview = React.useMemo(() => <TokenPreview token={token} />, [token]);

  return (
    <li className={TOKEN_CARD_CLASSNAME}>
      <div className="flex items-start justify-between gap-[var(--space-2)]">
        <div className="min-w-[calc(var(--space-1)*0)]">
          <p className="break-words font-mono text-ui font-semibold text-foreground">
            {token.cssVar}
          </p>
        </div>
        <IconButton
          size="sm"
          tone={copied ? "accent" : "primary"}
          aria-label={`Copy ${token.cssVar}`}
          title={`Copy ${token.cssVar}`}
          onClick={() => onCopy(token)}
        >
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        </IconButton>
      </div>
      {preview}
      <code className="block break-words font-mono text-label text-muted-foreground">
        {token.value}
      </code>
    </li>
  );
}

function TokenPreview({ token }: { token: TokenMeta }) {
  switch (token.category) {
    case "color":
      return <ColorPreview name={token.name} />;
    case "spacing":
      return <SpacingPreview name={token.name} />;
    case "radius":
      return <RadiusPreview name={token.name} />;
    case "shadow":
      return <ShadowPreview name={token.name} />;
    case "typography":
      return <TypographyPreview token={token} />;
    default:
      return null;
  }
}

function ColorPreview({ name }: { name: string }) {
  const swatchRef = React.useRef<HTMLDivElement | null>(null);
  const [resolvedColor, setResolvedColor] = React.useState<string | null>(null);
  const [isTranslucent, setIsTranslucent] = React.useState(false);

  React.useEffect(() => {
    const node = swatchRef.current;
    if (!node) {
      return;
    }

    const computed = window.getComputedStyle(node);
    const rawValue = computed.getPropertyValue(`--${name}`).trim();

    if (!rawValue) {
      setResolvedColor(null);
      setIsTranslucent(false);
      return;
    }

    let color = rawValue;
    const supportsColor = window.CSS?.supports;
    let translucent = false;

    const slashMatch = rawValue.match(/\/(\s*[0-9.]+)(%?)/);

    if (slashMatch) {
      const numeric = parseFloat(slashMatch[1]);
      if (!Number.isNaN(numeric)) {
        const alpha = slashMatch[2] === "%" ? numeric / 100 : numeric;
        translucent = alpha < 1;
      }
    } else if (rawValue.includes("transparent")) {
      translucent = true;
    }

    if (typeof supportsColor === "function") {
      if (!supportsColor("color", rawValue)) {
        const hslValue = `hsl(${rawValue})`;
        color = supportsColor("color", hslValue) ? hslValue : rawValue;
      }
    } else if (!rawValue.includes("(") && !rawValue.startsWith("var(")) {
      color = `hsl(${rawValue})`;
    }

    setResolvedColor(color);
    setIsTranslucent(translucent);
  }, [name]);

  return (
    <div
      className="relative h-[var(--space-8)] w-full overflow-hidden rounded-card r-card-md border border-[var(--card-hairline)]"
      aria-hidden="true"
    >
      {isTranslucent ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={CHECKERBOARD_STYLE}
        />
      ) : null}
      <div
        ref={swatchRef}
        className="relative h-full w-full"
        style={{ background: resolvedColor ?? undefined }}
      />
    </div>
  );
}

function SpacingPreview({ name }: { name: string }) {
  return (
    <div
      className="mt-[var(--space-2)] h-[var(--space-2)] w-full overflow-hidden rounded-full bg-[hsl(var(--foreground)/0.08)]"
      aria-hidden="true"
    >
      <div
        className="h-full rounded-full bg-[hsl(var(--accent-2)/0.65)]"
        style={{ width: `var(--${name})`, maxWidth: "100%" }}
      />
    </div>
  );
}

function RadiusPreview({ name }: { name: string }) {
  return (
    <div
      className="mt-[var(--space-2)] flex w-full justify-center"
      aria-hidden="true"
    >
      <div
        className="aspect-square w-full max-w-[var(--space-8)] overflow-hidden rounded-[var(--radius-md)] border border-[var(--card-hairline)] bg-panel/70"
        style={{ borderRadius: `var(--${name})` }}
      />
    </div>
  );
}

function ShadowPreview({ name }: { name: string }) {
  return (
    <div
      className="mt-[var(--space-2)] flex w-full justify-center"
      aria-hidden="true"
    >
      <div
        className="h-[var(--space-7)] w-full rounded-card border border-[var(--card-hairline)] bg-panel/70"
        style={{
          boxShadow: `var(--${name})`,
          maxWidth: "calc(var(--space-8) * 2)",
        }}
      />
    </div>
  );
}

function TypographyPreview({ token }: { token: TokenMeta }) {
  const previewStyle = React.useMemo<React.CSSProperties>(() => {
    const style: React.CSSProperties = {};
    const cssReference = `var(--${token.name})`;

    if (
      (token.name.startsWith("font-") && !token.name.includes("weight")) ||
      token.name.endsWith("-fs")
    ) {
      style.fontSize = cssReference;
    }

    if (token.name.includes("weight")) {
      style.fontWeight = token.value;
    }

    return style;
  }, [token.name, token.value]);

  return (
    <div
      className="mt-[var(--space-2)] rounded-card border border-[var(--card-hairline)] bg-panel/60 px-[var(--space-3)] py-[var(--space-2)] text-ui font-semibold text-foreground"
      style={previewStyle}
      aria-hidden="true"
    >
      Aa
    </div>
  );
}
