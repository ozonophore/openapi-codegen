import assert from 'node:assert';
import { describe, test } from 'node:test';

import { COMMON_DEFAULT_OPTIONS_VALUES, DEFAULT_OUTPUT_API_DIR } from '../../../../common/Consts';
import { buildConfig, buildExampleConfig } from '../buildConfig';
import { ValidatedSpec } from '../validateSpecFiles';

const createMockSpec = (relativePath: string = './test/spec.yml'): ValidatedSpec => ({
    relativePath,
    path: '',
});

describe('@unit: buildConfig', () => {
    test('creates items array for multiple specs in multi-option mode', async () => {
        const validatedSpecs: ValidatedSpec[] = [createMockSpec('./api/v1.yml'), createMockSpec('./api/v2.yml')];

        const result = await buildConfig(validatedSpecs, true);

        assert.strictEqual(result.items?.length, 2);
        assert.strictEqual(result.items?.[0].input, './api/v1.yml');
        assert.strictEqual(result.items?.[1].input, './api/v2.yml');
        assert.strictEqual(result.items?.[0].output, DEFAULT_OUTPUT_API_DIR);
        assert.strictEqual(result.items?.[1].output, DEFAULT_OUTPUT_API_DIR);
    });

    test('includes per-item request when perSpecRequest is enabled', async () => {
        const validatedSpecs: ValidatedSpec[] = [createMockSpec()];
        const customRequest = './custom/request.ts';

        const result = await buildConfig(validatedSpecs, true, { request: customRequest }, true);

        assert.strictEqual(result.items?.[0].request, customRequest);
        assert.strictEqual(result.request, undefined);
    });

    test('includes root request when perSpecRequest is disabled', async () => {
        const validatedSpecs: ValidatedSpec[] = [createMockSpec()];
        const customRequest = './custom/request.ts';

        const result = await buildConfig(validatedSpecs, true, { request: customRequest }, false);

        assert.strictEqual(result.items?.[0].request, undefined);
        assert.strictEqual(result.request, customRequest);
    });

    test('sets default values from COMMON_DEFAULT_OPTIONS_VALUES in multi mode', async () => {
        const result = await buildConfig([createMockSpec()], true);

        assert.strictEqual(result.httpClient, COMMON_DEFAULT_OPTIONS_VALUES.httpClient);
        assert.strictEqual(result.sortByRequired, COMMON_DEFAULT_OPTIONS_VALUES.sortByRequired);
        assert.strictEqual(result.enumPrefix, COMMON_DEFAULT_OPTIONS_VALUES.enumPrefix);
        assert.strictEqual(result.excludeCoreServiceFiles, COMMON_DEFAULT_OPTIONS_VALUES.excludeCoreServiceFiles);
        assert.strictEqual(result.interfacePrefix, COMMON_DEFAULT_OPTIONS_VALUES.interfacePrefix);
        assert.strictEqual(result.typePrefix, COMMON_DEFAULT_OPTIONS_VALUES.typePrefix);
        assert.strictEqual(result.useCancelableRequest, COMMON_DEFAULT_OPTIONS_VALUES.useCancelableRequest);
        assert.strictEqual(result.useOptions, COMMON_DEFAULT_OPTIONS_VALUES.useOptions);
        assert.strictEqual(result.useSeparatedIndexes, COMMON_DEFAULT_OPTIONS_VALUES.useSeparatedIndexes);
        assert.strictEqual(result.useUnionTypes, COMMON_DEFAULT_OPTIONS_VALUES.useUnionTypes);
        assert.strictEqual(result.modelsMode, COMMON_DEFAULT_OPTIONS_VALUES.modelsMode);
        assert.strictEqual(result.useHistory, COMMON_DEFAULT_OPTIONS_VALUES.useHistory);
        assert.strictEqual(result.diffReport, COMMON_DEFAULT_OPTIONS_VALUES.diffReport);
    });

    test('uses first spec for flat config', async () => {
        const validatedSpecs: ValidatedSpec[] = [createMockSpec('./api/v1.yml'), createMockSpec('./api/v2.yml')];

        const result = await buildConfig(validatedSpecs, false);

        assert.strictEqual(result.input, './api/v1.yml');
        assert.strictEqual(result.output, DEFAULT_OUTPUT_API_DIR);
    });

    test('throws when no validated specs in flat mode', async () => {
        await assert.rejects(() => buildConfig([], false), /No validated spec files found/);
    });

    test('includes request in flat mode', async () => {
        const customRequest = './custom/request.ts';
        const result = await buildConfig([createMockSpec()], false, { request: customRequest });

        assert.strictEqual(result.request, customRequest);
    });
});

describe('@unit: buildExampleConfig', () => {
    test('creates multi-option example with placeholder spec path', () => {
        const result = buildExampleConfig(true);

        assert.strictEqual(result.items?.length, 1);
        assert.strictEqual(result.items?.[0].input, './openapi/spec.yml');
        assert.strictEqual(result.items?.[0].output, DEFAULT_OUTPUT_API_DIR);
    });

    test('creates flat example with placeholder spec path', () => {
        const result = buildExampleConfig(false);

        assert.strictEqual(result.input, './openapi/spec.yml');
        assert.strictEqual(result.output, DEFAULT_OUTPUT_API_DIR);
    });

    test('includes root request for multi-option when not perSpecRequest', () => {
        const customRequest = './custom/request.ts';
        const result = buildExampleConfig(true, { request: customRequest }, false);

        assert.strictEqual(result.request, customRequest);
        assert.strictEqual(result.items?.[0].request, undefined);
    });

    test('includes per-item request when perSpecRequest is true', () => {
        const customRequest = './custom/request.ts';
        const result = buildExampleConfig(true, { request: customRequest }, true);

        assert.strictEqual(result.request, undefined);
        assert.strictEqual(result.items?.[0].request, customRequest);
    });
});
