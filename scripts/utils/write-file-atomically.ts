import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const DEFAULT_MAX_RENAME_RETRIES = 3;

export interface WriteFileAtomicallyOptions {
  readonly encoding?: BufferEncoding | null;
  readonly mode?: number;
  readonly flag?: string | number;
  readonly signal?: AbortSignal;
  readonly maxRetries?: number;
}

type WriteData = Parameters<typeof fs.writeFile>[1];
type WriteOptions = Omit<WriteFileAtomicallyOptions, "maxRetries">;

export const writeFileAtomically = async (
  filePath: string,
  data: WriteData,
  options: WriteFileAtomicallyOptions = {},
): Promise<void> => {
  const { maxRetries = DEFAULT_MAX_RENAME_RETRIES, ...writeOptions } = options;
  const directory = path.dirname(filePath);
  await fs.mkdir(directory, { recursive: true });

  const tempBase = `.tmp-${path.basename(filePath)}-${process.pid}-${Date.now()}-${randomBytes(6).toString("hex")}`;
  const tempPath = path.join(directory, tempBase);

  await fs.writeFile(tempPath, data, writeOptions as WriteOptions);

  let attempt = 0;
  while (true) {
    try {
      await fs.rename(tempPath, filePath);
      return;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException | undefined)?.code;
      if (code === "EEXIST" && attempt < maxRetries) {
        attempt += 1;
        await fs.rm(filePath, { force: true });
        continue;
      }

      await fs.rm(tempPath, { force: true });
      throw error;
    }
  }
};
