export interface LlmAgentMetadata {
  readonly id: string;
  readonly label?: string;
  readonly kind?: string;
}

export interface LlmAgentUsage extends LlmAgentMetadata {
  readonly tokens: number;
  readonly share: number;
}

export interface LlmTokenUsageSummary {
  readonly totalTokens: number;
  readonly agents: readonly LlmAgentUsage[];
}

type UsageRecord = {
  metadata: LlmAgentMetadata;
  tokens: number;
};

const usageStore = new Map<string, UsageRecord>();

let aggregateTokens = 0;

function normalizeText(value: string | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeMetadata(metadata: LlmAgentMetadata): LlmAgentMetadata {
  const normalizedId = normalizeText(metadata.id);
  const normalizedLabel = normalizeText(metadata.label);
  const normalizedKind = normalizeText(metadata.kind);

  return {
    id: normalizedId ?? "",
    ...(normalizedLabel !== undefined ? { label: normalizedLabel } : {}),
    ...(normalizedKind !== undefined ? { kind: normalizedKind } : {}),
  } satisfies LlmAgentMetadata;
}

function mergeMetadata(
  existing: LlmAgentMetadata | undefined,
  incoming: LlmAgentMetadata,
): LlmAgentMetadata {
  return {
    id: incoming.id,
    ...(existing?.label ? { label: existing.label } : {}),
    ...(existing?.kind ? { kind: existing.kind } : {}),
    ...(incoming.label !== undefined ? { label: incoming.label } : {}),
    ...(incoming.kind !== undefined ? { kind: incoming.kind } : {}),
  } satisfies LlmAgentMetadata;
}

function normalizeTokenCount(value: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  const rounded = Math.round(value);
  return rounded > 0 ? rounded : 0;
}

function deleteUsage(id: string, previousTokens: number): void {
  usageStore.delete(id);
  aggregateTokens -= previousTokens;

  if (aggregateTokens < 0) {
    aggregateTokens = 0;
  }
}

export function recordLlmTokenUsage(
  metadata: LlmAgentMetadata,
  tokens: number,
): void {
  const normalizedMetadata = normalizeMetadata(metadata);

  if (normalizedMetadata.id.length === 0) {
    return;
  }

  const normalizedTokens = normalizeTokenCount(tokens);

  if (normalizedTokens === null) {
    return;
  }

  const existing = usageStore.get(normalizedMetadata.id);
  const previousTokens = existing?.tokens ?? 0;

  if (normalizedTokens === 0) {
    if (existing) {
      deleteUsage(normalizedMetadata.id, previousTokens);
    }
    return;
  }

  const mergedMetadata = mergeMetadata(existing?.metadata, normalizedMetadata);

  usageStore.set(normalizedMetadata.id, {
    metadata: mergedMetadata,
    tokens: normalizedTokens,
  });

  aggregateTokens += normalizedTokens - previousTokens;

  if (aggregateTokens < 0) {
    aggregateTokens = 0;
  }
}

export function getLlmTokenUsageSummary(): LlmTokenUsageSummary {
  const safeTotal = aggregateTokens > 0 ? aggregateTokens : 0;

  const agents = Array.from(usageStore.values())
    .filter((record) => record.tokens > 0)
    .map<LlmAgentUsage>((record) => {
      const share = safeTotal === 0 ? 0 : record.tokens / safeTotal;

      return {
        ...record.metadata,
        tokens: record.tokens,
        share,
      } satisfies LlmAgentUsage;
    })
    .sort((a, b) => {
      if (b.tokens !== a.tokens) {
        return b.tokens - a.tokens;
      }

      return a.id.localeCompare(b.id);
    });

  return {
    totalTokens: safeTotal,
    agents,
  } satisfies LlmTokenUsageSummary;
}

export function resetLlmTokenUsage(): void {
  usageStore.clear();
  aggregateTokens = 0;
}
