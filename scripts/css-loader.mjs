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
