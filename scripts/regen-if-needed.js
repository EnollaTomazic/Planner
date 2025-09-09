if (process.env.CI === "true") {
  process.exit(0);
}

(async () => {
  await import("ts-node/esm");
  await import("./regen-if-needed.ts");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
