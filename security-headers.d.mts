export interface SecurityHeader {
  readonly key: string;
  readonly value: string;
}

export interface SecurityPolicyOptions {
  readonly allowVercelFeedback?: boolean;
}

export declare const baseSecurityHeadersMap: Readonly<Record<string, string>>;
export declare const baseSecurityHeaders: ReadonlyArray<SecurityHeader>;
export declare const createContentSecurityPolicy: (
  nonce: string,
  options?: SecurityPolicyOptions,
) => string;
export declare const createSecurityHeaders: (
  nonce: string,
  options?: SecurityPolicyOptions,
) => ReadonlyArray<SecurityHeader>;
