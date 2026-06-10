import { mkdirSync } from 'fs';

import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { format } from '../../common/utils/format';
import { dirNameHelper, resolveHelper } from '../../common/utils/pathHelpers';
import { Templates } from '../types/base/Templates.model';
import { EmptySchemaStrategy } from '../types/enums/EmptySchemaStrategy.enum';
import { HttpClient } from '../types/enums/HttpClient.enum';
import { ValidationLibrary } from '../types/enums/ValidationLibrary.enum';
import type { Model } from '../types/shared/Model.model';
import { WriteClient } from '../WriteClient';

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
    validationLibrary?: ValidationLibrary;
    emptySchemaStrategy: EmptySchemaStrategy;
    prettierConfigPath?: string;
}

function isEmptySchemaModel(model: Model): boolean {
    return model.export === 'interface' && model.properties.length === 0;
}

/**
 * Generate Schemas using the Handlebar template and write to disk.
 * @param models Array of Models to write
 * @param templates The loaded handlebar templates
 * @param outputSchemasPath A folder for generating model diagrams
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param useUnionTypes Use union types instead of enums
 */
export async function writeClientSchemas(this: WriteClient, options: IWriteClientSchemas): Promise<Model[]> {
    const { models, templates, outputSchemasPath, httpClient, useUnionTypes, validationLibrary, emptySchemaStrategy, prettierConfigPath } = options;
    if (templates.exports.schema) {
        this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.SCHEMAS_START);

        const modelsToWrite = emptySchemaStrategy === EmptySchemaStrategy.SKIP ? models.filter(model => !isEmptySchemaModel(model)) : models;

        for (const model of modelsToWrite) {
            const modelFolderPath = model?.path;
            const dir = dirNameHelper(modelFolderPath);
            if (dir) {
                const directory = resolveHelper(outputSchemasPath, dir);

                this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.DIRECTORY_CREATING(directory));

                mkdirSync(directory, { recursive: true });
            }
            const file = resolveHelper(outputSchemasPath, `${modelFolderPath}Schema.ts`);

            this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.DATA_WRITE_START(file));

            const templateResult = templates.exports.schema({
                ...model,
                httpClient,
                useUnionTypes,
                validationLibrary,
                emptySchemaStrategy,
            });
            const formattedValue = await format(templateResult, undefined, prettierConfigPath);
            await this.writeOutputFile(file, formattedValue);

            this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.FILE_RECORDED(file));
        }

        this.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.SCHEMAS_FINISH);

        return modelsToWrite;
    }

    return [];
}
