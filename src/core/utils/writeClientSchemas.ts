import { mkdirSync } from 'fs';

import type { Model } from '../client/interfaces/Model';
import { dirName, resolve } from '../core/path';
import { HttpClient } from '../HttpClient';
import { writeFile } from './fileSystem';
import { format } from './format';
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
export async function writeClientSchemas(options: IWriteClientSchemas): Promise<void> {
    const { models, templates, outputSchemasPath, httpClient, useUnionTypes } = options;
    for (const model of models) {
        const modelFolderPath = model?.path;
        const dir = dirName(modelFolderPath);
        if (dir) {
            const directory = resolve(outputSchemasPath, dir);
            // @ts-ignore
            mkdirSync(directory, { recursive: true });
        }
        const file = resolve(outputSchemasPath, `${modelFolderPath}Schema.ts`);
        const templateResult = templates.exports.schema({
            ...model,
            httpClient,
            useUnionTypes,
        });
        await writeFile(file, format(templateResult));
    }
}
