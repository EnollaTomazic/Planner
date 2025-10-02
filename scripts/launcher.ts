import "./check-node-version.js";
import { spawn } from "child_process";

const modes = ["dev", "start", "build"] as const;
type Mode = (typeof modes)[number];

const [mode = "dev"] = process.argv.slice(2) as Mode[];
if (!modes.includes(mode)) {
  console.error(`Unknown mode: ${mode}`);
  process.exit(1);
}

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const child = spawn(pnpmCommand, ["run", mode], { stdio: "inherit", shell: true });
child.on("exit", (code) => {
  process.exit(code ?? 0);
});
