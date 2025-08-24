import { mkdirSync } from 'fs';

import { HttpClient } from '../types/enums/HttpClient.enum';
import type { Model } from '../types/shared/Model.model';
import { dirName, resolve } from '../utils/pathHelpers';
import { WriteClient } from '../WriteClient';
import { fileSystem } from './fileSystem';
import { format } from './format';
import { Templates } from './registerHandlebarTemplates';

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
    const { models, templates, outputModelsPath, httpClient, useUnionTypes } = options;

    this.logger.info('Recording of model files begins');

    for (const model of models) {
        const modelFolderPath = model?.path;

        if (!modelFolderPath) {
            return;
        }

        const dir = dirName(modelFolderPath);
        if (dir) {
            const directory = resolve(outputModelsPath, dir);

            this.logger.info(`A directory is being created: ${directory}`);

            mkdirSync(directory, { recursive: true });
        }
        const file = resolve(outputModelsPath, `${modelFolderPath}.ts`);

        this.logger.info(`The recording of the file data begins: ${file}`);

        const templateResult = templates.exports.model({
            ...model,
            httpClient,
            useUnionTypes,
        });
        const formattedValue = await format(templateResult);
        await fileSystem.writeFile(file, formattedValue);

        this.logger.info(`File recording completed: ${file}`);
    }

    this.logger.info('Model file recording completed successfully');
}
