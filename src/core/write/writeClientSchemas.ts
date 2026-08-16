import { mkdirSync } from 'fs';

import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import { assertNotDriveRoot, dirNameHelper, resolveHelper } from '../../common/utils/pathHelpers';
import { type CoreOutputAdapter, toReuseOutputAdapter } from '../CoreOutputAdapter';
import { formatArtifactContent, type ReuseWriterContext, writeSchemaWithReuse } from '../reuseStore/reuseWriterHelpers';
import { Templates } from '../types/base/Templates.model';
import { EmptySchemaStrategy } from '../types/enums/EmptySchemaStrategy.enum';
import { HttpClient } from '../types/enums/HttpClient.enum';
import { ValidationLibrary } from '../types/enums/ValidationLibrary.enum';
import type { Model } from '../types/shared/Model.model';

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
    reuse?: ReuseWriterContext;
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
export async function writeClientSchemas(adapter: CoreOutputAdapter, options: IWriteClientSchemas): Promise<Model[]> {
    const { models, templates, outputSchemasPath, httpClient, useUnionTypes, validationLibrary, emptySchemaStrategy, prettierConfigPath, reuse } = options;
    if (templates.exports.schema) {
        assertNotDriveRoot(outputSchemasPath);
        adapter.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.SCHEMAS_START);

        const modelsToWrite = emptySchemaStrategy === EmptySchemaStrategy.SKIP ? models.filter(model => !isEmptySchemaModel(model)) : models;

        for (const model of modelsToWrite) {
            const modelFolderPath = model?.path;
            const dir = dirNameHelper(modelFolderPath);
            if (dir) {
                const directory = resolveHelper(outputSchemasPath, dir);
                assertNotDriveRoot(directory);

                adapter.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.DIRECTORY_CREATING(directory));

                mkdirSync(directory, { recursive: true });
            }
            const file = resolveHelper(outputSchemasPath, `${modelFolderPath}Schema.ts`);

            adapter.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.DATA_WRITE_START(file));

            if (reuse) {
                await writeSchemaWithReuse(toReuseOutputAdapter(adapter, outputSchemasPath), model, file, reuse, async () =>
                    formatArtifactContent(
                        templates.exports.schema({
                            ...model,
                            httpClient,
                            useUnionTypes,
                            validationLibrary,
                            emptySchemaStrategy,
                        }),
                        reuse.prettierConfigPath ?? prettierConfigPath
                    )
                );
                adapter.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.FILE_RECORDED(file));
                continue;
            }

            const templateResult = templates.exports.schema({
                ...model,
                httpClient,
                useUnionTypes,
                validationLibrary,
                emptySchemaStrategy,
            });
            const formattedValue = await formatArtifactContent(templateResult, prettierConfigPath);
            await adapter.writeOutputFile(file, formattedValue);

            adapter.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.FILE_RECORDED(file));
        }

        adapter.logger.info(LOGGER_MESSAGES.WRITE_CLIENT.SCHEMAS_FINISH);

        return modelsToWrite;
    }

    return [];
}
