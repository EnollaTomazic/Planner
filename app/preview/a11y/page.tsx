import Page, { dynamic as a11yDynamic, metadata } from "../../../src/app/preview/a11y/page";

export default Page;
export { metadata };
export const dynamic = "force-static";

if (process.env.NODE_ENV !== "production") {
  if (a11yDynamic !== dynamic) {
    throw new Error("Accessibility preview dynamic config mismatch");
  }
}
