import ComponentsSectionPage, {
  metadata,
  generateStaticParams,
  dynamicParams as componentsDynamicParams,
} from "../../../src/app/components/[section]/page";

export { metadata, generateStaticParams };

export const dynamicParams = componentsDynamicParams;

export default ComponentsSectionPage;
