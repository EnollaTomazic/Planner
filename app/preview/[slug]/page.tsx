import PreviewPage, {
  dynamic as previewDynamic,
  dynamicParams as previewDynamicParams,
  generateMetadata as previewGenerateMetadata,
  generateStaticParams as previewGenerateStaticParams,
} from "../../../src/app/preview/[slug]/page";

export default PreviewPage;

export const dynamic = "force-static";
export const dynamicParams = false;
export const generateStaticParams = previewGenerateStaticParams;
export const generateMetadata = previewGenerateMetadata;

if (process.env.NODE_ENV !== "production") {
  if (previewDynamic !== dynamic) {
    throw new Error("Preview page dynamic config mismatch");
  }
  if (previewDynamicParams !== dynamicParams) {
    throw new Error("Preview page dynamicParams config mismatch");
  }
}
