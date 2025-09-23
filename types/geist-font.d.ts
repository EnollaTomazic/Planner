declare module "geist/font" {
  export interface GeistFontOptions {
    subsets: string[];
    weight?: string | string[];
    style?: string | string[];
    display?: string;
    variable?: string;
    preload?: boolean;
    fallback?: string[];
    adjustFontFallback?: boolean;
    axes?: string[];
  }

  export interface GeistFont {
    className: string;
    variable: string;
    style: {
      fontFamily: string;
    };
  }

  export function Geist(options: GeistFontOptions): GeistFont;
  export function Geist_Mono(options: GeistFontOptions): GeistFont;
}

declare module "geist/font/mono" {
  import type { GeistFont } from "geist/font";

  export const GeistMono: GeistFont;
}

declare module "geist/font/sans" {
  import type { GeistFont } from "geist/font";

  export const GeistSans: GeistFont;
}
