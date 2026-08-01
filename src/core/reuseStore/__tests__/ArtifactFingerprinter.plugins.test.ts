import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { COMMON_DEFAULT_OPTIONS_VALUES } from '../../../common/Consts';
import type { TStrictFlatOptions } from '../../../common/TRawOptions';
import { buildOptionsSlice, buildOptionsSliceHash } from '../ArtifactFingerprinter';

function baseOptions(overrides: Partial<TStrictFlatOptions> = {}): TStrictFlatOptions {
    return { ...COMMON_DEFAULT_OPTIONS_VALUES, ...overrides };
}

describe('@unit: ArtifactFingerprinter pluginsHash', () => {
    test('path entry config changes pluginsHash', () => {
        const a = buildOptionsSlice(
            baseOptions({
                plugins: [{ path: './p.cjs', name: 'my-plugin', config: { mode: 'a' } }],
            })
        );
        const b = buildOptionsSlice(
            baseOptions({
                plugins: [{ path: './p.cjs', name: 'my-plugin', config: { mode: 'b' } }],
            })
        );
        assert.notEqual(a.pluginsHash, b.pluginsHash);
    });

    test('identical path entries produce identical pluginsHash', () => {
        const entry = { path: './p.cjs', name: 'my-plugin', config: { mode: 'a' } };
        const a = buildOptionsSlice(baseOptions({ plugins: [entry] }));
        const b = buildOptionsSlice(baseOptions({ plugins: [entry] }));
        assert.equal(a.pluginsHash, b.pluginsHash);
    });

    test('path without name uses path as hash key', () => {
        const withName = buildOptionsSlice(
            baseOptions({
                plugins: [{ path: './p.cjs', name: './p.cjs', config: { x: 1 } }],
            })
        );
        const withoutName = buildOptionsSlice(
            baseOptions({
                plugins: [{ path: './p.cjs', config: { x: 1 } }],
            })
        );
        assert.equal(withName.pluginsHash, withoutName.pluginsHash);
    });

    test('disableBuiltinPlugins changes options slice hash', () => {
        const withBuiltins = buildOptionsSlice(baseOptions({ disableBuiltinPlugins: false }));
        const withoutBuiltins = buildOptionsSlice(baseOptions({ disableBuiltinPlugins: true }));
        assert.notEqual(buildOptionsSliceHash(withBuiltins), buildOptionsSliceHash(withoutBuiltins));
    });
});
