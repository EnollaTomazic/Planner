declare class Fuse<T> {
  constructor(list: T[], options?: unknown);
  search(pattern: string): Fuse.FuseResult<T>[];
}

declare namespace Fuse {
  interface FuseResult<T> {
    item: T;
    refIndex: number;
  }
}

export = Fuse;
