import Page, {
  dynamic as themeMatrixDynamic,
  generateStaticParams as themeMatrixGenerateStaticParams,
  metadata,
} from "../../../src/app/preview/theme-matrix/page";

export default Page;
export { metadata };
export const dynamic = "force-static";
export const generateStaticParams = themeMatrixGenerateStaticParams;

if (process.env.NODE_ENV !== "production") {
  if (themeMatrixDynamic !== dynamic) {
    throw new Error("Theme matrix dynamic config mismatch");
  }
}
