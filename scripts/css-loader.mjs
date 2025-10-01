import path from "node:path";
import { fileURLToPath } from "node:url";

const runtimeUrl = new URL(
  "../src/components/gallery/runtime.ts",
  import.meta.url,
).href;

export async function load(url, context, defaultLoad) {
  if (url.endsWith(".css")) {
    return {
      format: "module",
      source: "export default {};\n",
      shortCircuit: true,
    };
  }
  if (url.endsWith(".png")) {
    const filePath = fileURLToPath(url);
    const projectRoot = process.cwd();
    const publicDir = path.join(projectRoot, "public");
    let relativePath = path.relative(publicDir, filePath).replace(/\\/g, "/");

    if (relativePath.startsWith("..")) {
      relativePath = path
        .relative(projectRoot, filePath)
        .replace(/\\/g, "/");
    }

    const assetPath = relativePath.startsWith("/")
      ? relativePath
      : `/${relativePath}`;

    return {
      format: "module",
      source: `export default ${JSON.stringify(assetPath)};\n`,
      shortCircuit: true,
    };
  }
  if (url === runtimeUrl) {
    return {
      format: "module",
      source: `export const galleryPayload = { sections: [], byKind: { primitive: [], component: [], complex: [], token: [] } };
export const getGalleryPreviewRenderer = () => null;
export const getGalleryEntriesByKind = () => [];
export const getGallerySection = () => null;
`,
      shortCircuit: true,
    };
  }
  return defaultLoad(url, context, defaultLoad);
}
