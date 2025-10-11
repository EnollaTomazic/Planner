const [major] = process.versions.node.split('.').map((part) => Number.parseInt(part, 10));

if (Number.isNaN(major)) {
  console.warn(
    'Unable to detect Node.js version. Continuing, but ensure you\'re using Node.js 22.12.0 or newer.',
  );
} else if (major < 22) {
  console.error(
    `Node.js 22 LTS is required for this project. Detected ${process.versions.node}. Please upgrade to Node.js 22.12.0 or newer.`,
  );
  process.exitCode = 1;
}
