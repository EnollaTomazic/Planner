import Page, { dynamic as perfDynamic, metadata } from "../../../src/app/preview/perf/page";

export default Page;
export { metadata };
export const dynamic = "force-static";

if (process.env.NODE_ENV !== "production") {
  if (perfDynamic !== dynamic) {
    throw new Error("Performance preview dynamic config mismatch");
  }
}
