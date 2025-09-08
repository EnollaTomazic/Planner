import { execSync } from "node:child_process";
import { MultiBar, Presets } from "cli-progress";

function hasComponentChanges(): boolean {
  try {
    const diff = execSync("git diff --name-only HEAD -- src/components")
      .toString()
      .trim();
    return diff !== "";
  } catch {
    return true;
  }
}

function run(cmd: string): void {
  execSync(cmd, { stdio: "inherit" });
}

async function main() {
  if (process.env.CI === "true" || !hasComponentChanges()) {
    console.log("Skipping UI and feature regeneration");
    return;
  }

  const bars = new MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
    },
    Presets.shades_grey,
  );
  const taskBar = bars.create(2, 0);

  run("npm run regen-ui");
  taskBar.update(1);

  run("npm run regen-feature");
  taskBar.update(2);

  bars.stop();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
