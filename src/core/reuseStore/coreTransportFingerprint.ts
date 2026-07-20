import type { HttpClient } from '../types/enums/HttpClient.enum';

export type CoreTransportFingerprintInput = {
    /** Effective request path after normalizeOptions, or undefined for generated default. */
    request?: string;
    customExecutorPath?: string;
    httpClient: HttpClient | string;
    useCancelableRequest?: boolean;
    /** True when custom request file exports `requestRaw`. */
    useCustomRequestRaw?: boolean;
};

/**
 * Stable key for transport options that affect request-sensitive core files.
 * Call after normalizeOptions so root vs per-item `request` is already resolved.
 */
export function buildCoreTransportFingerprint(input: CoreTransportFingerprintInput): string {
    return [input.request ?? 'generated-default', input.customExecutorPath ?? '', String(input.httpClient), String(!!input.useCancelableRequest), String(!!input.useCustomRequestRaw)].join('\0');
}

/** Same detection as writeClientCore for custom request files. */
export function detectCustomRequestRaw(content: string): boolean {
    return /\bexport\s+(async\s+)?function\s+requestRaw\b/.test(content);
}

/** Core relative paths whose content depends on the transport fingerprint. */
const REQUEST_SENSITIVE_CORE_PATHS = new Set(['request.ts', 'executor/legacyRequestAdapter.ts', 'executor/createExecutorAdapter.ts']);

export function isRequestSensitiveCorePath(relativeCorePath: string): boolean {
    return REQUEST_SENSITIVE_CORE_PATHS.has(relativeCorePath);
}
