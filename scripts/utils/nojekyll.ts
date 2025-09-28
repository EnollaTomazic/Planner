import fs from "node:fs";
import path from "node:path";

export function ensureNoJekyll(directory: string): void {
  const markerPath = path.join(directory, ".nojekyll");
  if (fs.existsSync(markerPath)) {
    return;
  }

  fs.writeFileSync(markerPath, "");
}
