import "./check-node-version.js";
import path from "node:path";
import process from "node:process";
import { ensureNoJekyll } from "./utils/nojekyll.js";

function main(): void {
  const targetArg = process.argv[2] ?? "out";
  const targetDirectory = path.resolve(targetArg);
  ensureNoJekyll(targetDirectory);
}

if (process.env.VITEST !== "true") {
  try {
    main();
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}
