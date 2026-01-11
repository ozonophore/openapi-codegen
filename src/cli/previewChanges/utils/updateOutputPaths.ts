import { joinHelper } from '../../../common/utils/pathHelpers';
import { TRawOptions } from '../../schemas/configSchemas';

/**
 * Обновляет пути output в опциях для генерации в preview директорию
 */
export function updateOutputPaths(options: TRawOptions, previewDir: string): TRawOptions {
    if (options.items && Array.isArray(options.items)) {
        return {
            ...options,
            items: options.items.map(item => ({
                ...item,
                output: previewDir,
                outputCore: item.outputCore ? joinHelper(previewDir, 'core') : undefined,
                outputServices: item.outputServices ? joinHelper(previewDir, 'services') : undefined,
                outputModels: item.outputModels ? joinHelper(previewDir, 'models') : undefined,
                outputSchemas: item.outputSchemas ? joinHelper(previewDir, 'schemas') : undefined,
            })),
        };
    }

    return {
        ...options,
        output: previewDir,
        outputCore: options.outputCore ? joinHelper(previewDir, 'core') : undefined,
        outputServices: options.outputServices ? joinHelper(previewDir, 'services') : undefined,
        outputModels: options.outputModels ? joinHelper(previewDir, 'models') : undefined,
        outputSchemas: options.outputSchemas ? joinHelper(previewDir, 'schemas') : undefined,
    };
}