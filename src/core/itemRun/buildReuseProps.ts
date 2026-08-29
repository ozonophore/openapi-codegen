import type { TStrictFlatOptions } from '../../common/TRawOptions';
import type { ItemRunContext } from '../GenerationBatchSession';
import { usesReuseStoreForItem } from '../generationCache/EntitySkip';
import type { ReuseWriterContext } from '../reuseStore/reuseWriterHelpers';
import type { OptionsSlice } from '../reuseStore/types';

export type ReuseProps = ReuseWriterContext;

export function buildReuseProps(
    item: TStrictFlatOptions,
    itemRunContext: ItemRunContext,
    modelSchemas: Map<string, Record<string, unknown>>,
    absoluteInput: string,
    specInput: string,
    optionsSlice: OptionsSlice
): ReuseProps | undefined {
    const { reuseStore } = itemRunContext;
    if (!usesReuseStoreForItem(item, reuseStore)) {
        return undefined;
    }

    return {
        reuseStore: reuseStore!,
        optionsSlice,
        specInput,
        inputPath: absoluteInput,
        modelSchemas,
        referencedArtifactKeys: itemRunContext.referencedArtifactKeys,
        onReuseStat: itemRunContext.onReuseStat,
        reuseOnConflict: item.reuseOnConflict,
        prettierConfigPath: item.prettierConfigPath,
        sharedFolderWriter: itemRunContext.sharedFolderWriter,
    };
}
