import type { AcceptedPlugin, PluginCreator } from "postcss";

declare module "postcss-import" {
  interface PostcssImportOptions {
    root?: string;
    path?: string | string[];
    skipDuplicates?: boolean;
    addModulesDirectories?: string[];
    plugins?: AcceptedPlugin[];
    filter?: (id: string) => boolean;
    load?: (
      filename: string,
      options?: { root: string; from: string }
    ) => string | Promise<string>;
    resolve?: (
      id: string,
      basedir: string,
      options: { root: string; from: string }
    ) =>
      | string
      | string[]
      | Promise<string>
      | Promise<string[]>;
    onImport?: (sources: string[]) => void;
  }

  const postcssImport: PluginCreator<PostcssImportOptions>;

  export type { PostcssImportOptions };
  export default postcssImport;
}
