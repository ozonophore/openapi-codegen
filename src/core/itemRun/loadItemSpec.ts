import type { TStrictFlatOptions } from '../../common/TRawOptions';
import { createResolvedContext, type LoadedSpec } from '../createResolvedContext';
import type { OpenApiGeneratorPlugin } from '../plugins/GeneratorPlugin.model';
import type { OutputPaths } from '../types/base/OutputPaths.model';

export async function loadItemSpec(
    absoluteInput: string,
    outputPaths: OutputPaths,
    item: Pick<TStrictFlatOptions, 'interfacePrefix' | 'enumPrefix' | 'typePrefix' | 'sortByRequired' | 'strictPluginMode'>,
    plugins: OpenApiGeneratorPlugin[]
): Promise<LoadedSpec> {
    return createResolvedContext({
        input: absoluteInput,
        output: outputPaths,
        prefix: { interface: item.interfacePrefix, enum: item.enumPrefix, type: item.typePrefix },
        sortByRequired: item.sortByRequired,
        plugins,
        strictPluginMode: item.strictPluginMode,
    });
}
