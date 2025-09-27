"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import {
  Badge,
  SearchBar,
  SectionCard as UiSectionCard,
  IconButton,
} from "@/components/ui";
import {
  isTokenCategoryOverridable,
  useTokenSelection,
} from "@/components/gallery/token-selection-context";
import type { DesignTokenGroup } from "@/components/gallery/types";
import { copyText } from "@/lib/clipboard";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

const CHECKERBOARD_STYLE: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg, hsl(var(--surface)) 25%, hsl(var(--surface-2)) 25%, hsl(var(--surface-2)) 50%, hsl(var(--surface)) 50%, hsl(var(--surface)) 75%, hsl(var(--surface-2)) 75%, hsl(var(--surface-2)) 100%), linear-gradient(45deg, hsl(var(--surface-2)) 25%, hsl(var(--surface)) 25%, hsl(var(--surface)) 50%, hsl(var(--surface-2)) 50%, hsl(var(--surface-2)) 75%, hsl(var(--surface)) 75%, hsl(var(--surface)) 100%)",
  backgroundPosition: "0 0, var(--space-2) var(--space-2)",
  backgroundSize: "calc(var(--space-2) * 2) calc(var(--space-2) * 2)",
};

const TOKEN_GRID_CLASSNAME =
  "grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 sm:gap-[var(--space-4)] xl:grid-cols-3";

const TOKEN_CARD_BASE_CLASSNAME =
  "flex h-full flex-col gap-[var(--space-3)] rounded-card r-card-md border border-[var(--card-hairline)] bg-panel/60 p-[var(--space-3)] md:p-[var(--space-4)]";

const TOKEN_CARD_INTERACTIVE_CLASSNAME =
  "cursor-pointer transition-[border-color,background-color,box-shadow] duration-quick ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:border-[hsl(var(--accent)/0.35)] data-[selected=true]:border-[hsl(var(--accent)/0.5)] data-[selected=true]:bg-panel/80 data-[selected=true]:shadow-[var(--shadow-outline-subtle)]";

const TOKEN_CARD_ACTIVATION_KEYS = new Set(["Enter", " ", "Space", "Spacebar"]);

const CATEGORY_DESCRIPTIONS: Partial<Record<DesignTokenGroup["id"], string>> = {
  color: "Swatches, overlays, gradients, and semantic colors shared across Planner.",
  state: "State opacities and utility helpers for disabled, loading, and hidden surfaces.",
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
  readonly selected: boolean;
  readonly onCopy: (token: TokenMeta) => void;
  readonly onToggleSelect: (token: TokenMeta) => void;
}

export default function ColorsView({ groups }: ColorsViewProps) {
  const [query, setQuery] = React.useState("");
  const [copiedToken, setCopiedToken] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState<string>("");
  const { selections, toggleToken } = useTokenSelection();
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

  const handleToggleSelection = React.useCallback(
    (token: TokenMeta) => {
      const alreadySelected = selections[token.category]?.name === token.name;
      toggleToken(token);

      const { label, affectsPreview } = (() => {
        if (!isTokenCategoryOverridable(token.category)) {
          return { label: `${token.category} tokens`, affectsPreview: false };
        }

        switch (token.category) {
          case "color":
            return { label: "accent previews", affectsPreview: true } as const;
          case "radius":
            return { label: "card radius", affectsPreview: true } as const;
          case "shadow":
            return { label: "surface shadows", affectsPreview: true } as const;
          default:
            return { label: `${token.category} tokens`, affectsPreview: false };
        }
      })();

      setAnnouncement(
        alreadySelected
          ? `${token.cssVar} deselected.`
          : affectsPreview
            ? `${token.cssVar} applied to ${label}.`
            : `${token.cssVar} noted — previews unchanged for ${label}.`,
      );
    },
    [selections, toggleToken],
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
              Search Planner&apos;s color, state, spacing, radius, typography, shadow,
              motion, and z-index tokens. Copy any token for quick use in new
              surfaces.
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
                      selected={
                        selections[token.category]?.name === token.name
                      }
                      onToggleSelect={handleToggleSelection}
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

function TokenCard({
  token,
  copied,
  selected,
  onCopy,
  onToggleSelect,
}: TokenCardProps) {
  const preview = React.useMemo(() => <TokenPreview token={token} />, [token]);

  const handleCopyClick = React.useCallback<
    React.MouseEventHandler<HTMLButtonElement>
  >(
    (event) => {
      event.stopPropagation();
      onCopy(token);
    },
    [onCopy, token],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLLIElement>) => {
      if (event.currentTarget !== event.target) {
        return;
      }

      if (TOKEN_CARD_ACTIVATION_KEYS.has(event.key)) {
        event.preventDefault();
        onToggleSelect(token);
      }
    },
    [onToggleSelect, token],
  );

  const handleClick = React.useCallback(() => {
    onToggleSelect(token);
  }, [onToggleSelect, token]);

  return (
    <li
      className={cn(TOKEN_CARD_BASE_CLASSNAME, TOKEN_CARD_INTERACTIVE_CLASSNAME)}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      data-selected={selected ? "true" : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
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
          onClick={handleCopyClick}
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
  const [theme] = useTheme();
  const { variant, bg } = theme;
  const swatchRef = React.useRef<HTMLDivElement | null>(null);
  const [resolvedColor, setResolvedColor] = React.useState<string | null>(null);
  const [isTranslucent, setIsTranslucent] = React.useState(false);

  React.useEffect(() => {
    const node = swatchRef.current;

    if (!node) {
      setResolvedColor(null);
      setIsTranslucent(false);
      return;
    }

    let cancelled = false;
    let frame: number | null = null;
    let timeout: number | null = null;

    const measure = () => {
      if (cancelled) {
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
    };

    if (typeof window.requestAnimationFrame === "function") {
      frame = window.requestAnimationFrame(measure);
    } else {
      timeout = window.setTimeout(measure, 16);
    }

    return () => {
      cancelled = true;
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
      if (timeout !== null) {
        window.clearTimeout(timeout);
      }
    };
  }, [bg, name, variant]);

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
