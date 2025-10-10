const { createRequire } = require('module');
const requireFn = createRequire(__filename);
const webpackModule = requireFn('next/dist/compiled/webpack/webpack');

if (typeof webpackModule.init === 'function') {
  webpackModule.init();
}

if (
  typeof webpackModule.WebpackError !== 'function' &&
  typeof webpackModule.webpack?.WebpackError === 'function'
) {
  webpackModule.WebpackError = webpackModule.webpack.WebpackError;
}
