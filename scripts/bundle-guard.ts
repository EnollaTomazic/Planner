import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_LIMIT_KB = 350;
const limitKb =
  Number.parseInt(process.env.BUNDLE_GUARD_LIMIT ?? "", 10) || DEFAULT_LIMIT_KB;

type StatsAsset = {
  name?: string;
  size?: number;
  chunks?: Array<string | number>;
  chunkNames?: string[];
};

type StatsChunk = {
  id?: string | number;
  ids?: Array<string | number>;
  initial?: boolean;
  names?: string[];
};

type WebpackStats = {
  assets?: StatsAsset[];
  chunks?: StatsChunk[];
};

function findStats(): WebpackStats {
  const locations = [
    process.env.BUNDLE_ANALYZE_OUTPUT_DIR,
    path.join(".next", "analyze"),
    path.join("docs", "bundle-report"),
  ]
    .filter(Boolean)
    .map((dir) => path.resolve(dir!, "client.json"));

  for (const candidate of locations) {
    if (existsSync(candidate)) {
      return JSON.parse(readFileSync(candidate, "utf8")) as WebpackStats;
    }
  }

  throw new Error(
    "Bundle stats not found. Run with BUNDLE_GUARD=true so the analyzer emits client.json.",
  );
}

function collectInitialJsBytes(stats: WebpackStats): number {
  const initialIds = new Set<string | number>();

  for (const chunk of stats.chunks ?? []) {
    if (!chunk.initial) {
      continue;
    }
    if (Array.isArray(chunk.ids)) {
      for (const id of chunk.ids) {
        initialIds.add(id);
      }
    }
    if (chunk.id !== undefined) {
      initialIds.add(chunk.id);
    }
    if (Array.isArray(chunk.names)) {
      for (const name of chunk.names) {
        initialIds.add(name);
      }
    }
  }

  return (stats.assets ?? [])
    .filter((asset) => asset.name?.endsWith(".js"))
    .filter((asset) => {
      if (asset.chunks?.some((id) => initialIds.has(id))) {
        return true;
      }
      if (asset.chunkNames?.some((name) => initialIds.has(name))) {
        return true;
      }
      return asset.name?.includes("app/") || asset.name?.includes("main");
    })
    .reduce((total, asset) => total + (asset.size ?? 0), 0);
}

function formatKb(bytes: number): string {
  return `${Math.round((bytes / 1024) * 10) / 10} kB`;
}

const stats = findStats();
const totalBytes = collectInitialJsBytes(stats);
const limitBytes = limitKb * 1024;

if (totalBytes > limitBytes) {
  console.error(
    `[bundle-guard] Initial JS bundle is ${formatKb(
      totalBytes,
    )}, exceeding the ${limitKb} kB limit.`,
  );
  process.exit(1);
}

console.log(
  `[bundle-guard] Initial JS bundle is ${formatKb(
    totalBytes,
  )} (limit ${limitKb} kB).`,
);
