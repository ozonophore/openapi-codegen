import { mkdirSync } from 'fs';

import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { dirNameHelper, relativeHelper, resolveHelper } from '../../common/utils/pathHelpers';
import type { OptionsSlice } from '../reuseStore';
import { ReuseStore } from '../reuseStore';
import { formatArtifactContent, type ReuseWriterContext, writeModelWithReuse } from '../reuseStore/reuseWriterHelpers';
import type { SharedFolderWriter } from '../reuseStore/SharedFolderWriter';
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
    reuseStore?: ReuseStore;
    optionsSlice?: OptionsSlice;
    specInput?: string;
    inputPath?: string;
    modelSchemas?: Map<string, Record<string, unknown>>;
    referencedArtifactKeys?: Set<string>;
    onReuseStat?: (hit: boolean) => void;
    reuseOnConflict?: 'fail' | 'namespace';
    sharedFolderWriter?: SharedFolderWriter;
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
    const {
        models,
        templates,
        outputModelsPath,
        httpClient,
        useUnionTypes,
        modelsMode,
        modelsLayout,
        outputCorePath,
        useOptions,
        prettierConfigPath,
        reuseStore,
        optionsSlice,
        specInput,
        inputPath,
        modelSchemas,
        referencedArtifactKeys,
        onReuseStat,
        reuseOnConflict,
        sharedFolderWriter,
    } = options;

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
        const formattedValue = await formatArtifactContent(templateResult, prettierConfigPath);
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
                    prettierConfigPath
                );
            }
            return formatArtifactContent(
                templates.exports.model({
                    ...model,
                    httpClient,
                    useUnionTypes,
                }),
                prettierConfigPath
            );
        };

        const canReuse = reuseStore && optionsSlice && specInput && modelSchemas;
        if (canReuse) {
            const reuseCtx: ReuseWriterContext = {
                reuseStore,
                optionsSlice,
                specInput,
                inputPath: inputPath ?? specInput,
                modelSchemas,
                referencedArtifactKeys,
                onReuseStat,
                reuseOnConflict,
                prettierConfigPath,
                sharedFolderWriter,
            };
            await writeModelWithReuse(this, model, file, outputModelsPath, reuseCtx, renderModel);
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
