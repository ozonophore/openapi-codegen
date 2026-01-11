import { TRawOptions } from '../../../common/TRawOptions';
import { joinHelper, relativeHelper, resolveHelper } from '../../../common/utils/pathHelpers';

/**
 * Обновляет пути output в опциях для генерации в preview директорию
 * Удаляет generatedDir из путей и заменяет на previewDir
 * 
 * Пример: generatedDir = "./test/generated", output = "./test/generated/api"
 * Результат: output = "./generated-preview/api"
 */
export function updateOutputPaths(
    options: TRawOptions,
    previewDir: string,
    generatedDir: string
): TRawOptions {
    const resolvedGeneratedDir = resolveHelper(process.cwd(), generatedDir);
    // const resolvedPreviewDir = resolveHelper(process.cwd(), previewDir);

    /**
     * Заменяет путь, удаляя generatedDir и добавляя previewDir
     * Если путь находится внутри generatedDir, сохраняется относительная структура
     */
    const replacePath = (oldPath: string): string => {
        const resolvedOldPath = resolveHelper(process.cwd(), oldPath);
        let relativePath = relativeHelper(resolvedGeneratedDir, resolvedOldPath);
        
        // Убираем префикс ./ если он есть
        if (relativePath.startsWith('./')) {
            relativePath = relativePath.substring(2);
        }
        
        // Если путь пустой или равен текущей директории, возвращаем previewDir
        if (!relativePath || relativePath === '' || relativePath === './') {
            return previewDir;
        }
        
        // Используем previewDir (относительный путь) вместо resolvedPreviewDir
        return joinHelper(previewDir, relativePath);
    };

    /**
     * Обновляет output* пути относительно нового output
     * Если output* был указан явно, сохраняем его относительную структуру от старого output
     */
    const updateRelativePaths = (
        newOutput: string,
        oldOutput: string,
        oldOutputCore?: string,
        oldOutputServices?: string,
        oldOutputModels?: string,
        oldOutputSchemas?: string
    ) => {
        const resolvedOldOutput = resolveHelper(process.cwd(), oldOutput);
        const resolvedNewOutput = resolveHelper(process.cwd(), newOutput);
        
        const result: {
            outputCore?: string;
            outputServices?: string;
            outputModels?: string;
            outputSchemas?: string;
        } = {};

        // Для каждого output* пути, если он был указан, сохраняем относительную структуру
        if (oldOutputCore) {
            const resolvedOldCore = resolveHelper(process.cwd(), oldOutputCore);
            let relativeCore = relativeHelper(resolvedOldOutput, resolvedOldCore);
            if (relativeCore.startsWith('./')) {
                relativeCore = relativeCore.substring(2);
            }
            // Если относительный путь пустой, используем стандартное имя 'core'
            result.outputCore = relativeCore && relativeCore !== '' && relativeCore !== './'
                ? joinHelper(resolvedNewOutput, relativeCore)
                : joinHelper(resolvedNewOutput, 'core');
        }

        if (oldOutputServices) {
            const resolvedOldServices = resolveHelper(process.cwd(), oldOutputServices);
            let relativeServices = relativeHelper(resolvedOldOutput, resolvedOldServices);
            if (relativeServices.startsWith('./')) {
                relativeServices = relativeServices.substring(2);
            }
            result.outputServices = relativeServices && relativeServices !== '' && relativeServices !== './'
                ? joinHelper(resolvedNewOutput, relativeServices)
                : joinHelper(resolvedNewOutput, 'services');
        }

        if (oldOutputModels) {
            const resolvedOldModels = resolveHelper(process.cwd(), oldOutputModels);
            let relativeModels = relativeHelper(resolvedOldOutput, resolvedOldModels);
            if (relativeModels.startsWith('./')) {
                relativeModels = relativeModels.substring(2);
            }
            result.outputModels = relativeModels && relativeModels !== '' && relativeModels !== './'
                ? joinHelper(resolvedNewOutput, relativeModels)
                : joinHelper(resolvedNewOutput, 'models');
        }

        if (oldOutputSchemas) {
            const resolvedOldSchemas = resolveHelper(process.cwd(), oldOutputSchemas);
            let relativeSchemas = relativeHelper(resolvedOldOutput, resolvedOldSchemas);
            if (relativeSchemas.startsWith('./')) {
                relativeSchemas = relativeSchemas.substring(2);
            }
            result.outputSchemas = relativeSchemas && relativeSchemas !== '' && relativeSchemas !== './'
                ? joinHelper(resolvedNewOutput, relativeSchemas)
                : joinHelper(resolvedNewOutput, 'schemas');
        }

        return result;
    };

    if (options.items && Array.isArray(options.items)) {
        return {
            ...options,
            items: options.items.map(item => {
                const newOutput = replacePath(item.output);
                const relativePaths = updateRelativePaths(
                    newOutput,
                    item.output,
                    item.outputCore,
                    item.outputServices,
                    item.outputModels,
                    item.outputSchemas
                );
                
                return {
                    ...item,
                    output: newOutput,
                    ...relativePaths,
                };
            }),
        };
    }

    const newOutput = replacePath(options.output || '');
    const relativePaths = updateRelativePaths(
        newOutput,
        options.output || '',
        options.outputCore,
        options.outputServices,
        options.outputModels,
        options.outputSchemas
    );

    return {
        ...options,
        output: newOutput,
        ...relativePaths,
    };
}