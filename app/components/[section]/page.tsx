import ComponentsSectionPage, {
  metadata,
  generateStaticParams,
} from "../../../src/app/components/[section]/page";

type ComponentsDynamicParams = typeof import("../../../src/app/components/[section]/page").dynamicParams;

export { metadata, generateStaticParams };

export const dynamicParams: ComponentsDynamicParams = false;

export default ComponentsSectionPage;
