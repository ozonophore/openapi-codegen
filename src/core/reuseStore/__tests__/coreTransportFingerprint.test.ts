import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { HttpClient } from '../../types/enums/HttpClient.enum';
import { buildCoreTransportFingerprint, detectCustomRequestRaw, isRequestSensitiveCorePath } from '../coreTransportFingerprint';

describe('@unit: coreTransportFingerprint', () => {
    test('root-level request matches item that inherits the same path', () => {
        const root = buildCoreTransportFingerprint({
            request: './custom/request.ts',
            httpClient: HttpClient.FETCH,
        });
        const inherited = buildCoreTransportFingerprint({
            request: './custom/request.ts',
            httpClient: HttpClient.FETCH,
        });
        assert.equal(root, inherited);
    });

    test('per-item request override differs from root request', () => {
        const root = buildCoreTransportFingerprint({
            request: './shared/request.ts',
            httpClient: HttpClient.FETCH,
        });
        const override = buildCoreTransportFingerprint({
            request: './other/request.ts',
            httpClient: HttpClient.FETCH,
        });
        assert.notEqual(root, override);
    });

    test('identical explicit per-item request paths match', () => {
        const a = buildCoreTransportFingerprint({
            request: './same/request.ts',
            customExecutorPath: './exec.ts',
            httpClient: HttpClient.AXIOS,
            useCancelableRequest: true,
            useCustomRequestRaw: true,
        });
        const b = buildCoreTransportFingerprint({
            request: './same/request.ts',
            customExecutorPath: './exec.ts',
            httpClient: HttpClient.AXIOS,
            useCancelableRequest: true,
            useCustomRequestRaw: true,
        });
        assert.equal(a, b);
    });

    test('generated-default differs from custom request', () => {
        const generated = buildCoreTransportFingerprint({ httpClient: HttpClient.FETCH });
        const custom = buildCoreTransportFingerprint({
            request: './custom/request.ts',
            httpClient: HttpClient.FETCH,
        });
        assert.notEqual(generated, custom);
        assert.ok(generated.startsWith('generated-default'));
    });

    test('detectCustomRequestRaw finds requestRaw export', () => {
        assert.equal(detectCustomRequestRaw('export async function requestRaw() {}'), true);
        assert.equal(detectCustomRequestRaw('export function request() {}'), false);
    });

    test('request-sensitive core paths', () => {
        assert.equal(isRequestSensitiveCorePath('request.ts'), true);
        assert.equal(isRequestSensitiveCorePath('executor/legacyRequestAdapter.ts'), true);
        assert.equal(isRequestSensitiveCorePath('ApiError.ts'), false);
    });
});
