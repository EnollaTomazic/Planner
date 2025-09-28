import PreviewPage, {
  dynamic as previewDynamic,
  dynamicParams as previewDynamicParams,
  generateMetadata as previewGenerateMetadata,
  generateStaticParams as previewGenerateStaticParams,
} from "../../../src/app/preview/[slug]/page";

export default PreviewPage;

export const dynamic = previewDynamic;
export const dynamicParams = previewDynamicParams;
export const generateStaticParams = previewGenerateStaticParams;
export const generateMetadata = previewGenerateMetadata;
