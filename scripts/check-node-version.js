const major = parseInt(process.versions.node.split(".")[0], 10);
if (major < 22) {
  console.error(`Node 22+ is required. Detected ${process.versions.node}.`);
  process.exit(1);
}
