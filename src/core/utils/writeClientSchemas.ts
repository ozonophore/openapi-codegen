import { mkdirSync } from 'fs';

import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { format } from '../../common/utils/format';
import { dirNameHelper, resolveHelper } from '../../common/utils/pathHelpers';
import { HttpClient } from '../types/enums/HttpClient.enum';
import type { Model } from '../types/shared/Model.model';
import { WriteClient } from '../WriteClient';
import { Templates } from './registerHandlebarTemplates';

/**
 * @param models Array of Models to write
 * @param templates The loaded handlebar templates
 * @param outputSchemasPath A folder for generating model diagrams
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param useUnionTypes Use union types instead of enums
 */
interface IWriteClientSchemas {
    models: Model[];
    templates: Templates;
    outputSchemasPath: string;
    httpClient: HttpClient;
    useUnionTypes: boolean;
}

/**
 * Generate Schemas using the Handlebar template and write to disk.
 * @param models Array of Models to write
 * @param templates The loaded handlebar templates
 * @param outputSchemasPath A folder for generating model diagrams
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param useUnionTypes Use union types instead of enums
 */
export async function writeClientSchemas(this: WriteClient, options: IWriteClientSchemas): Promise<void> {
    const { models, templates, outputSchemasPath, httpClient, useUnionTypes } = options;

    this.logger.info('The recording of model validation schema files begins.');

    for (const model of models) {
        const modelFolderPath = model?.path;
        const dir = dirNameHelper(modelFolderPath);
        if (dir) {
            const directory = resolveHelper(outputSchemasPath, dir);

            this.logger.info(`A directory is being created: ${directory}`);

            mkdirSync(directory, { recursive: true });
        }
        const file = resolveHelper(outputSchemasPath, `${modelFolderPath}Schema.ts`);

        this.logger.info(`The recording of the file data begins: ${file}`);

        const templateResult = templates.exports.schema({
            ...model,
            httpClient,
            useUnionTypes,
        });
        const formattedValue = await format(templateResult);
        await fileSystemHelpers.writeFile(file, formattedValue);

        this.logger.info(`File recording completed: ${file}`);
    }

    this.logger.info('The recording of model validation schema files has been completed successfully');
}
