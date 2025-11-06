"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import {
  Badge,
  SearchBar,
  SectionCard as UiSectionCard,
  IconButton,
} from "@/components/ui";
import { useScopedCssVars } from "@/components/ui/hooks/useScopedCssVars";
import type { DesignTokenGroup } from "@/components/gallery/types";
import { copyText } from "@/lib/clipboard";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import styles from "./ColorsView.module.css";
import {
  isTokenSelected,
  toggleTokenOverride,
  useTokenOverrides,
} from "@/components/gallery/token-overrides-store";

const TOKEN_GRID_CLASSNAME =
  "grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 sm:gap-[var(--space-4)] xl:grid-cols-3";

const TOKEN_CARD_CLASSNAME =
  "flex h-full cursor-pointer flex-col gap-[var(--space-3)] rounded-card r-card-md border border-[var(--card-hairline)] bg-panel/60 p-[var(--space-3)] shadow-neo-soft transition-colors focus-visible:outline-none focus-visible:ring-[var(--ring-size-2)] focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[selected=true]:border-[hsl(var(--accent-1))] data-[selected=true]:shadow-neo md:p-[var(--space-4)]";

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
  readonly onCopy: (token: TokenMeta) => void;
  readonly onToggle: (token: TokenMeta) => void;
  readonly selected: boolean;
}

export function ColorsView({ groups }: ColorsViewProps) {
  const [query, setQuery] = React.useState("");
  const [copiedToken, setCopiedToken] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState<string>("");
  const copyTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyCountRef = React.useRef(0);
  const overrides = useTokenOverrides();

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

  const handleToggle = React.useCallback((token: TokenMeta) => {
    toggleTokenOverride(token);
  }, []);

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
                      onToggle={handleToggle}
                      selected={isTokenSelected(token, overrides)}
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

function TokenCard({ token, copied, onCopy, onToggle, selected }: TokenCardProps) {
  const preview = React.useMemo(() => <TokenPreview token={token} />, [token]);

  const handleToggle = React.useCallback(() => {
    onToggle(token);
  }, [onToggle, token]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) {
        return;
      }

      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        handleToggle();
      }
    },
    [handleToggle],
  );

  const handleCopyClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onCopy(token);
    },
    [onCopy, token],
  );

  const handleCopyKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === " " || event.key === "Enter") {
        event.stopPropagation();
      }
    },
    [],
  );

  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        data-selected={selected ? "true" : undefined}
        className={TOKEN_CARD_CLASSNAME}
        onClick={handleToggle}
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
            onKeyDown={handleCopyKeyDown}
          >
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          </IconButton>
        </div>
        {preview}
        <code className="block break-words font-mono text-label text-muted-foreground">
          {token.value}
        </code>
      </div>
    </li>
  );
}

function TokenPreview({ token }: { token: TokenMeta }) {
  switch (token.category) {
    case "color":
      return <ColorPreview token={token} />;
    case "spacing":
      return <SpacingPreview token={token} />;
    case "radius":
      return <RadiusPreview token={token} />;
    case "shadow":
      return <ShadowPreview token={token} />;
    case "typography":
      return <TypographyPreview token={token} />;
    default:
      return null;
  }
}

function resolveColorPreviewValue(token: TokenMeta): string {
  const value = token.value.trim();
  const lower = value.toLowerCase();

  /* eslint-disable design/no-raw-design-values -- Allow explicit color syntax checks. */
  const requiresDirect =
    value.startsWith("#") ||
    lower.startsWith("rgb(") ||
    lower.startsWith("rgba(") ||
    lower.startsWith("hsl(") ||
    lower.startsWith("hsla(") ||
    lower.startsWith("oklab(") ||
    lower.startsWith("oklch(") ||
    lower.startsWith("color-mix(") ||
    lower.startsWith("linear-gradient(") ||
    lower.startsWith("radial-gradient(") ||
    lower.startsWith("conic-gradient(") ||
    lower === "transparent" ||
    lower === "currentcolor" ||
    lower === "inherit" ||
    lower === "none";
  /* eslint-enable design/no-raw-design-values */

  if (requiresDirect) {
    return `var(${token.cssVar})`;
  }

  return `hsl(var(${token.cssVar}))`;
}

function ColorPreview({ token }: { token: TokenMeta }) {
  const [theme] = useTheme();
  const { variant, bg } = theme;
  const swatchRef = React.useRef<HTMLDivElement | null>(null);
  const [isTranslucent, setIsTranslucent] = React.useState(false);

  const previewValue = React.useMemo(
    () => resolveColorPreviewValue(token),
    [token],
  );

  const { scopeProps, style } = useScopedCssVars({
    attribute: "data-color-preview",
    vars: {
      "--preview-color": previewValue,
    },
  });

  React.useEffect(() => {
    const node = swatchRef.current;

    if (!node) {
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
      const rawValue = computed.getPropertyValue(`--${token.name}`).trim();

      if (!rawValue) {
        setIsTranslucent(false);
        return;
      }

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
  }, [bg, token.name, variant]);

  return (
    <div
      className={cn(styles.colorPreview, "rounded-card r-card-md")}
      aria-hidden="true"
    >
      {isTranslucent ? (
        <div aria-hidden="true" className={styles.checkerboard} />
      ) : null}
      <div
        ref={swatchRef}
        className={styles.swatchFill}
        {...(scopeProps ?? {})}
        style={style}
      />
    </div>
  );
}

function SpacingPreview({ token }: { token: TokenMeta }) {
  const { scopeProps, style } = useScopedCssVars({
    attribute: "data-spacing-preview",
    vars: {
      "--preview-spacing": `var(${token.cssVar})`,
    },
  });

  return (
    <div className={styles.spacingTrack} aria-hidden="true">
      <div
        className={styles.spacingBar}
        {...(scopeProps ?? {})}
        style={style}
      />
    </div>
  );
}

function RadiusPreview({ token }: { token: TokenMeta }) {
  const { scopeProps, style } = useScopedCssVars({
    attribute: "data-radius-preview",
    vars: {
      "--preview-radius": `var(${token.cssVar})`,
    },
  });

  return (
    <div className={styles.radiusPreview} aria-hidden="true">
      <div
        className={cn(styles.radiusDemo, "rounded-card r-card-md")}
        {...(scopeProps ?? {})}
        style={style}
      />
    </div>
  );
}

function ShadowPreview({ token }: { token: TokenMeta }) {
  const { scopeProps, style } = useScopedCssVars({
    attribute: "data-shadow-preview",
    vars: {
      "--preview-shadow": `var(${token.cssVar})`,
    },
  });

  return (
    <div className={styles.shadowPreview} aria-hidden="true">
      <div
        className={cn(styles.shadowDemo, "rounded-card r-card-md")}
        {...(scopeProps ?? {})}
        style={style}
      />
    </div>
  );
}

function TypographyPreview({ token }: { token: TokenMeta }) {
  const normalizedName = token.name.toLowerCase();
  const rawValue = token.value.trim();
  const numericValue = Number(rawValue);
  const isNumeric =
    rawValue.length > 0 &&
    Number.isFinite(numericValue) &&
    !rawValue.includes(" ");
  const isWeightToken = normalizedName.includes("weight") || isNumeric;

  const vars: Record<string, string | number> = isWeightToken
    ? { "--preview-font-weight": `var(${token.cssVar})` }
    : { "--preview-font-size": `var(${token.cssVar})` };

  const { scopeProps, style } = useScopedCssVars({
    attribute: "data-typography-preview",
    vars,
  });

  return (
    <div
      className={cn(styles.typographyPreview, "rounded-card r-card-md")}
      {...(scopeProps ?? {})}
      style={style}
      aria-hidden="true"
    >
      Aa
    </div>
  );
}
