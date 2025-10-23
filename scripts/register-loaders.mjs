import { register, createRequire } from "node:module";
import path from "node:path";

register("./css-loader.mjs", import.meta.url);

const require = createRequire(import.meta.url);
const Module = require("module");

const extensions = Module._extensions;

extensions[".css"] = function stubCss(module) {
  module._compile("module.exports = {};", module.filename);
};

extensions[".png"] = function stubPng(module, filename) {
  const projectRoot = process.cwd();
  const publicDir = path.join(projectRoot, "public");
  let relativePath = path.relative(publicDir, filename).replace(/\\/g, "/");

  if (relativePath.startsWith("..")) {
    relativePath = path.relative(projectRoot, filename).replace(/\\/g, "/");
  }

  const assetPath = relativePath.startsWith("/")
    ? relativePath
    : `/${relativePath}`;

  module._compile(`module.exports = ${JSON.stringify(assetPath)};`, filename);
};
