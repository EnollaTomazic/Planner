export interface SecurityHeader {
  readonly key: string;
  readonly value: string;
}

export declare const baseSecurityHeadersMap: Readonly<Record<string, string>>;
export declare const baseSecurityHeaders: ReadonlyArray<SecurityHeader>;
export declare const createContentSecurityPolicy: (nonce: string) => string;
export declare const createSecurityHeaders: (nonce: string) => ReadonlyArray<SecurityHeader>;
