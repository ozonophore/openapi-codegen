import type { TStrictFlatOptions } from '../../common/TRawOptions';
import { buildCacheKey, buildEntityFingerprint, defaultFilesExist, resolveEntitySkipCandidate, usesEntityCache, usesReuseStoreForItem } from '../generationCache/EntitySkip';
import type { GenerationCache } from '../generationCache/GenerationCache';
import type { ReuseStore } from '../reuseStore/ReuseStore';

export type EntitySkipResult = { skipped: true; files: string[]; cacheDebug: boolean; input: string } | { skipped: false };

/**
 * Resolves EntitySkip check without side effects (no writeClient, no logger calls).
 * Caller is responsible for registering output files and logging CACHE_HIT/MISS.
 */
export async function resolveEntitySkip(
    item: TStrictFlatOptions,
    absoluteInput: string,
    generationCache: GenerationCache | null,
    reuseStore: ReuseStore | null,
    specInput: string
): Promise<EntitySkipResult> {
    const useEntityCache = usesEntityCache(item, generationCache);
    if (!useEntityCache) {
        return { skipped: false };
    }

    const cacheKey = buildCacheKey(item, absoluteInput);
    const cacheFingerprint = await buildEntityFingerprint(item, absoluteInput);
    const useReuseStore = usesReuseStoreForItem(item, reuseStore);

    const willSkip = await resolveEntitySkipCandidate({
        useEntityCache,
        generationCache,
        cacheKey,
        cacheFingerprint,
        useReuseStore,
        reuseStore,
        specInput,
        filesExist: defaultFilesExist,
    });

    if (!willSkip) {
        return { skipped: false };
    }

    const cachedEntry = generationCache!.get(cacheKey)!;
    return {
        skipped: true,
        files: cachedEntry.files,
        cacheDebug: Boolean(item.cacheDebug),
        input: item.input,
    };
}
