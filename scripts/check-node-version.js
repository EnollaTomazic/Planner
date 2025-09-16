const major = parseInt(process.versions.node.split(".")[0], 10);
if (Number.isNaN(major)) {
  console.warn(
    `Unable to detect Node.js version. Continuing, but please ensure you're using Node 22 or newer.`,
  );
} else if (major < 22) {
  console.warn(
    `Node 22+ is recommended for full support. Detected ${process.versions.node}. Continuing with reduced support.`,
  );
}
