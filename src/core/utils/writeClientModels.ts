import { mkdirSync } from 'fs';

import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { format } from '../../common/utils/format';
import { dirNameHelper, resolveHelper } from '../../common/utils/pathHelpers';
import { Templates } from '../types/base/Templates.model';
import { HttpClient } from '../types/enums/HttpClient.enum';
import { ModelsMode } from '../types/enums/ModelsMode.enum';
import type { Model } from '../types/shared/Model.model';
import { WriteClient } from '../WriteClient';

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
    outputCorePath?: string;
    prettierConfigPath?: string;
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
    const { models, templates, outputModelsPath, httpClient, useUnionTypes, modelsMode, outputCorePath, useOptions, prettierConfigPath } = options;

    this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.MODELS_START);

    if (modelsMode === ModelsMode.CLASSES) {
        const file = resolveHelper(outputModelsPath, 'models.ts');
        const templateResult = templates.exports.models({
            models,
            httpClient,
            useUnionTypes,
            useOptions,
            outputCore: outputCorePath || '../core',
            modelsMode,
        });
        const formattedValue = await format(templateResult);
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

        const templateResult = templates.exports.model({
            ...model,
            httpClient,
            useUnionTypes,
        });
        const formattedValue = await format(templateResult, undefined, prettierConfigPath);
        await this.writeOutputFile(file, formattedValue);
        this.registerLintTarget(file, outputModelsPath);

        this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.FILE_RECORDED(file));
    }

    this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.MODELS_FINISH);
}
