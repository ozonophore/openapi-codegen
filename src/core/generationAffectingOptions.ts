import type { TStrictFlatOptions } from '../common/TRawOptions';
import { buildOptionsSlice, hashFingerprint, stableStringify } from './reuseStore/ArtifactFingerprinter';
import type { OptionsSlice } from './reuseStore/types';

/**
 * OptionsSlice Pick keys (reuse projection) — keep in sync with `OptionsSlice` in reuseStore/types.ts.
 * `plugins` are represented as `pluginsHash` inside OptionsSlice, not as a Pick key.
 */
export const REUSE_OPTIONS_SLICE_KEYS = [
    'validationLibrary',
    'useUnionTypes',
    'interfacePrefix',
    'enumPrefix',
    'typePrefix',
    'modelsMode',
    'modelsLayout',
    'sortByRequired',
    'emptySchemaStrategy',
    'useSeparatedIndexes',
    'httpClient',
    'prettierConfigPath',
    'disableBuiltinPlugins',
] as const satisfies readonly (keyof OptionsSlice)[];

/**
 * Generation-affecting keys: reuse OptionsSlice coverage (incl. plugins) ∪ former entity residual fields.
 */
export const GENERATION_AFFECTING_KEYS = [
    'plugins',
    ...REUSE_OPTIONS_SLICE_KEYS,
    'request',
    'useOptions',
    'includeSchemasFiles',
    'excludeCoreServiceFiles',
    'strictPluginMode',
    'customExecutorPath',
    'useCancelableRequest',
    'useHistory',
    'diffReport',
    'strictOpenapi',
    'failOnGovernanceErrors',
] as const satisfies readonly (keyof TStrictFlatOptions)[];

/**
 * Hash of all generation-affecting options for entity fingerprint locality.
 * Plugins use the same normalization as `buildOptionsSlice` (`pluginsHash`).
 */
export function buildGenerationAffectingHash(item: TStrictFlatOptions): string {
    const { pluginsHash } = buildOptionsSlice(item);
    const body: Record<string, unknown> = { pluginsHash };
    for (const key of GENERATION_AFFECTING_KEYS) {
        if (key === 'plugins') {
            continue;
        }
        body[key] = item[key];
    }
    return hashFingerprint(stableStringify(body));
}
