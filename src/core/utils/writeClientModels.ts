import { mkdirSync } from 'fs';

import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { dirNameHelper, relativeHelper, resolveHelper } from '../../common/utils/pathHelpers';
import { formatArtifactContent, type ReuseWriterContext, writeModelWithReuse } from '../reuseStore/reuseWriterHelpers';
import { Templates } from '../types/base/Templates.model';
import { HttpClient } from '../types/enums/HttpClient.enum';
import { ModelsLayout } from '../types/enums/ModelsLayout.enum';
import { ModelsMode } from '../types/enums/ModelsMode.enum';
import type { Model } from '../types/shared/Model.model';
import { WriteClient } from '../WriteClient';
import { isClassesBundleLayout, isClassesPerFileLayout } from './modelsLayoutHelpers';

/** Relative path from a per-file model directory to core (from models root). */
export function resolvePerFileOutputCore(outputCoreFromModelsRoot: string, modelPath: string): string {
    const modelDir = dirNameHelper(modelPath);
    if (!modelDir || modelDir === '.') {
        return outputCoreFromModelsRoot;
    }
    return relativeHelper(modelDir, outputCoreFromModelsRoot);
}

/**
 * @param models Array of Models to write
 * @param templates The loaded handlebar templates
 * @param outputModelsPath The folder for generating models
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param useUnionTypes Use union types instead of enums
 */
interface IWriteClientModels {
    models: Model[];
    templates: Templates;
    outputModelsPath: string;
    httpClient: HttpClient;
    useUnionTypes: boolean;
    useOptions?: boolean;
    modelsMode?: ModelsMode;
    modelsLayout?: ModelsLayout;
    outputCorePath?: string;
    prettierConfigPath?: string;
    reuse?: ReuseWriterContext;
}

/**
 * Generate Models using the Handlebar template and write to disk.
 * @param models Array of Models to write
 * @param templates The loaded handlebar templates
 * @param outputModelsPath The folder for generating models
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param useUnionTypes Use union types instead of enums
 */
export async function writeClientModels(this: WriteClient, options: IWriteClientModels): Promise<void> {
    const { models, templates, outputModelsPath, httpClient, useUnionTypes, modelsMode, modelsLayout, outputCorePath, useOptions, prettierConfigPath, reuse } = options;

    const effectivePrettierConfigPath = reuse?.prettierConfigPath ?? prettierConfigPath;

    this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.MODELS_START);

    if (isClassesBundleLayout(modelsMode, modelsLayout)) {
        const file = resolveHelper(outputModelsPath, 'models.ts');
        const templateResult = templates.exports.models({
            models,
            httpClient,
            useUnionTypes,
            useOptions,
            outputCore: outputCorePath || '../core',
            modelsMode,
            modelsLayout,
        });
        const formattedValue = await formatArtifactContent(templateResult, effectivePrettierConfigPath);
        await this.writeOutputFile(file, formattedValue);
        this.registerLintTarget(file, outputModelsPath);
        this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.FILE_RECORDED(file));
        this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.MODELS_FINISH);
        return;
    }

    for (const model of models) {
        const modelFolderPath = model?.path;

        if (!modelFolderPath) {
            continue;
        }

        const dir = dirNameHelper(modelFolderPath);
        if (dir) {
            const directory = resolveHelper(outputModelsPath, dir);

            this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.DIRECTORY_CREATING(directory));

            mkdirSync(directory, { recursive: true });
        }
        const file = resolveHelper(outputModelsPath, `${modelFolderPath}.ts`);

        this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.DATA_WRITE_START(file));

        const renderModel = async () => {
            if (isClassesPerFileLayout(modelsMode, modelsLayout)) {
                const outputCoreFromModelsRoot = outputCorePath || '../core';
                return formatArtifactContent(
                    templates.exports.classesModel({
                        ...model,
                        httpClient,
                        useUnionTypes,
                        useOptions,
                        outputCore: resolvePerFileOutputCore(outputCoreFromModelsRoot, modelFolderPath),
                        modelsMode,
                        modelsLayout,
                    }),
                    effectivePrettierConfigPath
                );
            }
            return formatArtifactContent(
                templates.exports.model({
                    ...model,
                    httpClient,
                    useUnionTypes,
                }),
                effectivePrettierConfigPath
            );
        };

        if (reuse) {
            const adapter = {
                writeOutputFile: (path: string, content: string) => this.writeOutputFile(path, content),
                registerLintTarget: (path: string, outputDir?: string) => this.registerLintTarget(path, outputDir ?? outputModelsPath),
            };
            await writeModelWithReuse(adapter, model, file, outputModelsPath, reuse, renderModel);
            this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.FILE_RECORDED(file));
            continue;
        }

        const formattedValue = await renderModel();
        await this.writeOutputFile(file, formattedValue);
        this.registerLintTarget(file, outputModelsPath);

        this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.FILE_RECORDED(file));
    }

    this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.MODELS_FINISH);
}
