export interface SecurityHeader {
  readonly key: string;
  readonly value: string;
}

export interface SecurityPolicyOptions {
  readonly allowVercelFeedback?: boolean;
  readonly metricsEndpoint?: string;
  readonly metricsEndpointOrigin?: string;
  readonly nonce?: string;
}

export declare const baseSecurityHeadersMap: Readonly<Record<string, string>>;
export declare const baseSecurityHeaders: ReadonlyArray<SecurityHeader>;
export declare const createContentSecurityPolicy: (
  options?: SecurityPolicyOptions,
) => string;
export declare const sanitizeContentSecurityPolicyForMeta: (
  policy: string,
) => string;
export declare const createSecurityHeaders: (
  options?: SecurityPolicyOptions,
) => ReadonlyArray<SecurityHeader>;
export declare const defaultSecurityPolicyOptions: SecurityPolicyOptions;
