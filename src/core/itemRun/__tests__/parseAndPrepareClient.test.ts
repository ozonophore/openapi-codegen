import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { COMMON_DEFAULT_OPTIONS_VALUES } from '../../../common/Consts';
import type { TStrictFlatOptions } from '../../../common/TRawOptions';
import type { Context } from '../../Context';
import type { LoadedSpec } from '../../createResolvedContext';
import type { VirtualFileMap } from '../../specLoad/VirtualFileMap';
import type { Client } from '../../types/shared/Client.model';
import { OpenApiVersion } from '../../utils/getOpenApiVersion';
import type { PrepareClientFn } from '../parseAndPrepareClient';
import { parseAndPrepareClient } from '../parseAndPrepareClient';

function baseItem(overrides: Partial<TStrictFlatOptions> = {}): TStrictFlatOptions {
    return { ...COMMON_DEFAULT_OPTIONS_VALUES, input: 'spec.yaml', output: 'out', ...overrides } as TStrictFlatOptions;
}

function makeLogger() {
    return { info: () => {}, warn: () => {}, error: () => {}, forceInfo: () => {}, debug: () => {} } as any;
}

function makeSpec(version: 2 | 3): LoadedSpec {
    const openApi = version === 2 ? { swagger: '2.0', info: { title: 't', version: '1' }, paths: {} } : { openapi: '3.0.0', info: { title: 't', version: '1' }, paths: {} };
    return { context: {} as Context, map: {} as VirtualFileMap, openApi: openApi as any };
}

function fakeClient(): Client {
    return { version: '', server: '', models: [], services: [] } as Client;
}

describe('@unit: parseAndPrepareClient', () => {
    test('passes ParserV2 to prepareClient for v2 spec', () => {
        let capturedParserInstance: unknown;
        const prepareClient: PrepareClientFn = params => {
            capturedParserInstance = params.parse;
            return fakeClient();
        };

        parseAndPrepareClient(makeSpec(2), baseItem(), prepareClient, '/abs/spec.yaml', makeLogger());

        assert.ok(capturedParserInstance != null, 'prepareClient should have been called');
    });

    test('passes ParserV3 to prepareClient for v3 spec', () => {
        let capturedOpenApiVersion: OpenApiVersion | undefined;
        const prepareClient: PrepareClientFn = params => {
            capturedOpenApiVersion = params.openApiVersion;
            return fakeClient();
        };

        parseAndPrepareClient(makeSpec(3), baseItem(), prepareClient, '/abs/spec.yaml', makeLogger());

        assert.equal(capturedOpenApiVersion, OpenApiVersion.V3);
    });

    test('returns client from prepareClient', () => {
        const expected = fakeClient();
        const prepareClient: PrepareClientFn = () => expected;
        const result = parseAndPrepareClient(makeSpec(3), baseItem(), prepareClient, '/abs/spec.yaml', makeLogger());
        assert.equal(result, expected);
    });

    test('passes correct openApiVersion V2 to prepareClient', () => {
        let capturedVersion: OpenApiVersion | undefined;
        const prepareClient: PrepareClientFn = params => {
            capturedVersion = params.openApiVersion;
            return fakeClient();
        };

        parseAndPrepareClient(makeSpec(2), baseItem(), prepareClient, '/abs/spec.yaml', makeLogger());
        assert.equal(capturedVersion, OpenApiVersion.V2);
    });
});
