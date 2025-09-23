declare module "geist/font" {
  interface GeistFontOptions {
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

  interface GeistFont {
    className: string;
    variable: string;
    style: {
      fontFamily: string;
    };
  }

  export function Geist(options: GeistFontOptions): GeistFont;
  export function Geist_Mono(options: GeistFontOptions): GeistFont;
}
