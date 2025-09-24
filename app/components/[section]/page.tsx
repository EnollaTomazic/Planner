export { metadata } from "../../../src/app/components/[section]/page";
export { default } from "../../../src/app/components/[section]/page";

import {
  dynamicParams as dynamicParamsConfig,
  generateStaticParams as generateStaticParamsFn,
} from "../../../src/app/components/[section]/page";

export const dynamicParams = dynamicParamsConfig;
export const generateStaticParams = generateStaticParamsFn;
