import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { COMMON_DEFAULT_OPTIONS_VALUES } from '../../../common/Consts';
import type { TStrictFlatOptions } from '../../../common/TRawOptions';
import type { ItemRunContext } from '../../GenerationBatchSession';
import { buildOptionsSlice } from '../../reuseStore/ArtifactFingerprinter';
import type { ReuseStore } from '../../reuseStore/ReuseStore';
import { buildReuseProps } from '../buildReuseProps';

function baseItem(overrides: Partial<TStrictFlatOptions> = {}): TStrictFlatOptions {
    return { ...COMMON_DEFAULT_OPTIONS_VALUES, input: 'spec.yaml', output: 'out', ...overrides } as TStrictFlatOptions;
}

function fakeReuseStore(): ReuseStore {
    return { getManifest: () => ({ specItems: {} }), verifySpecItemIntegrity: async () => true } as unknown as ReuseStore;
}

function baseContext(reuseStore: ReuseStore | null = null): ItemRunContext {
    return {
        reuseStore,
        referencedArtifactKeys: new Set(),
        specAnalysisAccumulator: null,
    };
}

describe('@unit: buildReuseProps', () => {
    test('returns undefined when reuseStore is null', () => {
        const item = baseItem({ cache: true, cacheStrategy: 'reuse' });
        const result = buildReuseProps(item, baseContext(null), new Map(), '/abs/spec.yaml', 'spec', buildOptionsSlice(item));
        assert.equal(result, undefined);
    });

    test('returns undefined when useReuseStore is false (cache=false)', () => {
        const item = baseItem({ cache: false, cacheStrategy: 'reuse' });
        const result = buildReuseProps(item, baseContext(fakeReuseStore()), new Map(), '/abs/spec.yaml', 'spec', buildOptionsSlice(item));
        assert.equal(result, undefined);
    });

    test('returns undefined when cacheStrategy is not reuse', () => {
        const item = baseItem({ cache: true, cacheStrategy: 'entity' });
        const result = buildReuseProps(item, baseContext(fakeReuseStore()), new Map(), '/abs/spec.yaml', 'spec', buildOptionsSlice(item));
        assert.equal(result, undefined);
    });

    test('assembles ReuseProps when reuseStore present and strategy=reuse', () => {
        const reuseStore = fakeReuseStore();
        const item = baseItem({ cache: true, cacheStrategy: 'reuse', prettierConfigPath: '/prettier.config.js', reuseOnConflict: 'fail' });
        const modelSchemas = new Map<string, Record<string, unknown>>([['Model', { type: 'object' }]]);
        const optionsSlice = buildOptionsSlice(item);
        const context = baseContext(reuseStore);

        const result = buildReuseProps(item, context, modelSchemas, '/abs/spec.yaml', 'spec', optionsSlice);

        assert.ok(result !== undefined);
        assert.equal(result.reuseStore, reuseStore);
        assert.equal(result.specInput, 'spec');
        assert.equal(result.inputPath, '/abs/spec.yaml');
        assert.equal(result.modelSchemas, modelSchemas);
        assert.equal(result.optionsSlice, optionsSlice);
        assert.equal(result.referencedArtifactKeys, context.referencedArtifactKeys);
        assert.equal(result.reuseOnConflict, 'fail');
        assert.equal(result.prettierConfigPath, '/prettier.config.js');
    });
});
