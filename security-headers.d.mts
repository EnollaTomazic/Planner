export interface SecurityHeader {
  readonly key: string;
  readonly value: string;
}

export declare const securityHeadersMap: Readonly<Record<string, string>>;
export declare const securityHeaders: ReadonlyArray<SecurityHeader>;
